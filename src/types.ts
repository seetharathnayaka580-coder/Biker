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

export interface ServiceItemCost {
  id?: string;
  name: string;
  amount: number;
  category?: ExpenseCategory;
}

export interface ServiceRecord {
  id: string;
  label: string;
  date: string;
  km: number;
  dealer: string;
  note: string;
  cost?: number; // Total cost (only total cost displayed on the service record itself)
  serviceFee?: number; // Service/Labour fee itself
  partsCost?: number; // Total cost for the individual parts
  items?: ServiceItemCost[]; // Detailed individual parts & service item breakdown
  partsReplaced?: string[];
  locked?: boolean;
}

export type NoteCategory = 'chain' | 'oil' | 'tyre' | 'brake' | 'wash' | 'electrical' | 'general';

export type ExpenseCategory =
  | 'service'
  | 'oil_fluids'
  | 'spares_parts'
  | 'chain_sprocket'
  | 'tyres_wheels'
  | 'wash_detail'
  | 'electrical'
  | 'labour_fee'
  | 'statutory'
  | 'accessories';

export interface MaintenanceExpense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  km?: number | null;
  vendor?: string;
  invoiceNo?: string;
  paymentMethod?: 'cash' | 'card' | 'online' | 'other';
  note?: string;
  serviceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  expenses?: MaintenanceExpense[];
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
