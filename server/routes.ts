import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { decryptUrl } from "./encryption";
import { generateStreamToken, verifyStreamToken } from "./stream-token";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all channels (public)
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getAllChannels();
      const channelsWithStreams = await Promise.all(
        channels.map(async (channel) => {
          const streams = await storage.getChannelStreams(channel.id);
          
          // Group streams by server and quality
          const streamsByServer: Record<string, any[]> = {};
          streams.forEach((s) => {
            const serverName = s.serverName || "main";
            if (!streamsByServer[serverName]) {
              streamsByServer[serverName] = [];
            }
            streamsByServer[serverName].push({
              quality: s.quality,
              available: true,
            });
          });

          return {
            id: channel.id,
            name: channel.name,
            category: channel.category,
            servers: Object.keys(streamsByServer).map(serverName => ({
              name: serverName,
              qualities: streamsByServer[serverName],
            })),
          };
        })
      );
      res.json(channelsWithStreams);
    } catch (error) {
      console.error("Error fetching channels:", error);
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  // Get signed stream URL with JWT token for security
  app.get("/api/stream/:channelId/:quality", async (req, res) => {
    try {
      const { channelId, quality } = req.params;
      const { server } = req.query;
      const serverName = (server as string) || "main";

      const streams = await storage.getChannelStreams(channelId);
      const stream = streams.find(s => 
        s.quality === quality && (s.serverName || "main") === serverName
      );
      
      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }

      const decryptedUrl = decryptUrl(stream.encryptedUrl);
      
      // Generate JWT token with 15-minute expiry
      const token = generateStreamToken(decryptedUrl, channelId, quality, serverName);
      
      // Return secure URL with token
      res.json({ url: `/api/secure-stream?token=${token}` });
    } catch (error) {
      console.error("Error fetching stream:", error);
      res.status(500).json({ message: "Failed to fetch stream" });
    }
  });

  // Secure stream endpoint that validates JWT token
  app.get("/api/secure-stream", async (req, res) => {
    try {
      const token = req.query.token as string;
      
      if (!token) {
        return res.status(401).json({ message: "Missing authentication token" });
      }

      // Verify and decode token
      const payload = verifyStreamToken(token);
      
      if (!payload) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const { url: streamUrl } = payload;

      console.log(`[Secure Stream] Validated token for channel ${payload.channelId}, quality ${payload.quality}`);
      console.log(`[Secure Stream] Fetching: ${streamUrl}`);

      // Fetch and proxy the stream
      const response = await fetch(streamUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'http://tecflix.vip',
        },
      });

      if (!response.ok) {
        console.error(`[Secure Stream] Failed: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ 
          message: `Stream unavailable: ${response.statusText}` 
        });
      }

      const contentType = response.headers.get("content-type") || "";

      // Handle M3U8 playlists
      if (contentType.includes("mpegurl") || contentType.includes("m3u8") || streamUrl.endsWith(".m3u8")) {
        const text = await response.text();
        
        if (!text || text.trim().length === 0 || !text.includes("#EXTM3U")) {
          console.error("[Secure Stream] Invalid M3U8 content");
          return res.status(500).json({ message: "Invalid stream format" });
        }
        
        const urlObj = new URL(streamUrl);
        const baseUrl = streamUrl.substring(0, streamUrl.lastIndexOf("/") + 1);
        const origin = `${urlObj.protocol}//${urlObj.host}`;
        
        // Rewrite URLs in M3U8 to use secure streaming with token
        const proxiedContent = text.split("\n").map(line => {
          const trimmed = line.trim();
          
          if (trimmed.startsWith("#") || !trimmed) {
            return line;
          }
          
          let absoluteUrl = "";
          
          if (trimmed.includes("://")) {
            absoluteUrl = trimmed;
          } else if (trimmed.startsWith("/")) {
            absoluteUrl = origin + trimmed;
          } else if (trimmed.endsWith(".m3u8") || trimmed.endsWith(".ts")) {
            absoluteUrl = baseUrl + trimmed;
          } else {
            return line;
          }
          
          // Generate new token for nested resources
          const nestedToken = generateStreamToken(absoluteUrl, payload.channelId, payload.quality, payload.server);
          return `/api/secure-stream?token=${nestedToken}`;
        }).join("\n");
        
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-cache");
        res.send(proxiedContent);
      } else {
        // Stream video segments directly
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=31536000");
        
        if (req.headers.range && response.headers.get("accept-ranges")) {
          res.setHeader("Accept-Ranges", "bytes");
        }
        
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (error: any) {
      console.error("[Secure Stream] Error:", error.message || error);
      res.status(500).json({ message: "Stream error", error: error.message });
    }
  });

  // Proxy video streams to handle CORS and mixed content issues
  app.get("/api/proxy-stream", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).json({ message: "Missing URL parameter" });
      }

      // Security: Validate URL to prevent SSRF attacks
      const allowedHosts = ["tecflix.vip"];
      let parsedUrl: URL;
      
      try {
        parsedUrl = new URL(targetUrl);
      } catch {
        return res.status(400).json({ message: "Invalid URL" });
      }

      // Check if hostname is in allowlist
      const isAllowed = allowedHosts.some(host => 
        parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
      );

      if (!isAllowed) {
        console.error(`[Proxy] Blocked unauthorized host: ${parsedUrl.hostname}`);
        return res.status(403).json({ message: "Unauthorized host" });
      }

      console.log(`[Proxy] Fetching: ${targetUrl}`);

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        console.log(`[Proxy] Failed to fetch: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ 
          message: `Failed to fetch stream: ${response.statusText}` 
        });
      }

      const contentType = response.headers.get("content-type") || "";
      console.log(`[Proxy] Content-Type: ${contentType}`);

      // If it's an M3U8 playlist, rewrite URLs to go through our proxy
      if (contentType.includes("mpegurl") || contentType.includes("m3u8")) {
        const text = await response.text();
        
        if (!text || text.trim().length === 0) {
          console.error("[Proxy] Empty M3U8 response");
          return res.status(500).json({ message: "Empty playlist" });
        }
        
        console.log(`[Proxy] M3U8 content (first 200 chars): ${text.substring(0, 200)}`);
        
        // Extract base URL components
        const urlObj = new URL(targetUrl);
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);
        const origin = `${urlObj.protocol}//${urlObj.host}`;
        
        // Rewrite relative URLs in M3U8 to go through our proxy
        const proxiedContent = text.split("\n").map(line => {
          const trimmed = line.trim();
          
          // Skip comments and empty lines
          if (trimmed.startsWith("#") || !trimmed) {
            return line;
          }
          
          // Determine absolute URL based on path type
          let absoluteUrl = "";
          
          if (trimmed.includes("://")) {
            // Already absolute URL
            absoluteUrl = trimmed;
          } else if (trimmed.startsWith("/")) {
            // Absolute path from root (e.g., /hls/...)
            absoluteUrl = origin + trimmed;
          } else if (trimmed.endsWith(".m3u8") || trimmed.endsWith(".ts")) {
            // Relative path
            absoluteUrl = baseUrl + trimmed;
          } else {
            // Not a URL, return as-is
            return line;
          }
          
          return `/api/proxy-stream?url=${encodeURIComponent(absoluteUrl)}`;
        }).join("\n");
        
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(proxiedContent);
      } else {
        // For other content (video segments, etc.), stream as-is
        res.setHeader("Content-Type", contentType);
        
        // Handle range requests for video streaming
        if (req.headers.range && response.headers.get("accept-ranges")) {
          res.setHeader("Accept-Ranges", "bytes");
        }
        
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (error: any) {
      console.error("[Proxy] Error:", error.message || error);
      res.status(500).json({ message: "Proxy failed", error: error.message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
