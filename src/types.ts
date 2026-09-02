export type UserRole = 'admin' | 'manager' | 'client';

export interface AuthSession {
  role: UserRole;
  username: string;
  email?: string;
  photoURL?: string;
  signedInAt: string;
  bikeId?: string;
  district?: string;
  province?: string;
  bikeNumber?: string;
  loginIp?: string;
}

export interface UserAccount {
  username: string;
  password?: string;
  ownerName: string;
  bikeNumber: string;
  district: string;
  province: string;
  role: UserRole;
  bikeId: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginIp?: string;
  lastLoginAt?: string;
  lastLoginLocation?: string;
  lastLoginDevice?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'suspended';
  createdBy?: string;
  photoUrl?: string;
}

export interface LoginLog {
  id: string;
  username: string;
  role: UserRole;
  ip: string;
  location?: string;
  device?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  timestamp: string;
  bikeId?: string;
  bikeNumber?: string;
  ownerName?: string;
}

export interface VehicleDetails {
  owner: string;
  model: string;
  colour: string;
  regNo: string;
  chassisNo: string;
  engineNo: string;
  bookNo: string;
  absSystem?: string;
  oilSpec?: string;
  fuelType?: string;
  tyrePressures?: string;
  authority?: string;
  district?: string;
  province?: string;
  photoUrl?: string;
  ownerPhotoUrl?: string;
}

export interface ServiceRecord {
  id: string;
  label: string;
  date: string;
  km: number;
  dealer: string;
  note: string;
  cost?: number;
  partsReplaced?: string[];
  locked?: boolean;
}

export type NoteCategory = 'chain' | 'oil' | 'tyre' | 'brake' | 'wash' | 'electrical' | 'general';

export interface MaintenanceNote {
  id: string;
  text: string;
  date: string;
  km?: number | null;
  category?: NoteCategory;
}

export interface AppState {
  bikeId?: string;
  vehicle: VehicleDetails;
  odometer: number;
  services: ServiceRecord[];
  notes: MaintenanceNote[];
  targets: number[];
  serviceInterval: number;
}

export type CenterCategory = 'dealer' | 'spare_parts' | 'fuel' | 'mechanic' | 'emergency';

export interface ServiceCenter {
  id: string;
  name: string;
  category: CenterCategory;
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  openNow?: boolean;
  openingHours?: string;
  services?: string[];
  servicesOffered?: string[];
  isAuthorizedBajaj?: boolean;
  distanceKm?: number;
}
