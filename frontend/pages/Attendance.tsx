
import React, { useState, useMemo } from 'react';
import { MOCK_ATTENDANCE } from '../constants';
import { AttendanceRecord } from '../types';

const statusColorMap: Record<AttendanceRecord['status'], string> = {
  Present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const Attendance: React.FC = () => {
  const [attendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => record.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  return (
    <div className="bg-white dark:bg-dark-accent p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Daily Attendance</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Employee Name</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Check-in</th>
              <th scope="col" className="px-6 py-3">Check-out</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(record => (
              <tr key={record.id} className="bg-white border-b dark:bg-dark-accent dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {record.employeeName}
                </td>
                <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">{record.checkIn}</td>
                <td className="px-6 py-4">{record.checkOut}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColorMap[record.status]}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No attendance records found for this date.
            </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
