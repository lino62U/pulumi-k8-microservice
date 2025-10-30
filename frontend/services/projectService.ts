import api from '../config/axiosConfig';
import { Project } from '../types';

export const getProjects = async (): Promise<Project[]> => {
  // Assuming projects are managed by the employee microservice as per NGINX config
  const response = await api.get<Project[]>('/employee/projects');
  return response.data;
};

export const addProject = async (projectData: Omit<Project, 'id' | 'progress' | 'assignedTeamIds'>): Promise<Project> => {
  const response = await api.post<Project>('/employee/projects', projectData);
  return response.data;
};

export const updateProject = async (projectData: Omit<Project, 'assignedTeamIds' | 'progress' | 'id'> & { id: string }): Promise<Project> => {
  const response = await api.put<Project>(`/employee/projects/${projectData.id}`, projectData);
  return response.data;
};

export const updateProjectTeam = async (projectId: string, teamIds: string[]): Promise<Project> => {
  const response = await api.put<Project>(`/employee/projects/${projectId}/team`, { teamIds });
  return response.data;
};
