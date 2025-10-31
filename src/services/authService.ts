import api from "./api";
import { LoginResponse, User } from "../types/user";

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await api.post<LoginResponse>("/auth/login", formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  localStorage.setItem('access_token', response.data.access_token);
  
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem('access_token');
  const response = await api.get<User>("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  localStorage.setItem('user_data', JSON.stringify(response.data));
  
  return response.data;
};

export const getCachedUser = (): User | null => {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
};