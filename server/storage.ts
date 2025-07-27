import {
  users,
  nominees,
  assets,
  wellBeingAlerts,
  adminActions,
  adminLogs,
  moodEntries,
  selfCareRecommendations,
  wellnessPreferences,
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
  type AdminLog,
  type InsertAdminLog,
  type MoodEntry,
  type InsertMoodEntry,
  type SelfCareRecommendation,
  type InsertSelfCareRecommendation,
  type WellnessPreferences,
  type InsertWellnessPreferences,
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
  
  // Mood tracking operations
  createMoodEntry(mood: InsertMoodEntry): Promise<MoodEntry>;
  getUserMoodEntries(userId: string, limit?: number): Promise<MoodEntry[]>;
  getUserLatestMood(userId: string): Promise<MoodEntry | undefined>;

  // Self-care recommendation operations
  createSelfCareRecommendation(recommendation: InsertSelfCareRecommendation): Promise<SelfCareRecommendation>;
  getSelfCareRecommendationsByUserId(userId: string): Promise<SelfCareRecommendation[]>;
  updateSelfCareRecommendation(id: string, updates: Partial<SelfCareRecommendation>): Promise<void>;
  deleteSelfCareRecommendation(id: string): Promise<void>;
  generateRecommendationsForUser(userId: string): Promise<SelfCareRecommendation[]>;

  // Wellness preferences operations
  createWellnessPreferences(preferences: InsertWellnessPreferences): Promise<WellnessPreferences>;
  getWellnessPreferencesByUserId(userId: string): Promise<WellnessPreferences | null>;
  updateWellnessPreferences(userId: string, updates: Partial<WellnessPreferences>): Promise<void>;
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

  // Mood tracking operations
  async createMoodEntry(mood: InsertMoodEntry): Promise<MoodEntry> {
    const [newMood] = await db
      .insert(moodEntries)
      .values(mood)
      .returning();
    return newMood;
  }

  async getUserMoodEntries(userId: string, limit: number = 30): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt))
      .limit(limit);
  }

  async getUserLatestMood(userId: string): Promise<MoodEntry | undefined> {
    const [mood] = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt))
      .limit(1);
    return mood;
  }

  // Additional admin methods
  async getAllAssets(): Promise<Asset[]> {
    return await db.select().from(assets);
  }

  async getAllNominees(): Promise<Nominee[]> {
    return await db.select().from(nominees);
  }

  async updateUserStatus(userId: string, accountStatus: string): Promise<void> {
    await db.update(users)
      .set({ accountStatus, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getAssetsByUserId(userId: string): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.userId, userId));
  }

  async getNomineesByUserId(userId: string): Promise<Nominee[]> {
    return await db.select().from(nominees).where(eq(nominees.userId, userId));
  }

  async getMoodEntriesByUserId(userId: string): Promise<MoodEntry[]> {
    return await db.select().from(moodEntries).where(eq(moodEntries.userId, userId));
  }

  async createAdminLog(data: any): Promise<AdminLog> {
    const [log] = await db.insert(adminLogs).values(data).returning();
    return log;
  }

  async getRecentAdminLogs(limit: number = 50): Promise<AdminLog[]> {
    return await db.select().from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit);
  }

  // Self-care recommendation operations
  async createSelfCareRecommendation(recommendation: InsertSelfCareRecommendation): Promise<SelfCareRecommendation> {
    const [newRecommendation] = await db
      .insert(selfCareRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  async getSelfCareRecommendationsByUserId(userId: string): Promise<SelfCareRecommendation[]> {
    return await db
      .select()
      .from(selfCareRecommendations)
      .where(eq(selfCareRecommendations.userId, userId))
      .orderBy(desc(selfCareRecommendations.createdAt));
  }

  async updateSelfCareRecommendation(id: string, updates: Partial<SelfCareRecommendation>): Promise<void> {
    await db
      .update(selfCareRecommendations)
      .set(updates)
      .where(eq(selfCareRecommendations.id, id));
  }

  async deleteSelfCareRecommendation(id: string): Promise<void> {
    await db
      .delete(selfCareRecommendations)
      .where(eq(selfCareRecommendations.id, id));
  }

  async generateRecommendationsForUser(userId: string): Promise<SelfCareRecommendation[]> {
    // Get user's recent moods and wellness preferences
    const recentMoods = await this.getUserMoodEntries(userId, 7); // Last 7 entries
    const wellnessPrefs = await this.getWellnessPreferencesByUserId(userId);
    
    const recommendations: InsertSelfCareRecommendation[] = [];
    
    // Analyze mood patterns and generate contextual recommendations
    if (recentMoods.length > 0) {
      const latestMood = recentMoods[0];
      const availableTime = wellnessPrefs?.availableTime || '15';
      
      // Generate recommendations based on current mood
      switch (latestMood.mood.toLowerCase()) {
        case 'stressed':
        case 'anxious':
          recommendations.push({
            userId,
            recommendationType: 'breathing',
            title: '4-7-8 Breathing Exercise',
            description: 'A calming breathing technique to reduce stress and anxiety',
            instructions: 'Breathe in for 4 counts, hold for 7, exhale for 8. Repeat 4 times.',
            durationMinutes: parseInt(wellnessPrefs?.availableTime || '15') >= 15 ? 10 : 5,
            contextTrigger: 'stress',
            priority: 'high',
          });
          break;
          
        case 'tired':
        case 'exhausted':
          recommendations.push({
            userId,
            recommendationType: 'exercise',
            title: 'Gentle Stretching',
            description: 'Light stretches to energize your body and mind',
            instructions: 'Focus on neck, shoulders, and back. Hold each stretch for 30 seconds.',
            durationMinutes: parseInt(wellnessPrefs?.availableTime || '15') >= 30 ? 15 : 10,
            contextTrigger: 'fatigue',
            priority: 'medium',
          });
          break;
          
        case 'sad':
        case 'down':
          recommendations.push({
            userId,
            recommendationType: 'social',
            title: 'Connect with Loved Ones',
            description: 'Reach out to someone who makes you feel better',
            instructions: 'Call, text, or video chat with a friend or family member.',
            durationMinutes: parseInt(wellnessPrefs?.availableTime || '15'),
            contextTrigger: 'sadness',
            priority: 'high',
          });
          break;
          
        default:
          recommendations.push({
            userId,
            recommendationType: 'meditation',
            title: 'Mindfulness Moment',
            description: 'A short mindfulness exercise to center yourself',
            instructions: 'Sit comfortably, focus on your breath, and observe your thoughts without judgment.',
            durationMinutes: parseInt(wellnessPrefs?.availableTime || '15') >= 15 ? 10 : 5,
            contextTrigger: 'general',
            priority: 'medium',
          });
      }
    }
    
    // Generate general wellness recommendations based on preferences
    if (wellnessPrefs?.preferredActivities) {
      const activities = wellnessPrefs.preferredActivities;
      if (activities.includes('exercise')) {
        recommendations.push({
          userId,
          recommendationType: 'exercise',
          title: 'Quick Movement Break',
          description: 'Get your body moving with simple exercises',
          instructions: 'Do jumping jacks, push-ups, or walk around for a few minutes.',
          durationMinutes: parseInt(wellnessPrefs?.availableTime || '15') >= 20 ? 15 : 10,
          contextTrigger: 'general',
          priority: 'medium',
        });
      }
      
      if (activities.includes('meditation')) {
        recommendations.push({
          userId,
          recommendationType: 'meditation',
          title: 'Guided Meditation',
          description: 'A peaceful meditation session for inner calm',
          instructions: 'Find a quiet space, close your eyes, and follow your breath.',
          durationMinutes: parseInt(wellnessPrefs?.availableTime || '15') >= 20 ? 20 : 10,
          contextTrigger: 'general',
          priority: 'medium',
        });
      }
    }
    
    // Create and return the recommendations
    const createdRecommendations: SelfCareRecommendation[] = [];
    for (const rec of recommendations) {
      const created = await this.createSelfCareRecommendation(rec);
      createdRecommendations.push(created);
    }
    
    return createdRecommendations;
  }

  // Wellness preferences operations
  async createWellnessPreferences(preferences: InsertWellnessPreferences): Promise<WellnessPreferences> {
    const [newPreferences] = await db
      .insert(wellnessPreferences)
      .values(preferences)
      .returning();
    return newPreferences;
  }

  async getWellnessPreferencesByUserId(userId: string): Promise<WellnessPreferences | null> {
    const [preferences] = await db
      .select()
      .from(wellnessPreferences)
      .where(eq(wellnessPreferences.userId, userId))
      .limit(1);
    return preferences || null;
  }

  async updateWellnessPreferences(userId: string, updates: Partial<WellnessPreferences>): Promise<void> {
    await db
      .update(wellnessPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(wellnessPreferences.userId, userId));
  }
}

export const storage = new DatabaseStorage();
