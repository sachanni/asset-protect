import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { 
  User, Asset, Nominee, WellBeingAlert, AdminAction, MoodEntry, ActivityLog,
  type UserType, type AssetType, type NomineeType, type WellBeingAlertType, 
  type AdminActionType, type MoodEntryType, type ActivityLogType 
} from '../shared/models';

// Memory storage fallback
interface MemoryStorage {
  users: Map<string, any>;
  assets: Map<string, any>;
  nominees: Map<string, any>;
  wellBeingAlerts: Map<string, any>;
  adminActions: Map<string, any>;
  moodEntries: Map<string, any>;
  activityLogs: Map<string, any>;
}

const memoryStorage: MemoryStorage = {
  users: new Map(),
  assets: new Map(),
  nominees: new Map(),
  wellBeingAlerts: new Map(),
  adminActions: new Map(),
  moodEntries: new Map(),
  activityLogs: new Map(),
};

// Define insert types (without MongoDB specific fields)
type InsertUser = {
  fullName: string;
  dateOfBirth: Date;
  mobileNumber: string;
  countryCode: string;
  address: string;
  email: string;
  password: string;
  isVerified: boolean;
};

type InsertAsset = {
  userId: string;
  assetType: string;
  title: string;
  description: string;
  value: string;
  currency: string;
  contactInfo: string;
  storageLocation: string;
  accessInstructions: string;
};

type InsertNominee = {
  userId: string;
  fullName: string;
  relationship: string;
  mobileNumber: string;
  email?: string;
  isVerified?: boolean;
};

type InsertMoodEntry = {
  userId: string;
  mood: string;
  intensity: number;
  notes?: string;
  context?: string;
};

export interface IStorage {
  createUser(user: InsertUser): Promise<any>;
  getUser(id: string): Promise<any>;
  getUserById(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  getUserByMobile(mobileNumber: string): Promise<any>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<any>;
  deleteUser(id: string): Promise<void>;
  listUsers(): Promise<any[]>;

  createNominee(nominee: InsertNominee): Promise<any>;
  getNomineeById(id: string): Promise<any>;
  getNomineesByUserId(userId: string): Promise<any[]>;
  updateNominee(id: string, nominee: Partial<InsertNominee>): Promise<any>;
  deleteNominee(id: string): Promise<void>;

  createAsset(asset: InsertAsset): Promise<any>;
  getAssetById(id: string): Promise<any>;
  getAssetsByUserId(userId: string): Promise<any[]>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<any>;
  deleteAsset(id: string): Promise<void>;

  createMoodEntry(entry: InsertMoodEntry): Promise<any>;
  getMoodEntriesByUserId(userId: string): Promise<any[]>;
  getRecentMoodEntries(userId: string, limit?: number): Promise<any[]>;
}

export class HybridStorage implements IStorage {
  private useMongoDb: boolean = false;
  private idCounter: number = 1;

  constructor(mongoConnected: boolean = false) {
    this.useMongoDb = mongoConnected && mongoose.connection.readyState === 1;
    console.log(`Storage initialized with ${this.useMongoDb ? 'MongoDB' : 'Memory'} backend`);
  }

  private generateId(): string {
    return (this.idCounter++).toString();
  }

  // User operations
  async createUser(userData: InsertUser): Promise<any> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userWithHashedPassword = { ...userData, password: hashedPassword };

    if (this.useMongoDb) {
      try {
        const user = new User(userWithHashedPassword);
        return await user.save();
      } catch (error) {
        console.error('MongoDB user creation failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    // Memory storage fallback
    const id = this.generateId();
    const user = {
      _id: id,
      id,
      ...userWithHashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStorage.users.set(id, user);
    return user;
  }

  async getUser(id: string): Promise<any> {
    if (this.useMongoDb) {
      try {
        return await User.findById(id);
      } catch (error) {
        console.error('MongoDB getUser failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }
    return memoryStorage.users.get(id) || null;
  }

  async getUserById(id: string): Promise<any> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<any> {
    if (this.useMongoDb) {
      try {
        return await User.findOne({ email });
      } catch (error) {
        console.error('MongoDB getUserByEmail failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    // Memory storage fallback
    for (const user of memoryStorage.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async getUserByMobile(mobileNumber: string): Promise<any> {
    if (this.useMongoDb) {
      try {
        return await User.findOne({ mobileNumber });
      } catch (error) {
        console.error('MongoDB getUserByMobile failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    // Memory storage fallback
    for (const user of memoryStorage.users.values()) {
      if (user.mobileNumber === mobileNumber) return user;
    }
    return null;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<any> {
    if (this.useMongoDb) {
      try {
        const user = await User.findByIdAndUpdate(id, userData, { new: true });
        if (!user) throw new Error('User not found');
        return user;
      } catch (error) {
        console.error('MongoDB updateUser failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    // Memory storage fallback
    const user = memoryStorage.users.get(id);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, ...userData, updatedAt: new Date() };
    memoryStorage.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    if (this.useMongoDb) {
      try {
        await User.findByIdAndDelete(id);
        return;
      } catch (error) {
        console.error('MongoDB deleteUser failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }
    memoryStorage.users.delete(id);
  }

  async listUsers(): Promise<any[]> {
    if (this.useMongoDb) {
      try {
        return await User.find({}).sort({ createdAt: -1 });
      } catch (error) {
        console.error('MongoDB listUsers failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }
    return Array.from(memoryStorage.users.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Nominee operations
  async createNominee(nomineeData: InsertNominee): Promise<any> {
    if (this.useMongoDb) {
      try {
        const nominee = new Nominee(nomineeData);
        return await nominee.save();
      } catch (error) {
        console.error('MongoDB createNominee failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    const id = this.generateId();
    const nominee = {
      _id: id,
      id,
      ...nomineeData,
      isVerified: nomineeData.isVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStorage.nominees.set(id, nominee);
    return nominee;
  }

  async getNomineeById(id: string): Promise<any> {
    if (this.useMongoDb) {
      try {
        return await Nominee.findById(id);
      } catch (error) {
        console.error('MongoDB getNomineeById failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }
    return memoryStorage.nominees.get(id) || null;
  }

  async getNomineesByUserId(userId: string): Promise<any[]> {
    if (this.useMongoDb) {
      try {
        return await Nominee.find({ userId });
      } catch (error) {
        console.error('MongoDB getNomineesByUserId failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    return Array.from(memoryStorage.nominees.values())
      .filter(nominee => nominee.userId === userId);
  }

  async updateNominee(id: string, nomineeData: Partial<InsertNominee>): Promise<any> {
    if (this.useMongoDb) {
      try {
        const nominee = await Nominee.findByIdAndUpdate(id, nomineeData, { new: true });
        if (!nominee) throw new Error('Nominee not found');
        return nominee;
      } catch (error) {
        console.error('MongoDB updateNominee failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    const nominee = memoryStorage.nominees.get(id);
    if (!nominee) throw new Error('Nominee not found');
    const updatedNominee = { ...nominee, ...nomineeData, updatedAt: new Date() };
    memoryStorage.nominees.set(id, updatedNominee);
    return updatedNominee;
  }

  async deleteNominee(id: string): Promise<void> {
    if (this.useMongoDb) {
      try {
        await Nominee.findByIdAndDelete(id);
        return;
      } catch (error) {
        console.error('MongoDB deleteNominee failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }
    memoryStorage.nominees.delete(id);
  }

  // Asset operations
  async createAsset(assetData: InsertAsset): Promise<any> {
    if (this.useMongoDb) {
      try {
        const asset = new Asset(assetData);
        return await asset.save();
      } catch (error) {
        console.error('MongoDB createAsset failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    const id = this.generateId();
    const asset = {
      _id: id,
      id,
      ...assetData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStorage.assets.set(id, asset);
    return asset;
  }

  async getAssetById(id: string): Promise<any> {
    if (this.useMongoDb) {
      try {
        return await Asset.findById(id);
      } catch (error) {
        console.error('MongoDB getAssetById failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }
    return memoryStorage.assets.get(id) || null;
  }

  async getAssetsByUserId(userId: string): Promise<any[]> {
    if (this.useMongoDb) {
      try {
        return await Asset.find({ userId });
      } catch (error) {
        console.error('MongoDB getAssetsByUserId failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    return Array.from(memoryStorage.assets.values())
      .filter(asset => asset.userId === userId);
  }

  async updateAsset(id: string, assetData: Partial<InsertAsset>): Promise<any> {
    if (this.useMongoDb) {
      try {
        const asset = await Asset.findByIdAndUpdate(id, assetData, { new: true });
        if (!asset) throw new Error('Asset not found');
        return asset;
      } catch (error) {
        console.error('MongoDB updateAsset failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    const asset = memoryStorage.assets.get(id);
    if (!asset) throw new Error('Asset not found');
    const updatedAsset = { ...asset, ...assetData, updatedAt: new Date() };
    memoryStorage.assets.set(id, updatedAsset);
    return updatedAsset;
  }

  async deleteAsset(id: string): Promise<void> {
    if (this.useMongoDb) {
      try {
        await Asset.findByIdAndDelete(id);
        return;
      } catch (error) {
        console.error('MongoDB deleteAsset failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }
    memoryStorage.assets.delete(id);
  }

  // Mood operations
  async createMoodEntry(entryData: InsertMoodEntry): Promise<any> {
    if (this.useMongoDb) {
      try {
        const entry = new MoodEntry(entryData);
        return await entry.save();
      } catch (error) {
        console.error('MongoDB createMoodEntry failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    const id = this.generateId();
    const entry = {
      _id: id,
      id,
      ...entryData,
      createdAt: new Date(),
    };
    memoryStorage.moodEntries.set(id, entry);
    return entry;
  }

  async getMoodEntriesByUserId(userId: string): Promise<any[]> {
    if (this.useMongoDb) {
      try {
        return await MoodEntry.find({ userId }).sort({ createdAt: -1 });
      } catch (error) {
        console.error('MongoDB getMoodEntriesByUserId failed, falling back to memory:', error);
        this.useMongoDb = false;
      }
    }

    return Array.from(memoryStorage.moodEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRecentMoodEntries(userId: string, limit: number = 10): Promise<any[]> {
    const entries = await this.getMoodEntriesByUserId(userId);
    return entries.slice(0, limit);
  }
}

// Create singleton instance
export const storage = new HybridStorage();