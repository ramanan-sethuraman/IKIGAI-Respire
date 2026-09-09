import { MongoClient, type Db, type Collection } from 'mongodb';
import dotenv from 'dotenv';
import { DEFAULT_USER_PROFILES, type UserProfile } from '../src/types/auth';

dotenv.config();

export interface LoginLogDocument {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  badge: string;
  department: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED';
  source: 'PRESET_OFFICER' | 'CREDENTIALS' | 'GUEST_AUDITOR';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface UserDocument extends UserProfile {
  _id?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const uri = process.env.MONGODB_URI || '';
let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let connectionError: string | null = null;

/**
 * Initializes and connects to the MongoDB Atlas Cluster.
 */
export async function connectToDatabase(): Promise<{ isConnected: boolean; error: string | null }> {
  if (!uri || uri.includes('<db_password>')) {
    connectionError = 'Database password is placeholder (<db_password>). Update .env with actual credentials.';
    console.warn(`[MongoDB Warning] ${connectionError}`);
    return { isConnected: false, error: connectionError };
  }

  try {
    if (!client) {
      client = new MongoClient(uri, {
        connectTimeoutMS: 8000,
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 10,
      });
    }

    await client.connect();
    db = client.db('respire_climate_db');
    isConnected = true;
    connectionError = null;
    console.log('🍃 [MongoDB Atlas] Successfully connected to cluster28.uiwd4et.mongodb.net (respire_climate_db)');

    // Initialize collections and seed default officer profiles
    await seedDefaultProfiles();

    return { isConnected: true, error: null };
  } catch (err: unknown) {
    isConnected = false;
    connectionError = (err as Error).message || 'Failed to connect to MongoDB cluster';
    console.error('❌ [MongoDB Atlas Error]', connectionError);
    return { isConnected: false, error: connectionError };
  }
}

/**
 * Seeds default GCC officer profiles to MongoDB if not already present.
 */
async function seedDefaultProfiles(): Promise<void> {
  if (!db) return;
  try {
    const usersCol = db.collection<UserDocument>('users');
    const logsCol = db.collection<LoginLogDocument>('login_logs');

    // Create unique index on email & empId
    await usersCol.createIndex({ email: 1 }, { unique: true });
    await usersCol.createIndex({ empId: 1 });
    await logsCol.createIndex({ timestamp: -1 });
    await logsCol.createIndex({ userId: 1 });

    for (const profile of DEFAULT_USER_PROFILES) {
      await usersCol.updateOne(
        { email: profile.email.toLowerCase() },
        {
          $set: {
            ...profile,
            email: profile.email.toLowerCase(),
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }
    console.log('✅ [MongoDB Atlas] Initialized collections and verified officer profiles in "users".');
  } catch (err) {
    console.warn('[MongoDB Atlas] Seeding warning:', err);
  }
}

export function getDb(): Db | null {
  return db;
}

export function isDbConnected(): boolean {
  return isConnected;
}

export function getDbError(): string | null {
  return connectionError;
}

/**
 * Records an officer login event in the login_logs collection and updates user profile.
 */
export async function recordUserLogin(
  profile: UserProfile,
  options: {
    ipAddress?: string;
    userAgent?: string;
    source?: 'PRESET_OFFICER' | 'CREDENTIALS' | 'GUEST_AUDITOR';
  } = {}
): Promise<{ user: UserProfile; logId: string }> {
  const now = new Date();
  const nowFormatted = `Today at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST`;

  const updatedProfile: UserProfile = {
    ...profile,
    lastLogin: nowFormatted,
  };

  const logEntry: LoginLogDocument = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: profile.id,
    userName: profile.name,
    userEmail: profile.email.toLowerCase(),
    role: profile.role,
    badge: profile.badge,
    department: profile.department,
    ipAddress: options.ipAddress || '127.0.0.1',
    userAgent: options.userAgent || 'RESPIRE Client',
    status: 'SUCCESS',
    source: options.source || 'PRESET_OFFICER',
    timestamp: now,
  };

  if (db && isConnected) {
    try {
      const usersCol = db.collection<UserDocument>('users');
      const logsCol = db.collection<LoginLogDocument>('login_logs');

      // Upsert user profile
      await usersCol.updateOne(
        { email: profile.email.toLowerCase() },
        {
          $set: {
            ...updatedProfile,
            email: profile.email.toLowerCase(),
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
      );

      // Insert audit log
      await logsCol.insertOne(logEntry);
      console.log(`📝 [MongoDB Atlas] Saved login audit log for ${profile.name} (${profile.email})`);
    } catch (err) {
      console.warn('[MongoDB Atlas] Could not persist login record to live DB:', err);
    }
  }

  return { user: updatedProfile, logId: logEntry.id };
}

/**
 * Retrieves all registered users from MongoDB (or defaults).
 */
export async function getUsers(): Promise<UserProfile[]> {
  if (db && isConnected) {
    try {
      const usersCol = db.collection<UserDocument>('users');
      const docs = await usersCol.find({}).toArray();
      if (docs.length > 0) {
        return docs.map((d) => ({
          id: d.id,
          name: d.name,
          designation: d.designation,
          department: d.department,
          email: d.email,
          avatarInitials: d.avatarInitials,
          role: d.role,
          badge: d.badge,
          clearanceLevel: d.clearanceLevel,
          empId: d.empId,
          lastLogin: d.lastLogin,
        }));
      }
    } catch (err) {
      console.warn('[MongoDB Atlas] Failed to retrieve users from DB:', err);
    }
  }
  return DEFAULT_USER_PROFILES;
}

/**
 * Retrieves recent login audit records.
 */
export async function getLoginLogs(limit = 20): Promise<LoginLogDocument[]> {
  if (db && isConnected) {
    try {
      const logsCol = db.collection<LoginLogDocument>('login_logs');
      return await logsCol.find({}).sort({ timestamp: -1 }).limit(limit).toArray();
    } catch (err) {
      console.warn('[MongoDB Atlas] Failed to fetch login logs:', err);
    }
  }
  return [];
}
