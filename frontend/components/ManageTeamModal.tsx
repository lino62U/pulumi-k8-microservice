
import React, { useState, useMemo } from 'react';
import { Project, Employee, EmployeeStatus } from '../types';
import { useEmployees } from '../context/EmployeeContext';
import { useProjects } from '../context/ProjectContext';
import Modal from './ui/Modal';

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

const EmployeeListItem: React.FC<{ employee: Employee, onToggle: () => void, isAssigned: boolean }> = ({ employee, onToggle, isAssigned }) => (
    <li className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
        <div className="flex items-center">
            <img src={employee.avatarUrl} alt={employee.name} className="w-8 h-8 rounded-full mr-3" />
            <div>
                <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{employee.name}</p>
                <p className="text-xs text-gray-500">{employee.role}</p>
            </div>
        </div>
        <button onClick={onToggle} className={`p-1.5 rounded-full ${isAssigned ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
            {isAssigned ? <MinusIcon /> : <PlusIcon />}
        </button>
    </li>
);

const ManageTeamModal: React.FC<ManageTeamModalProps> = ({ isOpen, onClose, project }) => {
  const { employees } = useEmployees();
  const { updateProjectTeam } = useProjects();
  const [assignedIds, setAssignedIds] = useState(new Set(project.assignedTeamIds));

  const activeEmployees = useMemo(() => employees.filter(e => e.status === EmployeeStatus.Active), [employees]);
  
  const { assigned, available } = useMemo(() => {
    const assigned = activeEmployees.filter(emp => assignedIds.has(emp.id));
    const available = activeEmployees.filter(emp => !assignedIds.has(emp.id));
    return { assigned, available };
  }, [activeEmployees, assignedIds]);

  const toggleAssignment = (employeeId: string) => {
    setAssignedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    updateProjectTeam(project.id, Array.from(assignedIds));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Team: ${project.name}`}>
        <div className="grid grid-cols-2 gap-4 h-96">
            <div className="border rounded-lg p-3 dark:border-gray-600">
                <h4 className="font-semibold mb-2 text-center">Available Employees ({available.length})</h4>
                <ul className="space-y-2 overflow-y-auto h-full max-h-80 pr-1">
                    {available.map(emp => (
                        <EmployeeListItem key={emp.id} employee={emp} onToggle={() => toggleAssignment(emp.id)} isAssigned={false} />
                    ))}
                </ul>
            </div>
            <div className="border rounded-lg p-3 dark:border-gray-600">
                <h4 className="font-semibold mb-2 text-center">Assigned Team ({assigned.length})</h4>
                <ul className="space-y-2 overflow-y-auto h-full max-h-80 pr-1">
                    {assigned.map(emp => (
                        <EmployeeListItem key={emp.id} employee={emp} onToggle={() => toggleAssignment(emp.id)} isAssigned={true} />
                    ))}
                </ul>
            </div>
        </div>
        <div className="flex justify-end space-x-3 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                Save Team
            </button>
        </div>
    </Modal>
  );
};

export default ManageTeamModal;
