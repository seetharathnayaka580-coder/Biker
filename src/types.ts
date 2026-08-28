export type UserRole = 'admin' | 'client';

export interface AuthSession {
  role: UserRole;
  username: string;
  email?: string;
  photoURL?: string;
  signedInAt: string;
}

export interface VehicleDetails {
  owner: string;
  model: string;
  colour: string;
  regNo: string;
  chassisNo: string;
  engineNo: string;
  bookNo: string;
  photoUrl?: string;
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
  phone: string;
  openingHours: string;
  rating: number;
  servicesOffered: string[];
  isAuthorizedBajaj: boolean;
  distanceKm?: number;
}

