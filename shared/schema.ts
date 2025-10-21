// Reference: Replit Auth integration blueprint for users and sessions tables
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isSubscribed: boolean("is_subscribed").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Channels table
export const channels = pgTable("channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: varchar("category").notNull().default("sports"), // "sports" or "news"
  displayOrder: integer("display_order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
  createdAt: true,
});

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

// Channel streams table (for multiple quality options)
export const channelStreams = pgTable("channel_streams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id")
    .notNull()
    .references(() => channels.id, { onDelete: "cascade" }),
  quality: varchar("quality").notNull(), // FHD, HD, LOW, or server name for single quality channels
  serverName: varchar("server_name").default("main"), // "main" or "BK"
  encryptedUrl: text("encrypted_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChannelStreamSchema = createInsertSchema(channelStreams).omit({
  id: true,
  createdAt: true,
});

export type InsertChannelStream = z.infer<typeof insertChannelStreamSchema>;
export type ChannelStream = typeof channelStreams.$inferSelect;

// Active viewing sessions table (for concurrent device enforcement)
export const activeSessions = pgTable("active_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  channelId: varchar("channel_id")
    .notNull()
    .references(() => channels.id, { onDelete: "cascade" }),
  sessionToken: varchar("session_token").notNull().unique(),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActiveSession = typeof activeSessions.$inferSelect;
export type InsertActiveSession = typeof activeSessions.$inferInsert;
