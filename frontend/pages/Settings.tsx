
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useEmployees } from '../context/EmployeeContext';
import { Employee } from '../types';

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="bg-white dark:bg-dark-accent p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">{description}</p>
    <div className="space-y-4">{children}</div>
  </div>
);

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { employees, resetEmployees } = useEmployees();

  const handleExportData = () => {
    const headers = ["ID", "Name", "Email", "Role", "Department", "Start Date", "Status"];
    const csvContent = [
      headers.join(','),
      ...employees.map((emp: Employee) => 
        [emp.id, emp.name, emp.email, emp.role, emp.department, emp.startDate, emp.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all employee data to the initial mock data? This action cannot be undone.')) {
        resetEmployees();
        alert('Employee data has been reset.');
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SettingsCard title="Appearance" description="Customize the look and feel of the application.">
        <div className="flex items-center justify-between">
          <label htmlFor="theme-select" className="font-medium text-gray-700 dark:text-gray-300">Theme</label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </SettingsCard>
      
      <SettingsCard title="Data Management" description="Manage application and employee data.">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="font-medium text-gray-700 dark:text-gray-300">Export employee data as a CSV file.</p>
            <button onClick={handleExportData} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Export Data
            </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="font-medium text-red-500">Reset all data to the default state.</p>
            <button onClick={handleResetData} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Reset Data
            </button>
        </div>
      </SettingsCard>
      
      <SettingsCard title="Notifications" description="Configure how you receive alerts and updates. (UI Only)">
         <div className="flex items-center justify-between">
            <label htmlFor="email-notifications" className="font-medium text-gray-700 dark:text-gray-300">Email notifications for new leave requests</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
        </div>
         <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
            <label htmlFor="weekly-summary" className="font-medium text-gray-700 dark:text-gray-300">Receive weekly performance summary via email</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
        </div>
      </SettingsCard>

    </div>
  );
};

export default Settings;