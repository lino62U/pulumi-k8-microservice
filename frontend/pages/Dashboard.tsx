
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEmployees } from '../context/EmployeeContext';
import { generateEmployeePerformanceSummary } from '../services/geminiService';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-dark-accent p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 16l-4 4 4-4 5.293 5.293a1 1 0 010 1.414L15 21" /></svg>

const Dashboard: React.FC = () => {
  const { employees } = useEmployees();
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const departmentData = useMemo(() => {
    const counts = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    const result = await generateEmployeePerformanceSummary(employees);
    setSummary(result);
    setIsLoadingSummary(false);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Employees" value={employees.length} icon={<UsersIcon />} />
        <StatCard title="Departments" value={departmentData.length} icon={<BriefcaseIcon />} />
        <StatCard title="Active Staff" value={employees.filter(e => e.status === 'Active').length} icon={<SparklesIcon />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-accent p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Employees by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'black', color: 'white', borderRadius: '5px' }} />
              <Bar dataKey="value" fill="#1E40AF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-dark-accent p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
             <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={departmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                        {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
       <div className="bg-white dark:bg-dark-accent p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">AI Performance Summary</h3>
            <button onClick={handleGenerateSummary} disabled={isLoadingSummary} className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400">
              {isLoadingSummary ? 'Generating...' : 'Generate Summary'}
            </button>
          </div>
          {summary ? (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{summary}</p>
          ) : (
            <p className="text-gray-500 italic">Click the button to generate an AI-powered summary of your team's current status.</p>
          )}
        </div>
    </div>
  );
};

export default Dashboard;
