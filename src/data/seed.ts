import { AppState } from '../types';

export const SEED_STATE: AppState = {
  bikeId: "BKT-1374",
  vehicle: {
    owner: "Pathum Sachintha",
    model: "Pulsar N160 USD DC ABS",
    colour: "Brooklyn Black",
    regNo: "BKT-1374",
    chassisNo: "MD2B54DX8SCH14904",
    engineNo: "PDXCSH51772",
    bookNo: "POR002202510033-021",
    absSystem: "Dual-Channel ABS",
    oilSpec: "20W50 (1150 ml)",
    fuelType: "Octane 95 Euro-4",
    tyrePressures: "F: 25 PSI / R: 28-32",
    authority: "Dept. of Motor Traffic (Sri Lanka)",
    district: "Kurunegala, North Western Province",
  },
  odometer: 6063,
  services: [
    {
      id: "svc-1",
      label: "1st Service",
      date: "2026-03-11",
      km: 707,
      dealer: "M.V. Electronic & D.S. Motors",
      note: "Oil replacement, oil filter change, bike wash, and brake clean.",
      locked: true,
      partsReplaced: ["Engine Oil (20W50 / 10W40 Bajaj DTS-i)", "Oil Filter", "O-ring gasket"]
    },
    {
      id: "svc-2",
      label: "2nd Service",
      date: "2026-04-27",
      km: 2394,
      dealer: "M.V. Electronic & D.S. Motors",
      note: "Oil replacement, bike wash, and brake clean.",
      locked: true,
      partsReplaced: ["Engine Oil", "Chain Clean & Lube"]
    },
    {
      id: "svc-3",
      label: "3rd Service",
      date: "2026-07-15",
      km: 4894,
      dealer: "M.V. Electronic & D.S. Motors",
      note: "Oil replacement, oil filter change, bike wash, and brake clean.",
      locked: true,
      partsReplaced: ["Engine Oil", "Oil Filter", "Brake Pad Inspection"]
    },
  ],
  notes: [
    {
      id: "note-1",
      text: "Drive chain cleaned with Motul C1 & lubricated with C2 chain lube.",
      date: "2026-08-02",
      km: 5500,
      category: "chain"
    },
    {
      id: "note-2",
      text: "Tire pressure checked & filled: Front 25 PSI, Rear 28 PSI (Solo).",
      date: "2026-08-14",
      km: 5920,
      category: "tyre"
    }
  ],
  targets: [7688],
  serviceInterval: 2500,
};

// Clean default template for Friend's Bike managed by Chathura
export const CHATHURA_SEED_STATE: AppState = {
  bikeId: "chathura_bike",
  vehicle: {
    owner: "Chathura",
    model: "Bajaj Pulsar N160 Dual Channel ABS",
    colour: "Ebony Black",
    regNo: "WP Bxx-xxxx",
    chassisNo: "MD2B54DX-CHATHURA-01",
    engineNo: "PDXCSH-CHATHURA-01",
    bookNo: "POR0022026-CHATHURA",
    absSystem: "Dual-Channel ABS",
    oilSpec: "20W50 (1150 ml)",
    fuelType: "Octane 95 Euro-4",
    tyrePressures: "F: 25 PSI / R: 28-32",
    authority: "Dept. of Motor Traffic (Sri Lanka)",
    district: "Western Province",
  },
  odometer: 0,
  services: [],
  notes: [],
  targets: [2500],
  serviceInterval: 2500,
};

export function getSeedStateForBike(bikeId: string = 'BKT-1374'): AppState {
  if (bikeId && (bikeId.toLowerCase().includes('chathura') || bikeId === 'chathura_bike')) {
    return JSON.parse(JSON.stringify(CHATHURA_SEED_STATE));
  }
  return JSON.parse(JSON.stringify(SEED_STATE));
}
