import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserSchema } from "@shared/schema";
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
  description: z.string().optional(),
  value: z.string().optional(),
  currency: z.string().default('INR'),
  contactMobile: z.string().optional(),
  contactEmail: z.string().optional(),
  storageLocation: z.string().default('local'),
  encryptedData: z.string().optional(),
});

const nomineeSchema = z.object({
  fullName: z.string(),
  relationship: z.string(),
  mobileNumber: z.string(),
  email: z.string().optional(),
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
      res.json({ success: true, message: "Step 1 completed" });
    } catch (error: any) {
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  app.post('/api/register/step2', async (req, res) => {
    try {
      const step1Data = req.session.registrationStep1;
      if (!step1Data) {
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
      
      res.json(asset);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create asset", error: error.message });
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
      const nomineeData = nomineeSchema.parse(req.body);
      
      const nominee = await storage.createNominee({
        ...nomineeData,
        userId,
      });
      
      res.json(nominee);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create nominee", error: error.message });
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

  const httpServer = createServer(app);
  return httpServer;
}
