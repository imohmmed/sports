import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { decryptUrl } from "./encryption";
import { generateStreamToken, verifyStreamToken, validateUrlHash } from "./stream-token";

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

      let streamUrl: string;
      
      // For nested resources (segments, sub-playlists), URL is in token
      // For master playlists, rebuild from database
      if (payload.url) {
        streamUrl = payload.url;
        
        // Validate URL hash for security
        if (!validateUrlHash(streamUrl, payload.urlHash)) {
          console.error(`[Secure Stream] URL hash mismatch for nested resource`);
          return res.status(403).json({ message: "Invalid stream token" });
        }
      } else {
        // Rebuild URL from database for master playlist
        const streams = await storage.getChannelStreams(payload.channelId);
        const stream = streams.find(s => 
          s.quality === payload.quality && (s.serverName || "main") === payload.server
        );
        
        if (!stream) {
          console.error(`[Secure Stream] Stream not found for channel ${payload.channelId}`);
          return res.status(404).json({ message: "Stream not found" });
        }

        streamUrl = decryptUrl(stream.encryptedUrl);
        
        // Validate that the URL matches the hash in the token (defense in depth)
        if (!validateUrlHash(streamUrl, payload.urlHash)) {
          console.error(`[Secure Stream] URL hash mismatch for channel ${payload.channelId}`);
          return res.status(403).json({ message: "Invalid stream token" });
        }
      }

      // Security: Validate hostname even with token to prevent SSRF
      const allowedHosts = ["tecflix.vip"];
      let parsedUrl: URL;
      
      try {
        parsedUrl = new URL(streamUrl);
      } catch {
        console.error("[Secure Stream] Invalid URL in token");
        return res.status(400).json({ message: "Invalid URL" });
      }

      const isAllowed = allowedHosts.some(host => 
        parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
      );

      if (!isAllowed) {
        console.error(`[Secure Stream] Blocked unauthorized host: ${parsedUrl.hostname}`);
        return res.status(403).json({ message: "Unauthorized host" });
      }

      console.log(`[Secure Stream] Validated token for channel ${payload.channelId}, quality ${payload.quality}`);
      
      // Build upstream headers (forward Range, If-Range, etc. for partial content support)
      const upstreamHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'http://tecflix.vip',
      };
      
      if (req.headers.range) {
        upstreamHeaders['Range'] = req.headers.range;
      }
      if (req.headers['if-range']) {
        upstreamHeaders['If-Range'] = req.headers['if-range'] as string;
      }
      if (req.headers['if-none-match']) {
        upstreamHeaders['If-None-Match'] = req.headers['if-none-match'] as string;
      }
      if (req.headers['if-modified-since']) {
        upstreamHeaders['If-Modified-Since'] = req.headers['if-modified-since'] as string;
      }

      // Setup abort controller for timeout and client disconnect
      const abortController = new AbortController();
      const fetchTimeout = setTimeout(() => abortController.abort(), 30000); // 30s timeout
      
      req.on('close', () => {
        clearTimeout(fetchTimeout);
        abortController.abort();
      });

      // Fetch and proxy the stream
      const response = await fetch(streamUrl, {
        headers: upstreamHeaders,
        signal: abortController.signal,
      }).catch((error) => {
        clearTimeout(fetchTimeout);
        if (error.name === 'AbortError') {
          console.error('[Secure Stream] Request aborted (timeout or client disconnect)');
        }
        throw error;
      });

      clearTimeout(fetchTimeout);

      // Handle 304 Not Modified correctly
      if (response.status === 304) {
        res.status(304);
        if (response.headers.get("etag")) {
          res.setHeader("ETag", response.headers.get("etag")!);
        }
        if (response.headers.get("last-modified")) {
          res.setHeader("Last-Modified", response.headers.get("last-modified")!);
        }
        return res.end();
      }

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
        
        // Helper function to convert relative/absolute URLs to signed URLs
        const rewriteUrl = (url: string): string => {
          let absoluteUrl = "";
          
          if (url.includes("://")) {
            absoluteUrl = url;
          } else if (url.startsWith("/")) {
            absoluteUrl = origin + url;
          } else {
            absoluteUrl = baseUrl + url;
          }
          
          // For nested resources, include URL in token (they're not in DB)
          const nestedToken = generateStreamToken(absoluteUrl, payload.channelId, payload.quality, payload.server, true);
          return `/api/secure-stream?token=${nestedToken}`;
        };
        
        // Rewrite URLs in M3U8 (segments, playlists, keys, maps)
        const proxiedContent = text.split("\n").map(line => {
          const trimmed = line.trim();
          
          // Handle #EXT-X-KEY URI="..." 
          if (trimmed.startsWith("#EXT-X-KEY")) {
            return line.replace(/URI="([^"]+)"/g, (match, url) => {
              return `URI="${rewriteUrl(url)}"`;
            });
          }
          
          // Handle #EXT-X-MAP URI="..."
          if (trimmed.startsWith("#EXT-X-MAP")) {
            return line.replace(/URI="([^"]+)"/g, (match, url) => {
              return `URI="${rewriteUrl(url)}"`;
            });
          }
          
          // Skip comments and empty lines
          if (trimmed.startsWith("#") || !trimmed) {
            return line;
          }
          
          // Handle segment URLs (.ts, .m3u8, .m4s, .mp4, .aac, etc.) including query strings
          const segmentExtensions = [".ts", ".m3u8", ".m4s", ".mp4", ".aac", ".vtt"];
          const hasSegmentExtension = segmentExtensions.some(ext => {
            const urlWithoutQuery = trimmed.split('?')[0];
            return urlWithoutQuery.endsWith(ext);
          });
          const isSegment = hasSegmentExtension || 
                           trimmed.includes("://") || 
                           trimmed.startsWith("/");
          
          if (isSegment) {
            return rewriteUrl(trimmed);
          }
          
          return line;
        }).join("\n");
        
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "private, no-cache, must-revalidate");
        res.send(proxiedContent);
      } else {
        // Stream video segments directly with true streaming (no buffering)
        res.status(response.status);
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "private, max-age=3600");
        
        // Forward all relevant headers for partial content and caching
        if (response.headers.get("content-length")) {
          res.setHeader("Content-Length", response.headers.get("content-length")!);
        }
        if (response.headers.get("accept-ranges")) {
          res.setHeader("Accept-Ranges", response.headers.get("accept-ranges")!);
        }
        if (response.headers.get("content-range")) {
          res.setHeader("Content-Range", response.headers.get("content-range")!);
        }
        if (response.headers.get("etag")) {
          res.setHeader("ETag", response.headers.get("etag")!);
        }
        if (response.headers.get("last-modified")) {
          res.setHeader("Last-Modified", response.headers.get("last-modified")!);
        }
        
        // Stream response body directly with proper backpressure handling
        if (response.body) {
          const reader = response.body.getReader();
          
          // Handle client disconnect during streaming
          req.on('close', () => {
            reader.cancel().catch(() => {});
          });
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              // Check if response is still writable
              if (!res.writable) {
                reader.cancel();
                break;
              }
              
              // Write with backpressure handling
              if (!res.write(value)) {
                // Wait for drain event before continuing
                await new Promise((resolve) => res.once('drain', resolve));
              }
            }
            res.end();
          } catch (error: any) {
            console.error("[Secure Stream] Streaming error:", error.message);
            reader.cancel();
            if (!res.headersSent) {
              res.status(500).json({ message: "Stream error" });
            } else if (res.writable) {
              res.end();
            }
          }
        } else {
          // Fallback to buffering if body is not available
          const buffer = await response.arrayBuffer();
          res.send(Buffer.from(buffer));
        }
      }
    } catch (error: any) {
      console.error("[Secure Stream] Error:", error.message || error);
      res.status(500).json({ message: "Stream error", error: error.message });
    }
  });

  // Legacy proxy endpoint - DISABLED for security
  // This endpoint bypassed JWT authentication and is replaced by /api/secure-stream
  app.get("/api/proxy-stream", async (req, res) => {
    return res.status(410).json({ 
      message: "This endpoint has been disabled for security reasons. Use /api/secure-stream with JWT tokens instead.",
      migrationGuide: "Get a signed token from /api/stream/:channelId/:quality, then access /api/secure-stream?token=<jwt>"
    });
  });

  // Original proxy implementation (kept for reference, commented out)
  /*
  app.get("/api/proxy-stream-legacy", async (req, res) => {
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
  */

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
