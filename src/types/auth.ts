export type UserRole =
  | 'COMMISSIONER'
  | 'CHIEF_ENGINEER'
  | 'CLIMATE_ANALYST'
  | 'HEALTH_OFFICER'
  | 'PUBLIC_AUDITOR';

export interface UserProfile {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  avatarInitials: string;
  role: UserRole;
  badge: string;
  clearanceLevel: string;
  empId: string;
  lastLogin?: string;
}

export const DEFAULT_USER_PROFILES: UserProfile[] = [
  {
    id: 'user-ramanan-01',
    name: 'Ramanan S',
    designation: 'Lead Climate Resilience Architect',
    department: 'GCC Urban Climate Governance Cell',
    email: 'ramanan.s@respire.gov.in',
    avatarInitials: 'RS',
    role: 'COMMISSIONER',
    badge: 'Executive Lead',
    clearanceLevel: 'Level 1 Supreme Administrative Clearance',
    empId: 'GCC-RESPIRE-01',
    lastLogin: 'Active now',
  },
  {
    id: 'user-sriprathip-02',
    name: 'Sriprathip S',
    designation: 'Chief GIS & Satellite Telemetry Lead',
    department: 'State Spatial Remote Sensing & TNSDI Unit',
    email: 'sriprathip.s@respire.gov.in',
    avatarInitials: 'SS',
    role: 'CLIMATE_ANALYST',
    badge: 'Spatial Lead',
    clearanceLevel: 'Earth Observation & GIS Telemetry Clearance',
    empId: 'GCC-RESPIRE-02',
    lastLogin: 'Today at 09:10 AM IST',
  },
  {
    id: 'user-ravisankar-03',
    name: 'Ravisankar S',
    designation: 'Chief Thermal Modelling & Systems Lead',
    department: 'Microclimatic Analytics & Physics Unit',
    email: 'ravisankar.s@respire.gov.in',
    avatarInitials: 'RS',
    role: 'CHIEF_ENGINEER',
    badge: 'Systems Lead',
    clearanceLevel: 'Algorithm & Engineering Sign-off Clearance',
    empId: 'GCC-RESPIRE-03',
    lastLogin: 'Today at 08:45 AM IST',
  },
  {
    id: 'user-sanjay-04',
    name: 'Sanjay K',
    designation: 'Municipal Interventions & Planning Officer',
    department: 'GCC Disaster Management & Works Division',
    email: 'sanjay.k@respire.gov.in',
    avatarInitials: 'SK',
    role: 'HEALTH_OFFICER',
    badge: 'Operations Lead',
    clearanceLevel: 'Municipal Planning & Deployment Clearance',
    empId: 'GCC-RESPIRE-04',
    lastLogin: 'Today at 08:30 AM IST',
  },
];
