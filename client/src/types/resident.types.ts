import type { Unit } from './unit.types';

export interface Resident {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  residencyType: 'owner' | 'tenant';
  vehicleNumber?: string | null;
  unit: Pick<Unit, 'id' | 'block' | 'flatNumber'>;
}

export interface OnboardResidentPayload {
  email: string;
  name: string;
  unitId: string;
  residencyType: 'owner' | 'tenant';
  phoneNumber?: string;
  vehicleNumber?: string;
}

export interface UpdateResidentPayload {
  name?: string;
  phoneNumber?: string | null;
  residencyType?: 'owner' | 'tenant';
  vehicleNumber?: string | null;
}
