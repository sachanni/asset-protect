import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectToDatabase } from "./database";

// Basic validation schemas
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
});

const loginSchema = z.object({
  identifier: z.string(),
  password: z.string().optional(),
  otp: z.string().optional(),
});

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection
  await connectToDatabase();
  
  // Auth middleware
  await setupAuth(app);

  // Basic auth check
  const combinedAuth = (req: any, res: any, next: any) => {
    if (req.session?.userId) {
      req.userId = req.session.userId;
      return next();
    } 
    if (req.user?.id) {
      req.userId = req.user.id;
      return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
  };

  // Auth routes
  app.get('/api/auth/user', async (req: any, res: Response) => {
    try {
      if (req.session?.userId) {
        const user = await storage.getUserById(req.session.userId);
        if (user) {
          return res.json({ id: user._id, email: user.email, fullName: user.fullName });
        }
      }
      
      if (req.user?.id) {
        return res.json({ id: req.user.id, email: req.user.email });
      }
      
      res.status(401).json({ message: 'Unauthorized' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Registration Step 1
  app.post("/api/register/step1", async (req: Request, res: Response) => {
    try {
      const data = registrationStep1Schema.parse(req.body);
      
      // Check if mobile already exists
      const existingUser = await storage.getUserByMobile(data.mobileNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Mobile number already registered" });
      }
      
      req.session.registrationStep1 = data;
      res.json({ success: true, message: "Step 1 completed successfully" });
    } catch (error: any) {
      console.error("Registration Step 1 error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Registration Step 2
  app.post("/api/register/step2", async (req: Request, res: Response) => {
    try {
      const step2Data = registrationStep2Schema.parse(req.body);
      const step1Data = req.session.registrationStep1;
      
      if (!step1Data) {
        return res.status(400).json({ message: "Please complete step 1 first" });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(step2Data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user
      const user = await storage.createUser({
        ...step1Data,
        email: step2Data.email,
        password: step2Data.password,
        dateOfBirth: new Date(step1Data.dateOfBirth),
        isVerified: false,
      });

      // Clear session data
      delete req.session.registrationStep1;
      
      // Set user session
      req.session.userId = user._id.toString();

      res.json({ 
        success: true, 
        message: "Registration completed successfully",
        user: { id: user._id, email: user.email, fullName: user.fullName }
      });
    } catch (error: any) {
      console.error("Registration Step 2 error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Login route
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { identifier, password } = loginSchema.parse(req.body);
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Find user by email or mobile
      let user = await storage.getUserByEmail(identifier);
      if (!user) {
        user = await storage.getUserByMobile(identifier);
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user._id.toString();

      res.json({
        success: true,
        user: { id: user._id, email: user.email, fullName: user.fullName }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Logout route
  app.get("/api/logout", async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect('/');
    });
  });

  // Basic dashboard route
  app.get("/api/dashboard/stats", combinedAuth, async (req: any, res: Response) => {
    try {
      const assets = await storage.getAssetsByUserId(req.userId);
      const nominees = await storage.getNomineesByUserId(req.userId);
      
      res.json({
        totalAssets: assets.length,
        totalNominees: nominees.length,
        lastLogin: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Assets routes
  app.get("/api/assets", combinedAuth, async (req: any, res: Response) => {
    try {
      const assets = await storage.getAssetsByUserId(req.userId);
      res.json(assets);
    } catch (error: any) {
      console.error("Assets fetch error:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post("/api/assets", combinedAuth, async (req: any, res: Response) => {
    try {
      const { assetType, title, description, value, currency, contactInfo, storageLocation, accessInstructions } = req.body;
      
      if (!assetType || !title || !value) {
        return res.status(400).json({ message: "Asset type, title, and value are required" });
      }

      const assetData = {
        userId: req.userId,
        assetType,
        title,
        description: description || "",
        value,
        currency: currency || "USD",
        contactInfo: contactInfo || "",
        storageLocation: storageLocation || "local",
        accessInstructions: accessInstructions || ""
      };

      const asset = await storage.createAsset(assetData);
      res.json(asset);
    } catch (error: any) {
      console.error("Error creating asset:", error);
      res.status(500).json({ message: "Failed to create asset" });
    }
  });

  // Nominees routes
  app.get("/api/nominees", combinedAuth, async (req: any, res: Response) => {
    try {
      const nominees = await storage.getNomineesByUserId(req.userId);
      res.json(nominees);
    } catch (error: any) {
      console.error("Nominees fetch error:", error);
      res.status(500).json({ message: "Failed to fetch nominees" });
    }
  });

  app.post("/api/nominees", combinedAuth, async (req: any, res: Response) => {
    try {
      const { fullName, relationship, mobileNumber, email } = req.body;
      
      if (!fullName || !relationship || !mobileNumber) {
        return res.status(400).json({ message: "Full name, relationship, and mobile number are required" });
      }

      const nomineeData = {
        userId: req.userId,
        fullName,
        relationship,
        mobileNumber,
        email: email || undefined,
        isVerified: false
      };

      const nominee = await storage.createNominee(nomineeData);
      res.json(nominee);
    } catch (error: any) {
      console.error("Error creating nominee:", error);
      res.status(500).json({ message: "Failed to create nominee" });
    }
  });

  // Mood entries route for analytics dashboard
  app.get("/api/mood-entries", combinedAuth, async (req: any, res: Response) => {
    try {
      const moodEntries = await storage.getMoodEntriesByUserId(req.userId);
      res.json(moodEntries);
    } catch (error: any) {
      console.error("Mood entries fetch error:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  // Create mood entry
  app.post("/api/mood", combinedAuth, async (req: any, res: Response) => {
    try {
      const { mood, intensity, notes, context } = req.body;
      
      if (!mood || intensity === undefined) {
        return res.status(400).json({ message: "Mood and intensity are required" });
      }

      const moodEntry = await storage.createMoodEntry({
        userId: req.userId,
        mood,
        intensity: Number(intensity),
        notes,
        context
      });

      res.json(moodEntry);
    } catch (error: any) {
      console.error("Error creating mood entry:", error);
      res.status(500).json({ message: "Failed to save mood entry" });
    }
  });

  // Create sample mood data for new users
  app.post("/api/mood/sample-data", combinedAuth, async (req: any, res: Response) => {
    try {
      const sampleMoods = [
        { mood: "happy", intensity: 8, notes: "Great day at work!", context: "work" },
        { mood: "content", intensity: 7, notes: "Peaceful evening", context: "personal" },
        { mood: "excited", intensity: 9, notes: "Weekend plans!", context: "social" },
        { mood: "neutral", intensity: 5, notes: "Regular day", context: "daily" },
        { mood: "grateful", intensity: 8, notes: "Time with family", context: "family" },
        { mood: "energetic", intensity: 9, notes: "Morning workout", context: "health" },
        { mood: "anxious", intensity: 4, notes: "Meeting preparation", context: "work" },
        { mood: "very-happy", intensity: 10, notes: "Birthday celebration", context: "special" }
      ];

      const createdEntries = [];
      for (let i = 0; i < sampleMoods.length; i++) {
        const sampleMood = sampleMoods[i];
        const entry = await storage.createMoodEntry({
          userId: req.userId,
          ...sampleMood
        });
        createdEntries.push(entry);
      }

      res.json({ success: true, entriesCreated: createdEntries.length });
    } catch (error: any) {
      console.error("Error creating sample mood data:", error);
      res.status(500).json({ message: "Failed to create sample data" });
    }
  });

  return createServer(app);
}