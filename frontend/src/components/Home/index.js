import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>Bienvenido a la Aplicación</h1>
      <p>Selecciona una opción:</p>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/login" style={{ margin: '1rem' }}>Iniciar Sesión</Link>
        <Link to="/dashboard" style={{ margin: '1rem' }}>Ir al Dashboard</Link>
        <Link to="/stress" style={{ margin: '1rem', color: 'red' }}>Prueba de Estrés 🚀</Link>
      </div>
    </div>
  );
}
