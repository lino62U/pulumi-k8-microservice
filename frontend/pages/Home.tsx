
import React from 'react';
// Fix: Corrected import from 'react-router-dom' to resolve module export errors.
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ad-Vantage HRMS</h1>
        <Link to="/login" className="bg-white text-blue-900 font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition duration-300">
          Admin Login
        </Link>
      </header>
      <main className="flex flex-col items-center justify-center text-center px-4" style={{ height: 'calc(100vh - 70px)'}}>
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          Empowering Your Agency's  ...<br />Greatest Asset: Your People
        </h2>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-8">
          Ad-Vantage is the all-in-one HR platform designed for the fast-paced world of advertising. 
          Manage talent, track performance, and foster a culture of creativity and success.
        </p>
        <div className="flex space-x-4">
          <Link to="/login" className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-dark transition duration-300 text-lg">
            Get Started
          </Link>
          <Link to="/stress" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-blue-900 transition duration-300 text-lg">
            Stress Test
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;