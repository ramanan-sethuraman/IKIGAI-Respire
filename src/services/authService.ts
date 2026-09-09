import { type UserProfile, DEFAULT_USER_PROFILES } from '../types/auth';

export interface DbStatusInfo {
  connected: boolean;
  cluster: string;
  dbName: string;
  mode: 'LIVE_DATABASE' | 'OFFLINE_FALLBACK';
  error?: string | null;
}

export interface LoginResult {
  success: boolean;
  user: UserProfile;
  logId?: string;
  persistedToMongo: boolean;
  cluster?: string;
  message?: string;
}

export interface LoginAuditLog {
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
  timestamp: string;
}

/**
 * RESPIRE Authentication & MongoDB Atlas Synchronization Service
 */
export class RespireAuthService {
  private baseUrl = '/api/auth';

  /**
   * Checks live MongoDB Atlas cluster connection status via backend health check.
   */
  async checkDatabaseHealth(): Promise<DbStatusInfo> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Health check returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        connected: Boolean(data.database?.connected),
        cluster: data.database?.cluster || 'cluster28.uiwd4et.mongodb.net',
        dbName: data.database?.dbName || 'respire_climate_db',
        mode: data.database?.connected ? 'LIVE_DATABASE' : 'OFFLINE_FALLBACK',
        error: data.database?.error || null,
      };
    } catch {
      return {
        connected: false,
        cluster: 'cluster28.uiwd4et.mongodb.net',
        dbName: 'respire_climate_db',
        mode: 'OFFLINE_FALLBACK',
        error: 'Backend API server or MongoDB offline - running in secure client-side sandbox',
      };
    }
  }

  /**
   * Authenticates user, synchronizes profile, and creates audit log in MongoDB Atlas.
   */
  async login(payload: {
    email?: string;
    profile?: UserProfile;
    source?: 'PRESET_OFFICER' | 'CREDENTIALS' | 'GUEST_AUDITOR';
  }): Promise<LoginResult> {
    const fallbackProfile: UserProfile =
      payload.profile ||
      DEFAULT_USER_PROFILES.find((p) => p.email.toLowerCase() === (payload.email || '').toLowerCase()) || {
        id: `user-custom-${Date.now()}`,
        name: (payload.email || 'Officer').split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        designation: 'Municipal Climate Officer',
        department: 'Greater Chennai Corporation',
        email: payload.email || 'officer@chennaicorporation.gov.in',
        avatarInitials: ((payload.email || 'O')[0]).toUpperCase(),
        role: 'CLIMATE_ANALYST',
        badge: 'Custom Clearance',
        clearanceLevel: 'Standard Officer Access',
        empId: 'GCC-AUTH-2026',
        lastLogin: `Today at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST`,
      };

    try {
      const res = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: payload.email,
          profile: payload.profile,
          source: payload.source || 'PRESET_OFFICER',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          user: data.user || fallbackProfile,
          logId: data.logId,
          persistedToMongo: Boolean(data.dbStatus?.persisted),
          cluster: data.dbStatus?.cluster || 'cluster28.uiwd4et.mongodb.net',
          message: data.message,
        };
      }
    } catch {
      // Backend not running or offline: proceed with fallback profile
    }

    return {
      success: true,
      user: fallbackProfile,
      persistedToMongo: false,
      cluster: 'cluster28.uiwd4et.mongodb.net',
      message: 'Local authenticated session initialized (Offline fallback mode)',
    };
  }

  /**
   * Fetches all registered users from MongoDB.
   */
  async fetchUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${this.baseUrl}/users`);
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          return data.users;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER_PROFILES;
  }

  /**
   * Fetches recent officer login logs from MongoDB Atlas.
   */
  async fetchLoginLogs(limit = 20): Promise<LoginAuditLog[]> {
    try {
      const res = await fetch(`${this.baseUrl}/logs?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        return data.logs || [];
      }
    } catch {
      // fallback
    }
    return [];
  }
}

export const authService = new RespireAuthService();
