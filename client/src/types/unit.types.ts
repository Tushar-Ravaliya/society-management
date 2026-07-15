export interface Unit {
  id: string;
  block: string;
  flatNumber: string;
  floor: number;
  bhkType: string;
  status: 'occupied' | 'vacant';
}

export interface CreateUnitPayload {
  block: string;
  flatNumber: string;
  floor: number;
  bhkType: string;
}
