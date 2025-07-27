import {
  users,
  nominees,
  assets,
  wellBeingAlerts,
  adminActions,
  type User,
  type UpsertUser,
  type Nominee,
  type InsertNominee,
  type Asset,
  type InsertAsset,
  type WellBeingAlert,
  type InsertWellBeingAlert,
  type AdminAction,
  type InsertAdminAction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // App-specific user operations
  getUserByMobile(mobileNumber: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(userId: string): Promise<User | undefined>;
  createUser(userData: {
    fullName: string;
    dateOfBirth: Date;
    mobileNumber: string;
    countryCode: string;
    address: string;
    email: string;
    password: string;
  }): Promise<User>;
  updateUserWellBeing(userId: string): Promise<void>;
  updateUserWellBeingSettings(userId: string, settings: any): Promise<void>;
  incrementWellBeingCounter(userId: string): Promise<void>;
  getUsersWithExceededLimits(): Promise<User[]>;
  
  // Nominee operations
  getNominees(userId: string): Promise<Nominee[]>;
  createNominee(nominee: InsertNominee): Promise<Nominee>;
  updateNomineeVerification(nomineeId: string, isVerified: boolean): Promise<void>;
  
  // Asset operations
  getAssets(userId: string): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(assetId: string, asset: Partial<InsertAsset>): Promise<Asset>;
  deleteAsset(assetId: string): Promise<void>;
  
  // Well-being alert operations
  createWellBeingAlert(alert: InsertWellBeingAlert): Promise<WellBeingAlert>;
  getWellBeingAlerts(userId: string): Promise<WellBeingAlert[]>;
  markAlertResponded(alertId: string): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  createAdminAction(action: InsertAdminAction): Promise<AdminAction>;
  getPendingAdminActions(): Promise<AdminAction[]>;
  updateAdminActionStatus(actionId: string, status: string, notes?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
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

  // App-specific user operations
  async getUserByMobile(mobileNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.mobileNumber, mobileNumber));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async createUser(userData: {
    fullName: string;
    dateOfBirth: Date;
    mobileNumber: string;
    countryCode: string;
    address: string;
    email: string;
    password: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    
    const [user] = await db
      .insert(users)
      .values({
        fullName: userData.fullName,
        firstName: userData.fullName.split(' ')[0],
        lastName: userData.fullName.split(' ').slice(1).join(' '),
        dateOfBirth: userData.dateOfBirth,
        mobileNumber: userData.mobileNumber,
        countryCode: userData.countryCode,
        address: userData.address,
        email: userData.email,
        passwordHash,
        lastWellBeingCheck: new Date(),
      })
      .returning();
    
    return user;
  }

  async updateUserWellBeing(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        lastWellBeingCheck: new Date(),
        wellBeingCounter: 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async incrementWellBeingCounter(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        wellBeingCounter: sql`well_being_counter + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getUsersWithExceededLimits(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isActive, true),
          gte(sql`well_being_counter`, sql`max_well_being_limit`)
        )
      );
  }

  // Nominee operations
  async getNominees(userId: string): Promise<Nominee[]> {
    return await db
      .select()
      .from(nominees)
      .where(eq(nominees.userId, userId))
      .orderBy(desc(nominees.createdAt));
  }

  async createNominee(nominee: InsertNominee): Promise<Nominee> {
    const [newNominee] = await db
      .insert(nominees)
      .values(nominee)
      .returning();
    return newNominee;
  }

  async updateNomineeVerification(nomineeId: string, isVerified: boolean): Promise<void> {
    await db
      .update(nominees)
      .set({ isVerified })
      .where(eq(nominees.id, nomineeId));
  }

  // Asset operations
  async getAssets(userId: string): Promise<Asset[]> {
    return await db
      .select()
      .from(assets)
      .where(eq(assets.userId, userId))
      .orderBy(desc(assets.createdAt));
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [newAsset] = await db
      .insert(assets)
      .values(asset)
      .returning();
    return newAsset;
  }

  async updateAsset(assetId: string, asset: Partial<InsertAsset>): Promise<Asset> {
    const [updatedAsset] = await db
      .update(assets)
      .set({ ...asset, updatedAt: new Date() })
      .where(eq(assets.id, assetId))
      .returning();
    return updatedAsset;
  }

  async deleteAsset(assetId: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, assetId));
  }

  // Well-being alert operations
  async createWellBeingAlert(alert: InsertWellBeingAlert): Promise<WellBeingAlert> {
    const [newAlert] = await db
      .insert(wellBeingAlerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async getWellBeingAlerts(userId: string): Promise<WellBeingAlert[]> {
    return await db
      .select()
      .from(wellBeingAlerts)
      .where(eq(wellBeingAlerts.userId, userId))
      .orderBy(desc(wellBeingAlerts.createdAt));
  }

  async markAlertResponded(alertId: string): Promise<void> {
    await db
      .update(wellBeingAlerts)
      .set({
        status: 'responded',
        respondedAt: new Date(),
      })
      .where(eq(wellBeingAlerts.id, alertId));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async createAdminAction(action: InsertAdminAction): Promise<AdminAction> {
    const [newAction] = await db
      .insert(adminActions)
      .values(action)
      .returning();
    return newAction;
  }

  async getPendingAdminActions(): Promise<AdminAction[]> {
    return await db
      .select()
      .from(adminActions)
      .where(eq(adminActions.status, 'pending'))
      .orderBy(desc(adminActions.createdAt));
  }

  async updateAdminActionStatus(actionId: string, status: string, notes?: string): Promise<void> {
    await db
      .update(adminActions)
      .set({
        status,
        notes,
        completedAt: new Date(),
      })
      .where(eq(adminActions.id, actionId));
  }

  async updateUserWellBeingSettings(userId: string, settings: any): Promise<void> {
    await db.update(users)
      .set({
        alertFrequency: settings.alertFrequency,
        customDays: settings.customDays,
        alertTime: settings.alertTime,
        enableSMS: settings.enableSMS,
        enableEmail: settings.enableEmail,  
        maxWellBeingLimit: settings.maxWellBeingLimit,
        escalationEnabled: settings.escalationEnabled,
      })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
