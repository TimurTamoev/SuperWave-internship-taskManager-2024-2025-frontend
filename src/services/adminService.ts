import api from "./api";
import { User, UserCreate, UserUpdate } from "../types/user";

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    const token = localStorage.getItem('access_token');
    const response = await api.get<User[]>("/users/user/get/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const token = localStorage.getItem('access_token');
    const response = await api.get<User>(`/users/user/get/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async createUser(userData: UserCreate): Promise<User> {
    const token = localStorage.getItem('access_token');
    const response = await api.post<User>("/auth/users/register", userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateUser(id: number, userData: UserUpdate): Promise<User> {
    const token = localStorage.getItem('access_token');
    const response = await api.patch<User>(`/users/user/update/${id}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await api.delete(`/users/user/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async activateUser(id: number): Promise<User> {
    const token = localStorage.getItem('access_token');
    const response = await api.patch<User>(`/users/user/activate/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async deactivateUser(id: number): Promise<User> {
    const token = localStorage.getItem('access_token');
    const response = await api.patch<User>(`/users/user/deactivate/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

