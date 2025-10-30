
import React from 'react';
// Fix: Corrected import from 'react-router-dom' to resolve module export errors.
import { NavLink } from 'react-router-dom';

const iconPaths = {
  dashboard: "M3 13.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0-6a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0-6a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m4.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0 6a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0 6a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m4.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0-6a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0-6a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0",
  employees: "M16 11a5 5 0 1 1-10 0 5 5 0 0 1 10 0m5 .5a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5zM4.5 18a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5zM16 4.5a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5zM4.5 8a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5z",
  attendance: "M11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z M8.5 7a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z m3 .5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z m3 .5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z m-9-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-6-3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z m-2.5 6.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z m3 .5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z M2 2.5A2.5 2.5 0 0 1 4.5 0h11A2.5 2.5 0 0 1 18 2.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 13.5z M3 3v10a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V3a1.5 1.5 0 0 0-1.5-1.5h-11A1.5 1.5 0 0 0 3 3",
  profile: "M15.756 4.103a8 8 0 1 0-11.512 0A5.5 5.5 0 0 1 12 11a5.5 5.5 0 0 1 7.756-6.897m-1.41-1.41a6.5 6.5 0 1 0-9.192 0 7 7 0 0 1 12.032-8.082L12 6.5",
  projects: "M2.5 2A1.5 1.5 0 0 0 1 3.5V5h14V3.5A1.5 1.5 0 0 0 13.5 2zM15 6H1v7.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5z",
  settings: "M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
};

const NavIcon = ({ iconName }: { iconName: keyof typeof iconPaths }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
        <path d={iconPaths[iconName] as string} />
    </svg>
);


const Sidebar: React.FC = () => {
    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/employees', label: 'Employees', icon: 'employees' },
        { to: '/attendance', label: 'Attendance', icon: 'attendance' },
        { to: '/projects', label: 'Projects', icon: 'projects' },
        { to: '/profile', label: 'Profile', icon: 'profile' },
        { to: '/settings', label: 'Settings', icon: 'settings' },
    ];

    const baseLinkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-primary-dark hover:text-white rounded-lg transition-colors duration-200";
    const activeLinkClasses = "bg-primary text-white font-semibold shadow-lg";

    return (
        <aside className="w-64 bg-dark-accent text-gray-200 flex-shrink-0 flex flex-col">
            <div className="h-16 flex items-center justify-center px-4 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-white tracking-wider">Ad-Vantage</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                        <NavIcon iconName={item.icon as keyof typeof iconPaths} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
