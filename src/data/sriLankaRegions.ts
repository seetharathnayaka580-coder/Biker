export interface RegionInfo {
  province: string;
  districts: string[];
}

export const SRI_LANKA_REGIONS: RegionInfo[] = [
  {
    province: 'Western Province',
    districts: ['Colombo', 'Gampaha', 'Kalutara'],
  },
  {
    province: 'Central Province',
    districts: ['Kandy', 'Matale', 'Nuwara Eliya'],
  },
  {
    province: 'Southern Province',
    districts: ['Galle', 'Matara', 'Hambantota'],
  },
  {
    province: 'North Western Province',
    districts: ['Kurunegala', 'Puttalam'],
  },
  {
    province: 'North Central Province',
    districts: ['Anuradhapura', 'Polonnaruwa'],
  },
  {
    province: 'Northern Province',
    districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
  },
  {
    province: 'Eastern Province',
    districts: ['Trincomalee', 'Batticaloa', 'Ampara'],
  },
  {
    province: 'Uva Province',
    districts: ['Badulla', 'Monaragala'],
  },
  {
    province: 'Sabaragamuwa Province',
    districts: ['Ratnapura', 'Kegalle'],
  },
];

export const ALL_DISTRICTS = SRI_LANKA_REGIONS.flatMap((r) => r.districts).sort();
export const ALL_PROVINCES = SRI_LANKA_REGIONS.map((r) => r.province);
