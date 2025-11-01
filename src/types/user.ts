export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  email_password?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  email_password?: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  password?: string;
  full_name?: string;
  email_password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

