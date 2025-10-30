
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeStatus } from '../types';
import { useEmployees } from '../context/EmployeeContext';

interface EmployeeFormProps {
  employee?: Employee | null;
  onClose: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose }) => {
  const { addEmployee, updateEmployee } = useEmployees();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    startDate: '',
    status: EmployeeStatus.Active,
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        startDate: employee.startDate,
        status: employee.status,
      });
    } else {
        setFormData({
            name: '', email: '', role: '', department: '', startDate: '', status: EmployeeStatus.Active,
        });
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employee) {
      updateEmployee({ ...employee, ...formData });
    } else {
      addEmployee(formData);
    }
    onClose();
  };
  
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
        <input type="text" name="role" value={formData.role} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Department</label>
        <input type="text" name="department" value={formData.department} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Date</label>
        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
        <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
          {Object.values(EmployeeStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          {employee ? 'Update' : 'Create'} Employee
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
