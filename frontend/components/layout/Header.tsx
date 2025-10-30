import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// Fix: Corrected import from 'react-router-dom' to resolve module export errors.
import { useLocation, Link } from 'react-router-dom';

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  }

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-dark-accent border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{getPageTitle()}</h1>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <img src={user?.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full" />
          <div className="hidden md:block text-left">
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
          </div>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-accent rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
            <Link
              to="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;