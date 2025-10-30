import api from '../config/axiosConfig';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  pass: string;
}

export const login = async (credentials: LoginCredentials): Promise<User> => {
  // NGINX forwards requests from /auth/... to the auth microservice.
  // The request sent to the microservice will be just '/login'.
  const response = await api.post<User>('/auth/login', credentials);
  return response.data;
};

export const logout = async (): Promise<void> => {
  // Fire-and-forget is acceptable for logout.
  // The client-side state will be cleared regardless of the API call's success.
  api.post('/auth/logout');
};
