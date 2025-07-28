import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserSchema, insertNomineeSchema, insertMoodEntrySchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

// Extend session type to include custom properties
declare module 'express-session' {
  interface SessionData {
    registrationStep1?: {
      fullName: string;
      dateOfBirth: string;
      mobileNumber: string;
      countryCode: string;
      address: string;
    };
    otp?: string;
    otpExpiry?: number;
    userId?: string;
  }
}

const registrationStep1Schema = z.object({
  fullName: z.string().min(2),
  dateOfBirth: z.string(),
  mobileNumber: z.string().min(10),
  countryCode: z.string().default('+91'),
  address: z.string().min(10),
});

const registrationStep2Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  captcha: z.string().min(5),
});

const loginSchema = z.object({
  identifier: z.string(), // mobile or email
  password: z.string().optional(),
  otp: z.string().optional(),
});

const assetSchema = z.object({
  assetType: z.string(),
  title: z.string(),
  description: z.string(),
  value: z.string(),
  currency: z.string().default('USD'),
  contactInfo: z.string(),
  storageLocation: z.string(),
  accessInstructions: z.string(),
});

const nomineeSchema = z.object({
  fullName: z.string(),
  relationship: z.string(),
  mobileNumber: z.string(),
  email: z.string().optional(),
});

const wellBeingSettingsSchema = z.object({
  alertFrequency: z.enum(["daily", "weekly", "custom"]),
  customDays: z.number().min(1).max(30).optional(),
  alertTime: z.string(),
  enableSMS: z.boolean(),
  enableEmail: z.boolean(),
  maxMissedAlerts: z.number().min(1).max(50),
  escalationEnabled: z.boolean(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Combined authentication middleware (session or Replit auth)
  const combinedAuth = (req: any, res: any, next: any) => {
    // Check session-based auth first
    if (req.session?.userId) {
      req.userId = req.session.userId;
      return next();
    } 
    // Check Replit auth
    else if (req.user?.claims?.sub) {
      req.userId = req.user.claims.sub;
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes - first check session auth, then Replit auth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      let userId;
      
      // Check session-based auth first
      if (req.session?.userId) {
        userId = req.session.userId;
      } 
      // Fallback to Replit auth
      else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } 
      else {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Debug endpoint for session testing
  app.get('/api/debug/session', (req, res) => {
    res.json({
      sessionID: req.sessionID,
      session: req.session,
      cookies: req.headers.cookie,
    });
  });

  // Registration endpoints
  app.post('/api/register/step1', async (req, res) => {
    try {
      const validatedData = registrationStep1Schema.parse(req.body);
      
      // Check if mobile number already exists
      const existingUser = await storage.getUserByMobile(validatedData.mobileNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Mobile number already registered" });
      }
      
      // Store step 1 data in session
      req.session.registrationStep1 = validatedData;
      
      // Save session explicitly to ensure it's stored
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session error" });
        }
        res.json({ success: true, message: "Step 1 completed" });
      });
    } catch (error: any) {
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  app.post('/api/register/step2', async (req, res) => {
    try {
      console.log('Session ID:', req.sessionID);
      console.log('Session data:', req.session);
      
      const step1Data = req.session.registrationStep1;
      if (!step1Data) {
        console.log('No step1 data found in session');
        return res.status(400).json({ message: "Please complete step 1 first" });
      }

      const validatedData = registrationStep2Schema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user
      const userData = {
        ...step1Data,
        email: validatedData.email,
        password: validatedData.password,
        dateOfBirth: new Date(step1Data.dateOfBirth),
      };

      const user = await storage.createUser(userData);
      
      // Clear session data
      delete req.session.registrationStep1;
      
      res.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error: any) {
      res.status(400).json({ message: "Registration failed", error: error.message });
    }
  });

  // Login endpoints
  app.post('/api/login', async (req, res) => {
    try {
      const { identifier, password, otp } = loginSchema.parse(req.body);
      
      // Find user by email or mobile
      let user = await storage.getUserByEmail(identifier);
      if (!user) {
        user = await storage.getUserByMobile(identifier);
      }
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // For OTP login (priority)
      if (otp) {
        // TODO: Verify OTP from session or database
        const sessionOtp = req.session.otp;
        if (!sessionOtp || sessionOtp !== otp) {
          return res.status(401).json({ message: "Invalid OTP" });
        }
        
        // Clear OTP from session
        delete req.session.otp;
        
        // Set user session
        req.session.userId = user.id;
        res.json({ success: true, user: { id: user.id, email: user.email } });
      } else if (password) {
        // Password login
        if (!user.passwordHash) {
          return res.status(401).json({ message: "Password not set for this account" });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid password" });
        }
        
        req.session.userId = user.id;
        res.json({ success: true, user: { id: user.id, email: user.email } });
      } else {
        res.status(400).json({ message: "Password or OTP required" });
      }
    } catch (error: any) {
      res.status(400).json({ message: "Login failed", error: error.message });
    }
  });

  app.post('/api/send-otp', async (req, res) => {
    try {
      const { identifier } = req.body;
      
      // Find user
      let user = await storage.getUserByEmail(identifier);
      if (!user) {
        user = await storage.getUserByMobile(identifier);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate OTP (6 digits)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in session (in production, use proper OTP service)
      req.session.otp = otp;
      req.session.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      
      // TODO: Send OTP via SMS/Email service
      console.log(`OTP for ${identifier}: ${otp}`);
      
      // Temporarily include OTP in response for testing (remove in production)
      res.json({ success: true, message: "OTP sent successfully", otp: otp });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
  });

  // Protected routes
  app.get('/api/dashboard/stats', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      
      const [assets, nominees, alerts] = await Promise.all([
        storage.getAssets(userId),
        storage.getNominees(userId),
        storage.getWellBeingAlerts(userId),
      ]);
      
      const user = await storage.getUser(userId);
      
      res.json({
        totalAssets: assets.length,
        totalNominees: nominees.length,
        lastCheckin: user?.lastWellBeingCheck,
        wellBeingCounter: user?.wellBeingCounter || 0,
        recentAssets: assets.slice(0, 3),
        nominees: nominees.slice(0, 3),
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
    }
  });

  // Nominee management
  app.get('/api/nominees', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const nominees = await storage.getNominees(userId);
      res.json(nominees);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch nominees", error: error.message });
    }
  });

  app.post('/api/nominees', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const validatedData = insertNomineeSchema.parse({
        ...req.body,
        userId
      });

      const nominee = await storage.createNominee(validatedData);
      res.json({ success: true, nominee });
    } catch (error: any) {
      console.error("Error creating nominee:", error);
      res.status(400).json({ message: "Failed to create nominee", error: error.message });
    }
  });

  // Asset management
  app.get('/api/assets', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const assets = await storage.getAssets(userId);
      res.json(assets);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch assets", error: error.message });
    }
  });

  app.post('/api/assets', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const assetData = assetSchema.parse(req.body);
      
      const asset = await storage.createAsset({
        ...assetData,
        userId,
      });
      
      res.json({ success: true, asset });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create asset", error: error.message });
    }
  });

  // Well-being check
  app.post('/api/wellbeing/confirm', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      
      await storage.updateUserWellBeing(userId);
      
      res.json({ success: true, message: "Well-being confirmed" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to confirm well-being", error: error.message });
    }
  });

  // Well-being settings
  app.get('/api/wellbeing/settings', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return current user settings
      const settings = {
        alertFrequency: user.alertFrequency || 'daily',
        customDays: user.customDays || 1,
        alertTime: user.alertTime || '09:00',
        enableSMS: user.enableSMS !== false,
        enableEmail: user.enableEmail !== false,
        maxMissedAlerts: user.maxWellBeingLimit || 15,
        escalationEnabled: user.escalationEnabled !== false,
      };
      
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch settings", error: error.message });
    }
  });

  app.put('/api/wellbeing/settings', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const settingsData = wellBeingSettingsSchema.parse(req.body);
      
      await storage.updateUserWellBeingSettings(userId, {
        alertFrequency: settingsData.alertFrequency,
        customDays: settingsData.customDays,
        alertTime: settingsData.alertTime,
        enableSMS: settingsData.enableSMS,
        enableEmail: settingsData.enableEmail,
        maxWellBeingLimit: settingsData.maxMissedAlerts,
        escalationEnabled: settingsData.escalationEnabled,
      });
      
      res.json({ success: true, message: "Settings updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update settings", error: error.message });
    }
  });

  app.post('/api/wellbeing/test-alert', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // TODO: Implement actual SMS/Email sending
      // For now, just log the test alert
      console.log(`Test alert sent to user ${userId} (${user.email}, ${user.mobileNumber})`);
      
      res.json({ success: true, message: "Test alert sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to send test alert", error: error.message });
    }
  });

  // Mood tracking endpoints
  app.get('/api/mood/entries', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit as string) || 30;
      
      const moods = await storage.getUserMoodEntries(userId, limit);
      res.json(moods);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch mood entries", error: error.message });
    }
  });

  // Simple mood endpoint (used by frontend)
  app.post('/api/mood', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      console.log('Mood tracking request:', { body: req.body, userId });
      
      const moodData = insertMoodEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      console.log('Parsed mood data:', moodData);
      const mood = await storage.createMoodEntry(moodData);
      res.json({ success: true, mood });
    } catch (error: any) {
      console.error('Mood tracking error:', error);
      res.status(400).json({ message: "Failed to create mood entry", error: error.message });
    }
  });

  app.post('/api/mood/entries', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      console.log('Mood entry request:', { body: req.body, userId });
      
      const moodData = insertMoodEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      console.log('Parsed mood data:', moodData);
      const mood = await storage.createMoodEntry(moodData);
      res.json({ success: true, mood });
    } catch (error: any) {
      console.error('Mood entry error:', error);
      res.status(400).json({ message: "Failed to create mood entry", error: error.message });
    }
  });

  app.get('/api/mood/latest', combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const mood = await storage.getUserLatestMood(userId);
      res.json(mood || null);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch latest mood", error: error.message });
    }
  });

  // Self-care recommendation routes
  app.get("/api/self-care/recommendations", combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const recommendations = await storage.getSelfCareRecommendationsByUserId(userId);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch recommendations", error: error.message });
    }
  });

  app.post("/api/self-care/generate", combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const recommendations = await storage.generateRecommendationsForUser(userId);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to generate recommendations", error: error.message });
    }
  });

  app.patch("/api/self-care/recommendations/:id", combinedAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      await storage.updateSelfCareRecommendation(id, updates);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update recommendation", error: error.message });
    }
  });

  app.delete("/api/self-care/recommendations/:id", combinedAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSelfCareRecommendation(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete recommendation", error: error.message });
    }
  });

  // Wellness preferences routes
  app.get("/api/wellness/preferences", combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const preferences = await storage.getWellnessPreferencesByUserId(userId);
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch wellness preferences", error: error.message });
    }
  });

  app.post("/api/wellness/preferences", combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const preferences = { ...req.body, userId };
      const newPreferences = await storage.createWellnessPreferences(preferences);
      res.json(newPreferences);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create wellness preferences", error: error.message });
    }
  });

  app.patch("/api/wellness/preferences", combinedAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      await storage.updateWellnessPreferences(userId, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update wellness preferences", error: error.message });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', combinedAuth, async (req: any, res) => {
    try {
      // TODO: Add admin role check
      const users = await storage.getAllUsers();
      const pendingActions = await storage.getPendingAdminActions();
      
      const activeUsers = users.filter(u => u.isActive).length;
      const usersWithExceededLimits = await storage.getUsersWithExceededLimits();
      
      res.json({
        totalUsers: users.length,
        activeUsers,
        pendingAlerts: usersWithExceededLimits.length,
        pendingValidations: pendingActions.filter(a => a.actionType === 'death_validation').length,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch admin stats", error: error.message });
    }
  });

  app.get('/api/admin/pending-validations', combinedAuth, async (req: any, res) => {
    try {
      // TODO: Add admin role check
      const usersWithExceededLimits = await storage.getUsersWithExceededLimits();
      const usersWithNominees = await Promise.all(
        usersWithExceededLimits.map(async (user) => ({
          ...user,
          nominees: await storage.getNominees(user.id),
        }))
      );
      
      res.json(usersWithNominees);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch pending validations", error: error.message });
    }
  });

  app.post('/api/admin/approve-death-validation', combinedAuth, async (req: any, res) => {
    try {
      // TODO: Add admin role check
      const { userId, notes } = req.body;
      
      const action = await storage.createAdminAction({
        userId,
        actionType: 'death_validation',
        status: 'approved',
        notes,
      });
      
      // TODO: Send notifications to nominees
      
      res.json({ success: true, action });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to approve validation", error: error.message });
    }
  });

  // Admin routes - middleware to check if user is admin
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get fresh user data to check admin status
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Allow admin users or temporarily allow all for development
      if (!user.isAdmin) {
        console.log(`User ${user.email} attempted admin access but is not admin`);
        // For development, allow all authenticated users to access admin panel
        console.log(`Allowing access for development purposes`);
      }
      
      console.log(`Admin access granted for ${user.email}`);
      next();
    } catch (error) {
      console.error('Admin middleware error:', error);
      return res.status(500).json({ message: "Server error checking admin status" });
    }
  };

  // Admin dashboard stats
  app.get("/api/admin/stats", combinedAuth, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting admin stats:', error);
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  // Get all users for admin panel
  app.get("/api/admin/users", combinedAuth, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove sensitive information
      const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        accountStatus: u.accountStatus,
        wellBeingCounter: u.wellBeingCounter,
        maxWellBeingLimit: u.maxWellBeingLimit,
        lastWellBeingCheck: u.lastWellBeingCheck,
        lastLoginAt: u.lastLoginAt,
        alertFrequency: u.alertFrequency,
        createdAt: u.createdAt,
        isActive: u.isActive
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get activity logs
  app.get("/api/admin/activity-logs", combinedAuth, isAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error('Error getting activity logs:', error);
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  // Get users at risk
  app.get("/api/admin/users-at-risk", combinedAuth, isAdmin, async (req, res) => {
    try {
      const usersAtRisk = await storage.getUsersAtRisk();
      res.json(usersAtRisk);
    } catch (error) {
      console.error('Error getting users at risk:', error);
      res.status(500).json({ error: "Failed to fetch users at risk" });
    }
  });

  // Update user account status
  app.patch("/api/admin/users/:userId/status", combinedAuth, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { accountStatus, reason } = req.body;
      
      if (!['active', 'suspended', 'deactivated'].includes(accountStatus)) {
        return res.status(400).json({ error: "Invalid account status" });
      }

      await storage.updateUserStatus(userId, accountStatus);
      
      // Log admin action
      if (req.user) {
        await storage.createAdminLog({
          adminUserId: req.user.id,
          action: `user_${accountStatus}`,
          targetUserId: userId,
          details: reason || `User account ${accountStatus}`
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  // Get user details for admin
  app.get("/api/admin/users/:userId", combinedAuth, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUserById(userId);
      const userAssets = await storage.getAssetsByUserId(userId);
      const userNominees = await storage.getNomineesByUserId(userId);
      const moodEntries = await storage.getMoodEntriesByUserId(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user details without sensitive asset information
      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          accountStatus: user.accountStatus,
          wellBeingCounter: user.wellBeingCounter,
          maxWellBeingLimit: user.maxWellBeingLimit,
          lastWellBeingCheck: user.lastWellBeingCheck,
          alertFrequency: user.alertFrequency,
          createdAt: user.createdAt
        },
        assetCount: userAssets.length,
        nomineeCount: userNominees.length,
        moodEntryCount: moodEntries.length,
        nominees: userNominees.map((n: any) => ({
          id: n.id,
          fullName: n.fullName,
          relationship: n.relationship,
          isVerified: n.isVerified
        }))
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  });

  // Get admin logs
  app.get("/api/admin/logs", combinedAuth, isAdmin, async (req, res) => {
    try {
      const logs = await storage.getRecentAdminLogs(50);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin logs" });
    }
  });

  // Trigger well-being alert for user (admin action)
  app.post("/api/admin/users/:userId/alert", combinedAuth, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { message } = req.body;
      
      // Create well-being alert
      await storage.createWellBeingAlert({
        userId,
        alertType: 'admin_escalation',
        status: 'pending'
      });
      
      // Log admin action
      if (req.user) {
        await storage.createAdminLog({
          adminUserId: req.user.id,
          action: 'alert_triggered',
          targetUserId: userId,
          details: message || 'Admin triggered well-being alert'
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
