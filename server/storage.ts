import { db } from './db';
import { users, nominees, assets, moodEntries, activityLogs } from '@shared/schema';
import type { users as usersTable, nominees as nomineesTable, assets as assetsTable, moodEntries as moodEntriesTable, activityLogs as activityLogsTable } from '@shared/schema';

// Define types
type InsertUser = typeof usersTable.$inferInsert;
type SelectUser = typeof usersTable.$inferSelect;
type InsertNominee = typeof nomineesTable.$inferInsert;
type SelectNominee = typeof nomineesTable.$inferSelect;
type InsertAsset = typeof assetsTable.$inferInsert;
type SelectAsset = typeof assetsTable.$inferSelect;
type InsertMoodEntry = typeof moodEntriesTable.$inferInsert;
type SelectMoodEntry = typeof moodEntriesTable.$inferSelect;
type SelectActivityLog = typeof activityLogsTable.$inferSelect;
import { eq, desc, and } from 'drizzle-orm';

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<SelectUser>;
  getUser(id: string): Promise<SelectUser | null>;
  getUserById(id: string): Promise<SelectUser | null>;
  getUserByEmail(email: string): Promise<SelectUser | null>;
  getUserByMobile(mobileNumber: string): Promise<SelectUser | null>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<SelectUser>;
  deleteUser(id: string): Promise<void>;
  listUsers(): Promise<SelectUser[]>;

  // Nominee operations
  createNominee(nominee: InsertNominee): Promise<SelectNominee>;
  getNomineeById(id: string): Promise<SelectNominee | null>;
  getNomineesByUserId(userId: string): Promise<SelectNominee[]>;
  updateNominee(id: string, nominee: Partial<InsertNominee>): Promise<SelectNominee>;
  deleteNominee(id: string): Promise<void>;

  // Asset operations
  createAsset(asset: InsertAsset): Promise<SelectAsset>;
  getAssetById(id: string): Promise<SelectAsset | null>;
  getAssetsByUserId(userId: string): Promise<SelectAsset[]>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<SelectAsset>;
  deleteAsset(id: string): Promise<void>;

  // Mood operations
  createMoodEntry(entry: InsertMoodEntry): Promise<SelectMoodEntry>;
  getMoodEntriesByUserId(userId: string): Promise<SelectMoodEntry[]>;
  getRecentMoodEntries(userId: string, limit?: number): Promise<SelectMoodEntry[]>;

  // Additional methods needed by routes
  getAssets(userId: string): Promise<SelectAsset[]>;
  getNominees(userId: string): Promise<SelectNominee[]>;
  getAllUsers(): Promise<SelectUser[]>;
  updateUserStatus(userId: string, status: string, reason?: string): Promise<SelectUser>;
  getUsersAtRisk(): Promise<SelectUser[]>;
  getRecentAdminLogs(limit?: number): Promise<SelectActivityLog[]>;
  createAdminLog(log: any): Promise<any>;
  updateUserWellBeing(userId: string, updates: any): Promise<SelectUser>;
  updateUserWellBeingSettings(userId: string, settings: any): Promise<SelectUser>;
  getUserMoodEntries(userId: string): Promise<SelectMoodEntry[]>;
  getUserLatestMood(userId: string): Promise<SelectMoodEntry | null>;
  getAdminStats(): Promise<any>;
  createWellBeingAlert(alert: any): Promise<any>;

  // Admin operations
  getActivityLogs(): Promise<SelectActivityLog[]>;
}

class PostgresStorage implements IStorage {
  async createUser(user: InsertUser): Promise<SelectUser> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUser(id: string): Promise<SelectUser | null> {
    return this.getUserById(id);
  }

  async getUserById(id: string): Promise<SelectUser | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<SelectUser | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async getUserByMobile(mobileNumber: string): Promise<SelectUser | null> {
    const [user] = await db.select().from(users).where(eq(users.mobileNumber, mobileNumber));
    return user || null;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<SelectUser> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async listUsers(): Promise<SelectUser[]> {
    return await db.select().from(users);
  }

  async createNominee(nominee: InsertNominee): Promise<SelectNominee> {
    const [newNominee] = await db.insert(nominees).values(nominee).returning();
    return newNominee;
  }

  async getNomineeById(id: string): Promise<SelectNominee | null> {
    const [nominee] = await db.select().from(nominees).where(eq(nominees.id, id));
    return nominee || null;
  }

  async getNomineesByUserId(userId: string): Promise<SelectNominee[]> {
    return await db.select().from(nominees).where(eq(nominees.userId, userId));
  }

  async updateNominee(id: string, nominee: Partial<InsertNominee>): Promise<SelectNominee> {
    const [updatedNominee] = await db.update(nominees).set(nominee).where(eq(nominees.id, id)).returning();
    return updatedNominee;
  }

  async deleteNominee(id: string): Promise<void> {
    await db.delete(nominees).where(eq(nominees.id, id));
  }

  async createAsset(asset: InsertAsset): Promise<SelectAsset> {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async getAssetById(id: string): Promise<SelectAsset | null> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset || null;
  }

  async getAssetsByUserId(userId: string): Promise<SelectAsset[]> {
    return await db.select().from(assets).where(eq(assets.userId, userId));
  }

  async updateAsset(id: string, asset: Partial<InsertAsset>): Promise<SelectAsset> {
    const [updatedAsset] = await db.update(assets).set(asset).where(eq(assets.id, id)).returning();
    return updatedAsset;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }

  async createMoodEntry(entry: InsertMoodEntry): Promise<SelectMoodEntry> {
    const [newEntry] = await db.insert(moodEntries).values(entry).returning();
    return newEntry;
  }

  async getMoodEntriesByUserId(userId: string): Promise<SelectMoodEntry[]> {
    return await db.select().from(moodEntries).where(eq(moodEntries.userId, userId)).orderBy(desc(moodEntries.createdAt));
  }

  async getRecentMoodEntries(userId: string, limit: number = 10): Promise<SelectMoodEntry[]> {
    return await db.select().from(moodEntries).where(eq(moodEntries.userId, userId)).orderBy(desc(moodEntries.createdAt)).limit(limit);
  }

  // Additional methods implementation
  async getAssets(userId: string): Promise<SelectAsset[]> {
    return this.getAssetsByUserId(userId);
  }

  async getNominees(userId: string): Promise<SelectNominee[]> {
    return this.getNomineesByUserId(userId);
  }

  async getAllUsers(): Promise<SelectUser[]> {
    return this.listUsers();
  }

  async updateUserStatus(userId: string, status: string, reason?: string): Promise<SelectUser> {
    return this.updateUser(userId, { accountStatus: status });
  }

  async getUsersAtRisk(): Promise<SelectUser[]> {
    // Return users who haven't responded to well-being checks
    return await db.select().from(users).where(eq(users.accountStatus, 'active'));
  }

  async getRecentAdminLogs(limit: number = 50): Promise<SelectActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }

  async createAdminLog(log: any): Promise<any> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async updateUserWellBeing(userId: string, updates: any): Promise<SelectUser> {
    return this.updateUser(userId, updates);
  }

  async updateUserWellBeingSettings(userId: string, settings: any): Promise<SelectUser> {
    return this.updateUser(userId, settings);
  }

  async getUserMoodEntries(userId: string): Promise<SelectMoodEntry[]> {
    return this.getMoodEntriesByUserId(userId);
  }

  async getUserLatestMood(userId: string): Promise<SelectMoodEntry | null> {
    const entries = await this.getRecentMoodEntries(userId, 1);
    return entries[0] || null;
  }

  async getAdminStats(): Promise<any> {
    const totalUsers = await db.select().from(users);
    const activeUsers = await db.select().from(users).where(eq(users.accountStatus, 'active'));
    
    return {
      totalUsers: totalUsers.length,
      activeUsers: activeUsers.length,
      inactiveUsers: totalUsers.length - activeUsers.length
    };
  }

  async createWellBeingAlert(alert: any): Promise<any> {
    const [newAlert] = await db.insert(activityLogs).values({
      action: 'well_being_alert_created',
      category: 'system',
      description: `Well-being alert created for user ${alert.userId}`,
      userId: alert.userId,
      severity: 'warning'
    }).returning();
    return newAlert;
  }

  async getActivityLogs(): Promise<SelectActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
  }
}

export const storage = new PostgresStorage();