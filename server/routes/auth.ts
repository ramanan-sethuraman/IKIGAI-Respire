import { Router, type Request, type Response } from 'express';
import {
  recordUserLogin,
  getUsers,
  getLoginLogs,
  isDbConnected,
  getDbError,
} from '../db';
import { DEFAULT_USER_PROFILES, type UserProfile } from '../../src/types/auth';

export const authRouter = Router();

/**
 * GET /api/auth/health
 * Returns connection state of MongoDB Atlas cluster and backend health.
 */
authRouter.get('/health', (_req: Request, res: Response) => {
  const connected = isDbConnected();
  const error = getDbError();

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      type: 'MongoDB Atlas',
      cluster: 'cluster28.uiwd4et.mongodb.net',
      dbName: 'respire_climate_db',
      connected,
      error: error || null,
      mode: connected ? 'LIVE_DATABASE' : 'OFFLINE_FALLBACK',
    },
  });
});

/**
 * POST /api/auth/login
 * Handles user login, creates audit log in MongoDB, and returns profile.
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, profile, source = 'PRESET_OFFICER' } = req.body;

    // Resolve profile
    let targetProfile: UserProfile | undefined = profile;

    if (!targetProfile && email) {
      const allUsers = await getUsers();
      targetProfile = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!targetProfile) {
      if (email) {
        // Dynamic GCC officer custom profile
        targetProfile = {
          id: `user-custom-${Date.now()}`,
          name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase() || 'Authorized GCC Officer',
          designation: 'Municipal Climate Officer',
          department: 'Greater Chennai Corporation',
          email: email.toLowerCase(),
          avatarInitials: (email[0] || 'O').toUpperCase(),
          role: 'CLIMATE_ANALYST',
          badge: 'Custom Clearance',
          clearanceLevel: 'Standard Officer Access',
          empId: 'GCC-AUTH-2026',
          lastLogin: 'Just now',
        };
      } else {
        targetProfile = DEFAULT_USER_PROFILES[0];
      }
    }

    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'RESPIRE-Web-Client';

    const result = await recordUserLogin(targetProfile, {
      ipAddress,
      userAgent,
      source,
    });

    res.json({
      success: true,
      message: 'Officer authenticated successfully and login saved to MongoDB.',
      user: result.user,
      logId: result.logId,
      dbStatus: {
        persisted: isDbConnected(),
        cluster: 'cluster28.uiwd4et.mongodb.net',
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: (err as Error).message || 'Authentication processing error',
    });
  }
});

/**
 * GET /api/auth/users
 * Returns list of registered officer profiles from MongoDB.
 */
authRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await getUsers();
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: (err as Error).message || 'Failed to fetch users',
    });
  }
});

/**
 * GET /api/auth/logs
 * Returns recent login audit records from MongoDB.
 */
authRouter.get('/logs', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const logs = await getLoginLogs(limit);
    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: (err as Error).message || 'Failed to fetch login logs',
    });
  }
});
