import api from '../config/axiosConfig';
import { Employee } from '../types';

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get<Employee[]>('/employee/employees');
  return response.data;
};

export const addEmployee = async (employeeData: Omit<Employee, 'id' | 'avatarUrl'>): Promise<Employee> => {
  const response = await api.post<Employee>('/employee/employees', employeeData);
  return response.data;
};

export const updateEmployee = async (employeeData: Employee): Promise<Employee> => {
  const response = await api.put<Employee>(`/employee/employees/${employeeData.id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  await api.delete(`/employee/employees/${employeeId}`);
};
