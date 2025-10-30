import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Employee } from '../types';
import { MOCK_EMPLOYEES } from '../constants';
import * as employeeService from '../services/employeeService';

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'avatarUrl'>) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  resetEmployees: () => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const fetchedEmployees = await employeeService.getEmployees();
        setEmployees(fetchedEmployees);
      } catch (error) {
        console.error("Failed to fetch employees from backend, loading mock data. Error:", error);
        setEmployees(MOCK_EMPLOYEES);
      }
    };
    loadEmployees();
  }, []);

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'avatarUrl'>) => {
    try {
      const newEmployee = await employeeService.addEmployee(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
    } catch (error) {
      console.error("Failed to add employee via API, adding to local state as fallback. Error:", error);
      const fallbackEmployee: Employee = {
        ...employeeData,
        id: `mock-${Date.now()}`,
        avatarUrl: `https://picsum.photos/seed/${Math.random()}/200/200`,
      };
      setEmployees(prev => [...prev, fallbackEmployee]);
    }
  };

  const updateEmployee = async (updatedEmployee: Employee) => {
    const originalEmployees = [...employees];
    // Optimistic update
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    try {
      await employeeService.updateEmployee(updatedEmployee);
    } catch (error) {
      console.error("Failed to update employee via API, reverting optimistic update. Error:", error);
      setEmployees(originalEmployees);
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    const originalEmployees = [...employees];
    // Optimistic update
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    try {
      await employeeService.deleteEmployee(employeeId);
    } catch (error) {
      console.error("Failed to delete employee via API, reverting optimistic update. Error:", error);
      setEmployees(originalEmployees);
    }
  };

  const resetEmployees = () => {
    // This remains a client-side operation for demonstration purposes
    setEmployees(MOCK_EMPLOYEES);
  };

  const value = {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    resetEmployees,
  };

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
