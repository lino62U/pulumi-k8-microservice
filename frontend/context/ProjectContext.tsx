import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Project } from '../types';
import { MOCK_PROJECTS } from '../constants';
import * as projectService from '../services/projectService';

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'progress' | 'assignedTeamIds'>) => Promise<void>;
  updateProject: (project: Omit<Project, 'assignedTeamIds' | 'progress' | 'id'> & { id: string }) => Promise<void>;
  updateProjectTeam: (projectId: string, teamIds: string[]) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const fetchedProjects = await projectService.getProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Failed to fetch projects from backend, loading mock data. Error:", error);
        setProjects(MOCK_PROJECTS);
      }
    };
    loadProjects();
  }, []);

  const addProject = async (projectData: Omit<Project, 'id' | 'progress' | 'assignedTeamIds'>) => {
    try {
      const newProject = await projectService.addProject(projectData);
      setProjects(prev => [...prev, newProject]);
    } catch (error) {
      console.error("Failed to add project via API, adding to local state as fallback. Error:", error);
      const fallbackProject: Project = {
        ...projectData,
        id: `mock-proj-${Date.now()}`,
        progress: 0,
        assignedTeamIds: [],
      };
      setProjects(prev => [...prev, fallbackProject]);
    }
  };

  const updateProject = async (updatedProjectData: Omit<Project, 'assignedTeamIds' | 'progress' | 'id'> & { id: string }) => {
    const originalProjects = [...projects];
    const originalProject = originalProjects.find(p => p.id === updatedProjectData.id);
    if (!originalProject) return;

    // Optimistic update
    const updatedProject = { ...originalProject, ...updatedProjectData };
    setProjects(prev => prev.map(p => (p.id === updatedProjectData.id ? updatedProject : p)));
    try {
      await projectService.updateProject(updatedProjectData);
    } catch (error) {
      console.error("Failed to update project via API, reverting. Error:", error);
      setProjects(originalProjects);
    }
  };

  const updateProjectTeam = async (projectId: string, teamIds: string[]) => {
    const originalProjects = [...projects];
    const originalProject = originalProjects.find(p => p.id === projectId);
    if (!originalProject) return;

    // Optimistic update
    const updatedProject = { ...originalProject, assignedTeamIds: teamIds };
    setProjects(prev => prev.map(p => (p.id === projectId ? updatedProject : p)));
    try {
      await projectService.updateProjectTeam(projectId, teamIds);
    } catch (error) {
      console.error("Failed to update project team via API, reverting. Error:", error);
      setProjects(originalProjects);
    }
  };

  const value = {
    projects,
    addProject,
    updateProject,
    updateProjectTeam,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
