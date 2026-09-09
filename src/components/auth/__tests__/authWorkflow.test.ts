import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_USER_PROFILES, type UserProfile } from '../../../types/auth';

test('AUTH WORKFLOW: Team officer profiles integrity', () => {
  assert.equal(DEFAULT_USER_PROFILES.length, 4, 'Should provide 4 core team officer profiles');

  // Verify Ramanan S Profile
  const ramanan = DEFAULT_USER_PROFILES.find((p) => p.name === 'Ramanan S');
  assert.ok(ramanan, 'Ramanan S profile must exist');
  assert.equal(ramanan.email, 'ramanan.s@respire.gov.in');
  assert.equal(ramanan.avatarInitials, 'RS');
  assert.equal(ramanan.badge, 'Executive Lead');
  assert.ok(ramanan.clearanceLevel.includes('Level 1'));

  // Verify Sriprathip S Profile
  const sriprathip = DEFAULT_USER_PROFILES.find((p) => p.name === 'Sriprathip S');
  assert.ok(sriprathip, 'Sriprathip S profile must exist');
  assert.equal(sriprathip.email, 'sriprathip.s@respire.gov.in');
  assert.equal(sriprathip.avatarInitials, 'SS');
  assert.equal(sriprathip.badge, 'Spatial Lead');

  // Verify Ravisankar S Profile
  const ravisankar = DEFAULT_USER_PROFILES.find((p) => p.name === 'Ravisankar S');
  assert.ok(ravisankar, 'Ravisankar S profile must exist');
  assert.equal(ravisankar.email, 'ravisankar.s@respire.gov.in');
  assert.equal(ravisankar.avatarInitials, 'RS');
  assert.equal(ravisankar.badge, 'Systems Lead');

  // Verify Sanjay K Profile
  const sanjay = DEFAULT_USER_PROFILES.find((p) => p.name === 'Sanjay K');
  assert.ok(sanjay, 'Sanjay K profile must exist');
  assert.equal(sanjay.email, 'sanjay.k@respire.gov.in');
  assert.equal(sanjay.avatarInitials, 'SK');
  assert.equal(sanjay.badge, 'Operations Lead');
});

test('AUTH WORKFLOW: All profiles contain required security and UI attributes', () => {
  DEFAULT_USER_PROFILES.forEach((profile: UserProfile) => {
    assert.ok(profile.id, 'Profile must have unique ID');
    assert.ok(profile.name, 'Profile must have name');
    assert.ok(profile.designation, 'Profile must have designation');
    assert.ok(profile.department, 'Profile must have department');
    assert.ok(profile.email.includes('@'), 'Profile must have valid email');
    assert.ok(profile.avatarInitials.length >= 2, 'Profile must have 2 initials');
    assert.ok(profile.badge, 'Profile must have badge');
    assert.ok(profile.clearanceLevel, 'Profile must have clearance level');
    assert.ok(profile.empId, 'Profile must have empId');
  });
});
