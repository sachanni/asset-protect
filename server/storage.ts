import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { 
  User, Asset, Nominee, WellBeingAlert, AdminAction, MoodEntry, ActivityLog,
  type UserType, type AssetType, type NomineeType, type WellBeingAlertType, 
  type AdminActionType, type MoodEntryType, type ActivityLogType 
} from '../shared/models';

// Define insert types (without MongoDB specific fields like _id, createdAt, updatedAt)
type InsertUser = Omit<UserType, '_id' | 'createdAt' | 'updatedAt'>;
type InsertAsset = Omit<AssetType, '_id' | 'createdAt' | 'updatedAt'>;
type InsertNominee = Omit<NomineeType, '_id' | 'createdAt' | 'updatedAt'>;
type InsertWellBeingAlert = Omit<WellBeingAlertType, '_id' | 'createdAt' | 'updatedAt'>;
type InsertAdminAction = Omit<AdminActionType, '_id' | 'createdAt' | 'updatedAt'>;
type InsertMoodEntry = Omit<MoodEntryType, '_id' | 'createdAt'>;
type InsertActivityLog = Omit<ActivityLogType, '_id' | 'createdAt'>;

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<UserType>;
  getUser(id: string): Promise<UserType | null>;
  getUserById(id: string): Promise<UserType | null>;
  getUserByEmail(email: string): Promise<UserType | null>;
  getUserByMobile(mobileNumber: string): Promise<UserType | null>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<UserType>;
  deleteUser(id: string): Promise<void>;
  listUsers(): Promise<UserType[]>;

  // Nominee operations
  createNominee(nominee: InsertNominee): Promise<NomineeType>;
  getNomineeById(id: string): Promise<NomineeType | null>;
  getNomineesByUserId(userId: string): Promise<NomineeType[]>;
  updateNominee(id: string, nominee: Partial<InsertNominee>): Promise<NomineeType>;
  deleteNominee(id: string): Promise<void>;

  // Asset operations
  createAsset(asset: InsertAsset): Promise<AssetType>;
  getAssetById(id: string): Promise<AssetType | null>;
  getAssetsByUserId(userId: string): Promise<AssetType[]>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<AssetType>;
  deleteAsset(id: string): Promise<void>;

  // Mood operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntryType>;
  getMoodEntriesByUserId(userId: string): Promise<MoodEntryType[]>;
  getRecentMoodEntries(userId: string, limit?: number): Promise<MoodEntryType[]>;

  // Activity Log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLogType>;
  getActivityLogs(options?: { category?: string; severity?: string; limit?: number }): Promise<ActivityLogType[]>;

  // Well Being Alert operations
  getWellBeingAlerts(userId?: string): Promise<WellBeingAlertType[]>;
  createWellBeingAlert(alert: InsertWellBeingAlert): Promise<WellBeingAlertType>;
  updateWellBeingAlert(userId: string, alert: Partial<InsertWellBeingAlert>): Promise<WellBeingAlertType>;
  getUsersWithExceededLimits(): Promise<UserType[]>;

  // Admin operations
  getPendingAdminActions(): Promise<AdminActionType[]>;
  createAdminAction(action: InsertAdminAction): Promise<AdminActionType>;
  updateAdminAction(id: string, action: Partial<InsertAdminAction>): Promise<AdminActionType>;
}

export class MongoStorage implements IStorage {
  
  // User operations
  async createUser(userData: InsertUser): Promise<UserType> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    return await user.save();
  }

  async getUser(id: string): Promise<UserType | null> {
    return await User.findById(id);
  }

  async getUserById(id: string): Promise<UserType | null> {
    return await User.findById(id);
  }

  async getUserByEmail(email: string): Promise<UserType | null> {
    return await User.findOne({ email });
  }

  async getUserByMobile(mobileNumber: string): Promise<UserType | null> {
    return await User.findOne({ mobileNumber });
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<UserType> {
    const user = await User.findByIdAndUpdate(id, userData, { new: true });
    if (!user) throw new Error('User not found');
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  }

  async listUsers(): Promise<UserType[]> {
    return await User.find({}).sort({ createdAt: -1 });
  }

  // Nominee operations
  async createNominee(nomineeData: InsertNominee): Promise<NomineeType> {
    const nominee = new Nominee(nomineeData);
    return await nominee.save();
  }

  async getNomineeById(id: string): Promise<NomineeType | null> {
    return await Nominee.findById(id);
  }

  async getNomineesByUserId(userId: string): Promise<NomineeType[]> {
    return await Nominee.find({ userId });
  }

  async updateNominee(id: string, nomineeData: Partial<InsertNominee>): Promise<NomineeType> {
    const nominee = await Nominee.findByIdAndUpdate(id, nomineeData, { new: true });
    if (!nominee) throw new Error('Nominee not found');
    return nominee;
  }

  async deleteNominee(id: string): Promise<void> {
    await Nominee.findByIdAndDelete(id);
  }

  // Asset operations
  async createAsset(assetData: InsertAsset): Promise<AssetType> {
    const asset = new Asset(assetData);
    return await asset.save();
  }

  async getAssetById(id: string): Promise<AssetType | null> {
    return await Asset.findById(id);
  }

  async getAssetsByUserId(userId: string): Promise<AssetType[]> {
    return await Asset.find({ userId });
  }

  async updateAsset(id: string, assetData: Partial<InsertAsset>): Promise<AssetType> {
    const asset = await Asset.findByIdAndUpdate(id, assetData, { new: true });
    if (!asset) throw new Error('Asset not found');
    return asset;
  }

  async deleteAsset(id: string): Promise<void> {
    await Asset.findByIdAndDelete(id);
  }

  // Mood operations
  async createMoodEntry(entryData: InsertMoodEntry): Promise<MoodEntryType> {
    const entry = new MoodEntry(entryData);
    return await entry.save();
  }

  async getMoodEntriesByUserId(userId: string): Promise<MoodEntryType[]> {
    return await MoodEntry.find({ userId }).sort({ createdAt: -1 });
  }

  async getRecentMoodEntries(userId: string, limit: number = 10): Promise<MoodEntryType[]> {
    return await MoodEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Activity Log operations
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLogType> {
    const log = new ActivityLog(logData);
    return await log.save();
  }

  async getActivityLogs(options: { category?: string; severity?: string; limit?: number } = {}): Promise<ActivityLogType[]> {
    const query: any = {};
    if (options.category) query.category = options.category;
    if (options.severity) query.severity = options.severity;
    
    return await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 100);
  }

  // Well Being Alert operations
  async getWellBeingAlerts(userId?: string): Promise<WellBeingAlertType[]> {
    const query = userId ? { userId } : {};
    return await WellBeingAlert.find(query);
  }

  async createWellBeingAlert(alertData: InsertWellBeingAlert): Promise<WellBeingAlertType> {
    const alert = new WellBeingAlert(alertData);
    return await alert.save();
  }

  async updateWellBeingAlert(userId: string, alertData: Partial<InsertWellBeingAlert>): Promise<WellBeingAlertType> {
    const alert = await WellBeingAlert.findOneAndUpdate({ userId }, alertData, { new: true });
    if (!alert) throw new Error('Well-being alert not found');
    return alert;
  }

  async getUsersWithExceededLimits(): Promise<UserType[]> {
    // Find alerts where currentCount >= maxMissedAlerts
    const exceededAlerts = await WellBeingAlert.find({
      $expr: { $gte: ['$currentCount', '$maxMissedAlerts'] }
    }).populate('userId');
    
    return exceededAlerts
      .map(alert => alert.userId)
      .filter((user): user is UserType => user != null);
  }

  // Admin operations
  async getPendingAdminActions(): Promise<AdminActionType[]> {
    return await AdminAction.find({ status: 'pending' }).sort({ createdAt: -1 });
  }

  async createAdminAction(actionData: InsertAdminAction): Promise<AdminActionType> {
    const action = new AdminAction(actionData);
    return await action.save();
  }

  async updateAdminAction(id: string, actionData: Partial<InsertAdminAction>): Promise<AdminActionType> {
    const action = await AdminAction.findByIdAndUpdate(id, actionData, { new: true });
    if (!action) throw new Error('Admin action not found');
    return action;
  }
}

// Create singleton instance
export const storage = new MongoStorage();