
import { Employee, AttendanceRecord, EmployeeStatus, Project } from './types';

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'Creative Director', department: 'Creative', startDate: '2022-01-15', status: EmployeeStatus.Active, avatarUrl: 'https://picsum.photos/id/1005/200/200' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Account Manager', department: 'Client Services', startDate: '2021-11-20', status: EmployeeStatus.Active, avatarUrl: 'https://picsum.photos/id/1011/200/200' },
  { id: '3', name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'Senior Developer', department: 'Technology', startDate: '2020-05-10', status: EmployeeStatus.OnLeave, avatarUrl: 'https://picsum.photos/id/1025/200/200' },
  { id: '4', name: 'Emily Brown', email: 'emily.brown@example.com', role: 'Graphic Designer', department: 'Creative', startDate: '2023-02-01', status: EmployeeStatus.Active, avatarUrl: 'https://picsum.photos/id/1012/200/200' },
  { id: '5', name: 'David Wilson', email: 'david.wilson@example.com', role: 'HR Manager', department: 'Administration', startDate: '2019-08-12', status: EmployeeStatus.Active, avatarUrl: 'https://picsum.photos/id/1027/200/200' },
  { id: '6', name: 'Sarah Clark', email: 'sarah.clark@example.com', role: 'Copywriter', department: 'Creative', startDate: '2023-07-22', status: EmployeeStatus.Active, avatarUrl: 'https://picsum.photos/id/1013/200/200' },
  { id: '7', name: 'Robert Turner', email: 'robert.turner@example.com', role: 'Media Buyer', department: 'Media', startDate: '2022-09-05', status: EmployeeStatus.Terminated, avatarUrl: 'https://picsum.photos/id/1029/200/200' },
  { id: '8', name: 'Olivia Martinez', email: 'olivia.martinez@example.com', role: 'Social Media Manager', department: 'Digital', startDate: '2022-03-18', status: EmployeeStatus.Active, avatarUrl: 'https://picsum.photos/id/1014/200/200' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: 'att1', employeeId: '1', employeeName: 'John Doe', date: '2024-07-28', checkIn: '09:05', checkOut: '17:30', status: 'Present' },
    { id: 'att2', employeeId: '2', employeeName: 'Jane Smith', date: '2024-07-28', checkIn: '09:15', checkOut: '17:45', status: 'Late' },
    { id: 'att3', employeeId: '3', employeeName: 'Mike Johnson', date: '2024-07-28', checkIn: '-', checkOut: '-', status: 'Absent' },
    { id: 'att4', employeeId: '4', employeeName: 'Emily Brown', date: '2024-07-28', checkIn: '08:55', checkOut: '17:20', status: 'Present' },
    { id: 'att5', employeeId: '1', employeeName: 'John Doe', date: '2024-07-27', checkIn: '09:00', checkOut: '17:25', status: 'Present' },
    { id: 'att6', employeeId: '2', employeeName: 'Jane Smith', date: '2024-07-27', checkIn: '09:02', checkOut: '17:33', status: 'Present' },
    { id: 'att7', employeeId: '5', employeeName: 'David Wilson', date: '2024-07-28', checkIn: '08:45', checkOut: '18:00', status: 'Present' },
    { id: 'att8', employeeId: '6', employeeName: 'Sarah Clark', date: '2024-07-28', checkIn: '-', checkOut: '-', status: 'Absent' },
];

export const MOCK_PROJECTS: Project[] = [
    { id: 'proj1', name: 'QuantumLeap Campaign', client: 'Innovate Corp', deadline: '2024-09-30', status: 'In Progress', progress: 75, assignedTeamIds: ['1', '4', '6'] },
    { id: 'proj2', name: 'Nebula App Launch', client: 'TechFrontier', deadline: '2024-10-15', status: 'In Progress', progress: 40, assignedTeamIds: ['2', '3', '8'] },
    { id: 'proj3', name: 'EcoConnect Branding', client: 'GreenSolutions', deadline: '2024-08-25', status: 'Completed', progress: 100, assignedTeamIds: ['1', '2', '4'] },
    { id: 'proj4', name: 'Starlight Socials', client: 'Momentum Media', deadline: '2024-11-01', status: 'Not Started', progress: 0, assignedTeamIds: ['8'] }
];
