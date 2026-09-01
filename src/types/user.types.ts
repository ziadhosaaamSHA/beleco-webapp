export type UserRole = "customer" | "admin" | "seller";

export interface UserAddress {
  id: string;
  label: string;
  governorate: string;
  city: string;
  street: string;
  isDefault: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  addresses?: UserAddress[];
  createdAt: number;
}
