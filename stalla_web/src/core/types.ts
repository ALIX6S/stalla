export type Role = "ADMIN" | "VENDOR";

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface AuthUser {
  id: number;
  role: Role;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}

export type StandCategory = "STANDARD" | "PREMIUM";
