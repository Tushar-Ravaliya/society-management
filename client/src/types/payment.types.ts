export interface Payment {
  id: string;
  amount: string;
  transactionReference: string;
  status: 'pending' | 'verified' | 'failed';
  paymentMethod: 'online' | 'cash' | 'bank_transfer' | 'cheque';
  paymentDate: string;
  residentName: string;
  billNumber: string;
}

export interface RecordOfflinePayload {
  billId: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
  amount: number;
  transactionReference: string;
}

export interface VerifyOnlinePayload {
  billId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentPayload {
  status: 'verified' | 'failed';
  verificationNotes?: string;
}
