
import React, { useState, useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useEmployees } from '../context/EmployeeContext';
import { Project, Employee, ProjectStatus } from '../types';
import Modal from '../components/ui/Modal';
import ProjectForm from '../components/ProjectForm';
import ManageTeamModal from '../components/ManageTeamModal';

const statusColorMap: Record<ProjectStatus, { bg: string; text: string; progress: string }> = {
  'Not Started': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', progress: 'bg-gray-400' },
  'In Progress': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', progress: 'bg-blue-500' },
  'Completed': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', progress: 'bg-green-500' },
};

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);


const ProjectCard: React.FC<{ project: Project; employeesMap: Map<string, Employee>; onEdit: () => void; onManageTeam: () => void; }> = ({ project, employeesMap, onEdit, onManageTeam }) => {
    const assignedTeam = project.assignedTeamIds.map(id => employeesMap.get(id)).filter(Boolean) as Employee[];
    const statusInfo = statusColorMap[project.status];
    
    return (
        <div className="bg-white dark:bg-dark-accent p-5 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{project.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{project.client}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>{project.status}</span>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">Progress</span>
                        <span className="font-semibold">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className={`${statusInfo.progress} h-2.5 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team</p>
                    <div className="flex items-center space-x-2">
                        {assignedTeam.slice(0, 4).map(member => (
                            <img key={member.id} src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" title={member.name} />
                        ))}
                        {assignedTeam.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold">
                                +{assignedTeam.length - 4}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 flex justify-between items-center">
                 <p className="text-sm text-gray-500">Due: {new Date(project.deadline).toLocaleDateString()}</p>
                 <div className="flex space-x-2">
                    <button onClick={onManageTeam} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Manage Team"><UsersIcon /></button>
                    <button onClick={onEdit} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Edit Project"><EditIcon /></button>
                 </div>
            </div>
        </div>
    );
};

const Projects: React.FC = () => {
    const { projects } = useProjects();
    const { employees } = useEmployees();
    const [isProjectModalOpen, setProjectModalOpen] = useState(false);
    const [isTeamModalOpen, setTeamModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const employeesMap = useMemo(() => new Map(employees.map(emp => [emp.id, emp])), [employees]);

    const handleAddProject = () => {
        setSelectedProject(null);
        setProjectModalOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setSelectedProject(project);
        setProjectModalOpen(true);
    };

    const handleManageTeam = (project: Project) => {
        setSelectedProject(project);
        setTeamModalOpen(true);
    };

    const closeModals = () => {
        setProjectModalOpen(false);
        setTeamModalOpen(false);
        setSelectedProject(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projects</h1>
                <button onClick={handleAddProject} className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                    Create Project
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        employeesMap={employeesMap}
                        onEdit={() => handleEditProject(project)}
                        onManageTeam={() => handleManageTeam(project)}
                    />
                ))}
            </div>
            
            <Modal isOpen={isProjectModalOpen} onClose={closeModals} title={selectedProject ? 'Edit Project' : 'Create Project'}>
                <ProjectForm project={selectedProject} onClose={closeModals} />
            </Modal>
            
            {selectedProject && (
                 <ManageTeamModal 
                    isOpen={isTeamModalOpen} 
                    onClose={closeModals} 
                    project={selectedProject} 
                />
            )}

        </div>
    );
};

export default Projects;
