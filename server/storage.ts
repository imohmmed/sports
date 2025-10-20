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
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSubscription(userId: string, isSubscribed: boolean, durationMonths?: number): Promise<void>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getSubscriptionStats(): Promise<{
    totalUsers: number;
    activeSubscribers: number;
    expiredSubscribers: number;
    inactiveUsers: number;
  }>;
  
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
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

  async updateUserSubscription(
    userId: string, 
    isSubscribed: boolean, 
    durationMonths?: number
  ): Promise<void> {
    const updateData: any = { 
      isSubscribed, 
      updatedAt: new Date() 
    };
    
    if (isSubscribed && durationMonths) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
      updateData.subscriptionExpiresAt = expiresAt;
    } else if (!isSubscribed) {
      updateData.subscriptionExpiresAt = null;
    }
    
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getSubscriptionStats(): Promise<{
    totalUsers: number;
    activeSubscribers: number;
    expiredSubscribers: number;
    inactiveUsers: number;
  }> {
    const allUsers = await db.select().from(users);
    const now = new Date();
    
    const activeSubscribers = allUsers.filter(
      u => u.isSubscribed && (!u.subscriptionExpiresAt || u.subscriptionExpiresAt > now)
    ).length;
    
    const expiredSubscribers = allUsers.filter(
      u => u.isSubscribed && u.subscriptionExpiresAt && u.subscriptionExpiresAt <= now
    ).length;
    
    const inactiveUsers = allUsers.filter(u => !u.isSubscribed).length;
    
    return {
      totalUsers: allUsers.length,
      activeSubscribers,
      expiredSubscribers,
      inactiveUsers,
    };
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
    // Consider sessions active if heartbeat within last 90 seconds
    const ninetySecondsAgo = new Date(Date.now() - 90 * 1000);
    return await db
      .select()
      .from(activeSessions)
      .where(
        and(
          eq(activeSessions.userId, userId),
          gt(activeSessions.lastHeartbeat, ninetySecondsAgo)
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
    // Clean up sessions older than 90 seconds (1.5 minutes)
    const ninetySecondsAgo = new Date(Date.now() - 90 * 1000);
    await db
      .delete(activeSessions)
      .where(lt(activeSessions.lastHeartbeat, ninetySecondsAgo));
  }
}

export const storage = new DatabaseStorage();
