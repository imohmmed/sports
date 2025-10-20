// Reference: Replit Auth integration blueprint
import {
  users,
  channels,
  channelStreams,
  activeSessions,
  type User,
  type UpsertUser,
  type Channel,
  type InsertChannel,
  type ChannelStream,
  type InsertChannelStream,
  type ActiveSession,
  type InsertActiveSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lt } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSubscription(userId: string, isSubscribed: boolean): Promise<void>;
  
  // Channel operations
  getAllChannels(): Promise<Channel[]>;
  getChannelStreams(channelId: string): Promise<ChannelStream[]>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  createChannelStream(stream: InsertChannelStream): Promise<ChannelStream>;
  
  // Active session operations (for concurrent device enforcement)
  createActiveSession(session: InsertActiveSession): Promise<ActiveSession>;
  getActiveSessionsForUser(userId: string): Promise<ActiveSession[]>;
  updateSessionHeartbeat(sessionToken: string): Promise<void>;
  deleteSession(sessionToken: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserSubscription(userId: string, isSubscribed: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isSubscribed, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Channel operations
  async getAllChannels(): Promise<Channel[]> {
    return await db.select().from(channels).orderBy(channels.displayOrder);
  }

  async getChannelStreams(channelId: string): Promise<ChannelStream[]> {
    return await db
      .select()
      .from(channelStreams)
      .where(eq(channelStreams.channelId, channelId));
  }

  async createChannel(channelData: InsertChannel): Promise<Channel> {
    const [channel] = await db.insert(channels).values(channelData).returning();
    return channel;
  }

  async createChannelStream(streamData: InsertChannelStream): Promise<ChannelStream> {
    const [stream] = await db.insert(channelStreams).values(streamData).returning();
    return stream;
  }

  // Active session operations
  async createActiveSession(sessionData: InsertActiveSession): Promise<ActiveSession> {
    const [session] = await db.insert(activeSessions).values(sessionData).returning();
    return session;
  }

  async getActiveSessionsForUser(userId: string): Promise<ActiveSession[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return await db
      .select()
      .from(activeSessions)
      .where(
        and(
          eq(activeSessions.userId, userId),
          gt(activeSessions.lastHeartbeat, fiveMinutesAgo)
        )
      );
  }

  async updateSessionHeartbeat(sessionToken: string): Promise<void> {
    await db
      .update(activeSessions)
      .set({ lastHeartbeat: new Date() })
      .where(eq(activeSessions.sessionToken, sessionToken));
  }

  async deleteSession(sessionToken: string): Promise<void> {
    await db.delete(activeSessions).where(eq(activeSessions.sessionToken, sessionToken));
  }

  async cleanupExpiredSessions(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await db
      .delete(activeSessions)
      .where(and(activeSessions.lastHeartbeat, lt(activeSessions.lastHeartbeat, fiveMinutesAgo)));
  }
}

export const storage = new DatabaseStorage();
