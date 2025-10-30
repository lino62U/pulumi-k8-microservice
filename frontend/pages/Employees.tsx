
import React, { useState, useMemo } from 'react';
import { useEmployees } from '../context/EmployeeContext';
import { Employee, EmployeeStatus } from '../types';
import Modal from '../components/ui/Modal';
import EmployeeForm from '../components/EmployeeForm';

const statusColorMap: Record<EmployeeStatus, string> = {
  [EmployeeStatus.Active]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [EmployeeStatus.OnLeave]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [EmployeeStatus.Terminated]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const Employees: React.FC = () => {
  const { employees, deleteEmployee } = useEmployees();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleAdd = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  }

  return (
    <div className="bg-white dark:bg-dark-accent p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button onClick={handleAdd} className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
          Add Employee
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3 hidden md:table-cell">Role</th>
              <th scope="col" className="px-6 py-3 hidden lg:table-cell">Department</th>
              <th scope="col" className="px-6 py-3 hidden lg:table-cell">Start Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className="bg-white border-b dark:bg-dark-accent dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  <div className="flex items-center">
                    <img className="w-10 h-10 rounded-full mr-4" src={emp.avatarUrl} alt={`${emp.name} avatar`} />
                    <div>
                        <div className="text-base font-semibold">{emp.name}</div>
                        <div className="font-normal text-gray-500">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">{emp.role}</td>
                <td className="px-6 py-4 hidden lg:table-cell">{emp.department}</td>
                <td className="px-6 py-4 hidden lg:table-cell">{new Date(emp.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColorMap[emp.status]}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <EditIcon />
                    </button>
                    <button onClick={() => deleteEmployee(emp.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEmployee ? 'Edit Employee' : 'Add Employee'}>
        <EmployeeForm employee={editingEmployee} onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default Employees;
