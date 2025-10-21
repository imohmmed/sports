// Reference: Replit Auth integration blueprint
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { decryptUrl } from "./encryption";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all channels (public - shows locked state if not subscribed)
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getAllChannels();
      const channelsWithStreams = await Promise.all(
        channels.map(async (channel) => {
          const streams = await storage.getChannelStreams(channel.id);
          return {
            id: channel.id,
            name: channel.name,
            qualities: streams.map((s) => ({
              quality: s.quality,
              available: true,
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

  // Get decrypted stream URL (requires subscription)
  app.get("/api/stream/:channelId/:quality", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { channelId, quality } = req.params;

      const user = await storage.getUser(userId);
      if (!user?.isSubscribed) {
        return res.status(403).json({ message: "Subscription required" });
      }

      // Check if subscription has expired
      if (user.subscriptionExpiresAt) {
        const now = new Date();
        const expiresAt = new Date(user.subscriptionExpiresAt);
        
        if (expiresAt <= now) {
          // Auto-deactivate expired subscription
          await storage.updateUserSubscription(userId, false);
          return res.status(403).json({ 
            message: "Subscription expired",
            expiredAt: user.subscriptionExpiresAt 
          });
        }
      }

      const streams = await storage.getChannelStreams(channelId);
      const stream = streams.find((s) => s.quality === quality);

      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }

      const decryptedUrl = decryptUrl(stream.encryptedUrl);
      
      // Return proxied URL instead of direct URL to avoid CORS and Mixed Content issues
      const proxyUrl = `/api/proxy-stream?url=${encodeURIComponent(decryptedUrl)}`;
      
      // Prevent caching to ensure latest URL is always used
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      
      res.json({ url: proxyUrl });
    } catch (error) {
      console.error("Error fetching stream:", error);
      res.status(500).json({ message: "Failed to fetch stream" });
    }
  });

  // Proxy endpoint for streaming content (handles CORS and Mixed Content)
  app.get("/api/proxy-stream", isAuthenticated, async (req: any, res) => {
    try {
      const targetUrl = req.query.url as string;
      
      if (!targetUrl) {
        return res.status(400).json({ message: "URL parameter required" });
      }

      console.log(`[Proxy] Fetching: ${targetUrl}`);

      // Fetch the content from the target URL with proper headers
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "*/*",
        },
      });
      
      if (!response.ok) {
        console.error(`[Proxy] Failed to fetch: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ message: "Failed to fetch stream" });
      }

      const contentType = response.headers.get("content-type") || "";
      console.log(`[Proxy] Content-Type: ${contentType}`);

      // Enable CORS
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
      res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range");
      
      // If it's an M3U8 playlist, rewrite URLs to go through proxy
      if (contentType.includes("mpegurl") || contentType.includes("m3u8") || contentType.includes("x-mpegURL") || targetUrl.endsWith(".m3u8")) {
        const text = await response.text();
        
        if (!text || text.length === 0) {
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

  // Create viewing session (for concurrent device enforcement)
  app.post("/api/session/create", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { channelId } = req.body;

      const user = await storage.getUser(userId);
      if (!user?.isSubscribed) {
        return res.status(403).json({ message: "Subscription required" });
      }

      // Check if subscription has expired
      if (user.subscriptionExpiresAt) {
        const now = new Date();
        const expiresAt = new Date(user.subscriptionExpiresAt);
        
        if (expiresAt <= now) {
          await storage.updateUserSubscription(userId, false);
          return res.status(403).json({ 
            message: "Subscription expired",
            expiredAt: user.subscriptionExpiresAt 
          });
        }
      }

      // Clean up expired sessions first
      await storage.cleanupExpiredSessions();
      
      // End all existing active sessions for this user (force new session)
      const activeSessions = await storage.getActiveSessionsForUser(userId);
      for (const session of activeSessions) {
        await storage.deleteSession(session.sessionToken);
      }

      // Create new session
      const sessionToken = randomUUID();
      await storage.createActiveSession({
        userId,
        channelId,
        sessionToken,
      });

      res.json({ sessionToken });
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Update session heartbeat
  app.post("/api/session/heartbeat", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionToken } = req.body;
      await storage.updateSessionHeartbeat(sessionToken);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating heartbeat:", error);
      res.status(500).json({ message: "Failed to update heartbeat" });
    }
  });

  // End viewing session
  app.post("/api/session/end", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionToken } = req.body;
      await storage.deleteSession(sessionToken);
      res.json({ success: true });
    } catch (error) {
      console.error("Error ending session:", error);
      res.status(500).json({ message: "Failed to end session" });
    }
  });

  // Admin: Get all users
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = req.user.claims.sub;
      const requestingUser = await storage.getUser(requestingUserId);

      if (!requestingUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin: Get subscription stats
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = req.user.claims.sub;
      const requestingUser = await storage.getUser(requestingUserId);

      if (!requestingUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getSubscriptionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin: Update user subscription
  app.post("/api/admin/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = req.user.claims.sub;
      const requestingUser = await storage.getUser(requestingUserId);

      if (!requestingUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId, isSubscribed, durationMonths } = req.body;
      await storage.updateUserSubscription(userId, isSubscribed, durationMonths);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Admin: Update user admin status
  app.post("/api/admin/admin-status", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = req.user.claims.sub;
      const requestingUser = await storage.getUser(requestingUserId);

      if (!requestingUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId, isAdmin } = req.body;
      
      // Prevent removing own admin status
      if (userId === requestingUserId && !isAdmin) {
        return res.status(400).json({ message: "Cannot remove your own admin privileges" });
      }

      await storage.updateUserAdminStatus(userId, isAdmin);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating admin status:", error);
      res.status(500).json({ message: "Failed to update admin status" });
    }
  });

  // Cleanup expired sessions periodically (every 30 seconds)
  setInterval(async () => {
    try {
      await storage.cleanupExpiredSessions();
    } catch (error) {
      console.error("Error cleaning up sessions:", error);
    }
  }, 30 * 1000); // Every 30 seconds

  const httpServer = createServer(app);

  // WebSocket for real-time session management
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "heartbeat" && data.sessionToken) {
          await storage.updateSessionHeartbeat(data.sessionToken);
          ws.send(JSON.stringify({ type: "heartbeat_ack" }));
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });
  });

  return httpServer;
}
