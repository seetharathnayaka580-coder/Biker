export type UserRole = 'admin' | 'client';

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
  email?: string;
  photoUrl?: string;
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
