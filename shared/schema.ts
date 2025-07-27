import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Additional fields for the app
  fullName: varchar("full_name"),
  dateOfBirth: timestamp("date_of_birth"),
  mobileNumber: varchar("mobile_number"),
  countryCode: varchar("country_code").default('+91'),
  address: text("address"),
  passwordHash: varchar("password_hash"),
  isActive: boolean("is_active").default(true),
  wellBeingFrequency: varchar("well_being_frequency").default('daily'), // daily, weekly
  lastWellBeingCheck: timestamp("last_well_being_check"),
  wellBeingCounter: integer("well_being_counter").default(0),
  maxWellBeingLimit: integer("max_well_being_limit").default(15),
  alertFrequency: varchar("alert_frequency").default('daily'),
  customDays: integer("custom_days"),
  alertTime: varchar("alert_time").default('09:00'),
  enableSMS: boolean("enable_sms").default(true),
  enableEmail: boolean("enable_email").default(true),
  escalationEnabled: boolean("escalation_enabled").default(true),
  isAdmin: boolean("is_admin").default(false),
  accountStatus: varchar("account_status").default('active'), // active, suspended, deactivated
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mood tracking table
export const moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mood: varchar("mood").notNull(), // happy, sad, stressed, calm, excited, tired, etc.
  emoji: varchar("emoji").notNull(), // 😊, 😢, 😰, 😌, 🤩, 😴, etc.
  notes: text("notes"), // Optional user notes
  createdAt: timestamp("created_at").defaultNow(),
});

// Self-care recommendations table
export const selfCareRecommendations = pgTable("self_care_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  recommendationType: varchar("recommendation_type").notNull(), // breathing, exercise, meditation, social, nutrition, sleep
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions"),
  durationMinutes: integer("duration_minutes"),
  contextTrigger: varchar("context_trigger"), // stress, sadness, anxiety, fatigue, etc.
  priority: varchar("priority").default('medium'), // low, medium, high
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  feedback: varchar("feedback"), // helpful, not_helpful, skip
  createdAt: timestamp("created_at").defaultNow(),
});

// User wellness preferences table
export const wellnessPreferences = pgTable("wellness_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  preferredActivities: text("preferred_activities").array(), // meditation, exercise, reading, music, etc.
  availableTime: varchar("available_time").default('15'), // 5, 15, 30, 60 minutes
  notificationFrequency: varchar("notification_frequency").default('smart'), // smart, daily, weekly, never
  personalityType: varchar("personality_type"), // introvert, extrovert, ambivert
  stressIndicators: text("stress_indicators").array(), // work, relationships, health, finances
  calmingActivities: text("calming_activities").array(),
  energizingActivities: text("energizing_activities").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nominees = pgTable("nominees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fullName: varchar("full_name").notNull(),
  relationship: varchar("relationship").notNull(),
  mobileNumber: varchar("mobile_number").notNull(),
  email: varchar("email"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  assetType: varchar("asset_type").notNull(), // bank_account, real_estate, cryptocurrency, investment, loan
  title: varchar("title").notNull(),
  description: text("description"),
  value: varchar("value"), // Changed to varchar for consistency
  currency: varchar("currency").default('USD'),
  contactInfo: varchar("contact_info"), // Combined contact info
  storageLocation: varchar("storage_location").default('local'), // google_drive, digilocker, local
  accessInstructions: text("access_instructions"), // How to access the asset
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wellBeingAlerts = pgTable("well_being_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  alertType: varchar("alert_type").notNull(), // well_being_check, admin_escalation
  status: varchar("status").default('pending'), // pending, responded, escalated
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const adminActions = pgTable("admin_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  actionType: varchar("action_type").notNull(), // death_validation, nominee_notification
  status: varchar("status").default('pending'), // pending, approved, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  fullName: true,
  dateOfBirth: true,
  mobileNumber: true,
  countryCode: true,
  address: true,
  passwordHash: true,
});

export const insertNomineeSchema = createInsertSchema(nominees).omit({
  id: true,
  createdAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWellBeingAlertSchema = createInsertSchema(wellBeingAlerts).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertAdminActionSchema = createInsertSchema(adminActions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
});

export const insertSelfCareRecommendationSchema = createInsertSchema(selfCareRecommendations).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertWellnessPreferencesSchema = createInsertSchema(wellnessPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Nominee = typeof nominees.$inferSelect;
export type InsertNominee = z.infer<typeof insertNomineeSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type WellBeingAlert = typeof wellBeingAlerts.$inferSelect;
export type InsertWellBeingAlert = z.infer<typeof insertWellBeingAlertSchema>;
export type AdminAction = typeof adminActions.$inferSelect;
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type SelfCareRecommendation = typeof selfCareRecommendations.$inferSelect;
export type InsertSelfCareRecommendation = z.infer<typeof insertSelfCareRecommendationSchema>;
export type WellnessPreferences = typeof wellnessPreferences.$inferSelect;
export type InsertWellnessPreferences = z.infer<typeof insertWellnessPreferencesSchema>;

// Admin activity logs
export const adminLogs = pgTable("admin_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // user_suspended, user_activated, alert_triggered, etc.
  targetUserId: varchar("target_user_id").references(() => users.id),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
