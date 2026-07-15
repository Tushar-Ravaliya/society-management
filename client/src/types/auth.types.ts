export interface User {
  id: string;
  email: string;
  role: 'admin' | 'committee' | 'resident';
  unitId?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}
