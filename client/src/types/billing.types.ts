export interface Bill {
  id: string;
  billNumber: string;
  billingPeriod: string;
  maintenanceAmount: string;
  waterAmount: string;
  electricityAmount: string;
  penaltyAmount: string;
  otherAmount: string;
  totalAmount: string;
  status: 'unpaid' | 'paid' | 'partially_paid' | 'overdue';
  dueDate: string;
  unit?: {
    block: string;
    flatNumber: string;
  };
}

export interface GenerateBatchPayload {
  billingPeriod: string;
  dueDate: string;
  defaultMaintenance: number;
  defaultWater: number;
  defaultElectricity: number;
}
