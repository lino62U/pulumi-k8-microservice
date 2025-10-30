import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { runStressTest } from '../services/stressService';

// Simple Toast component for notifications
const Toast = ({ message, type, onDismiss }: { message: string, type: 'success' | 'error', onDismiss: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000); // Auto-dismiss after 3 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const baseClasses = 'fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white flex justify-between items-center z-50';
  const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <p>{message}</p>
      <button onClick={onDismiss} className="ml-4 font-bold text-xl leading-none">&times;</button>
    </div>
  );
};

const StressProof = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const simulateStress = async () => {
    setLoading(true);
    setNotification(null);

    try {
      await runStressTest();
      setNotification({
        type: 'success',
        message: '🚀 Stress test completed successfully!',
      });
    } catch (error) {
      console.error("Error during stress simulation:", error);
      setNotification({
        type: 'error',
        message: '❌ An error occurred during the simulation.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      {notification && <Toast message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
      <header className="p-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold">Ad-Vantage HRMS</Link>
        <Link to="/login" className="bg-white text-blue-900 font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition duration-300">
          Admin Login
        </Link>
      </header>
      <main className="flex flex-col items-center justify-center text-center px-4" style={{ height: 'calc(100vh - 70px)'}}>
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          🧠 Stress Simulator
        </h2>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-8">
          This tool sends 50 simultaneous requests to the stress microservice to test system load and concurrency.
        </p>
        <button
          className="bg-red-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-red-700 transition duration-300 text-lg disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center"
          onClick={simulateStress}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Executing...
            </>
          ) : (
            'Initiate Stress Test 🚀'
          )}
        </button>
      </main>
    </div>
  );
};

export default StressProof;
