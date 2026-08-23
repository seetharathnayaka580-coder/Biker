export interface VehicleDetails {
  owner: string;
  model: string;
  colour: string;
  regNo: string;
  chassisNo: string;
  engineNo: string;
  bookNo: string;
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
