
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { useProjects } from '../context/ProjectContext';

interface ProjectFormProps {
  project?: Project | null;
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose }) => {
  const { addProject, updateProject } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    deadline: '',
    status: 'Not Started' as ProjectStatus,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        client: project.client,
        deadline: project.deadline,
        status: project.status,
      });
    } else {
        setFormData({ name: '', client: '', deadline: '', status: 'Not Started' });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (project) {
      updateProject({ id: project.id, ...formData });
    } else {
      addProject(formData);
    }
    onClose();
  };
  
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Project Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Client</label>
        <input type="text" name="client" value={formData.client} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Deadline</label>
        <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
        <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          {project ? 'Update' : 'Create'} Project
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
