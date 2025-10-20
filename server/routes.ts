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
      res.json({ url: decryptedUrl });
    } catch (error) {
      console.error("Error fetching stream:", error);
      res.status(500).json({ message: "Failed to fetch stream" });
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

      // Check for active sessions
      const activeSessions = await storage.getActiveSessionsForUser(userId);
      
      // If there's already an active session, return conflict
      if (activeSessions.length > 0) {
        return res.status(409).json({ 
          message: "Already streaming on another device",
          existingSession: true
        });
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

  // Cleanup expired sessions periodically
  setInterval(async () => {
    try {
      await storage.cleanupExpiredSessions();
    } catch (error) {
      console.error("Error cleaning up sessions:", error);
    }
  }, 60 * 1000); // Every minute

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
