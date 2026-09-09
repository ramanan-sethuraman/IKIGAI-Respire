import { describe, it } from 'node:test';
import assert from 'node:assert';
import { authService, RespireAuthService } from '../authService';
import { DEFAULT_USER_PROFILES, type UserProfile } from '../../types/auth';

describe('RESPIRE AUTHENTICATION & MONGODB ATLAS SERVICE SUITE', () => {
  it('should instantiate authService singleton correctly', () => {
    assert.ok(authService instanceof RespireAuthService);
  });

  it('should default to graceful offline fallback when backend or cluster is unreachable', async () => {
    const health = await authService.checkDatabaseHealth();
    assert.strictEqual(typeof health.connected, 'boolean');
    assert.strictEqual(health.cluster, 'cluster28.uiwd4et.mongodb.net');
    assert.strictEqual(health.dbName, 'respire_climate_db');
  });

  it('should process login for predefined officer (Ramanan S) and format session timestamp', async () => {
    const officer = DEFAULT_USER_PROFILES[0];
    const result = await authService.login({
      email: officer.email,
      profile: officer,
      source: 'PRESET_OFFICER',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.user.name, 'Ramanan S');
    assert.strictEqual(result.user.role, 'COMMISSIONER');
    assert.strictEqual(result.user.email, 'ramanan.s@respire.gov.in');
    assert.ok(result.user.lastLogin?.includes('Today at') || result.user.lastLogin === 'Active now');
  });

  it('should process custom GCC officer login with dynamically derived profile', async () => {
    const result = await authService.login({
      email: 'aravind.k@chennaicorporation.gov.in',
      source: 'CREDENTIALS',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.user.email, 'aravind.k@chennaicorporation.gov.in');
    assert.strictEqual(result.user.name, 'ARAVIND K');
    assert.strictEqual(result.user.department, 'Greater Chennai Corporation');
    assert.strictEqual(result.user.role, 'CLIMATE_ANALYST');
    assert.ok(result.user.lastLogin?.includes('Today at'));
  });

  it('should return default officer profiles when offline users list requested', async () => {
    const users = await authService.fetchUsers();
    assert.ok(Array.isArray(users));
    assert.strictEqual(users.length >= 4, true);
    assert.strictEqual(users[0].name, 'Ramanan S');
    assert.strictEqual(users[1].name, 'Sriprathip S');
    assert.strictEqual(users[2].name, 'Ravisankar S');
    assert.strictEqual(users[3].name, 'Sanjay K');
  });
});
