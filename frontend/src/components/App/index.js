import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from '../Home';
import Login from '../Login';
import Dashboard from '../Dashboard';
import Logout from '../Logout';
import StressProof from '../Stress'; // 👈 ruta pública

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    const storedAuth = JSON.parse(localStorage.getItem('is_authenticated'));
    if (storedAuth) setIsAuthenticated(storedAuth);
  }, []);

  // Componente para rutas protegidas
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/stress" element={<StressProof />} /> {/* 👈 pública */}

        {/* Rutas privadas */}
        <Route
          path="/dashboard/*"
          element={<PrivateRoute element={<Dashboard setIsAuthenticated={setIsAuthenticated} />} />}
        />

        {/* Cualquier ruta no válida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
