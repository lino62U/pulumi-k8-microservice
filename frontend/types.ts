
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Admin' | 'Manager';
  department: string;
}

export enum EmployeeStatus {
    Active = 'Active',
    OnLeave = 'On Leave',
    Terminated = 'Terminated'
}

export interface Employee {
  id: string;
  name:string;
  email: string;
  role: string;
  department: string;
  startDate: string;
  status: EmployeeStatus;
  avatarUrl: string;
}

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'Present' | 'Late' | 'Absent';
}

export type Theme = 'light' | 'dark' | 'system';

export type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Project {
  id: string;
  name: string;
  client: string;
  deadline: string;
  status: ProjectStatus;
  progress: number; // A number from 0 to 100
  assignedTeamIds: string[];
}
