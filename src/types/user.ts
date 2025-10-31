export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

