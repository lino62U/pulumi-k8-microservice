
import React from 'react';
// Fix: Corrected import from 'react-router-dom' to resolve module export errors.
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProjectProvider } from './context/ProjectContext'; // Import ProjectProvider
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Projects from './pages/Projects'; // Import Projects page
import Home from './pages/Home';
import Stress from './pages/Stress';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <EmployeeProvider>
            <ProjectProvider> {/* Add ProjectProvider */}
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="/stress" element={<Stress />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/projects" element={<Projects />} /> {/* Add Projects route */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
            </ProjectProvider>
          </EmployeeProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-light dark:bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light dark:bg-dark p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default App;