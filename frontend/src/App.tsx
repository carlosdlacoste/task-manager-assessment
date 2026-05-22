import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

// Componente Guardián para proteger la ruta del Dashboard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  
  // Si no hay token, lo mandamos directo a loguearse
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto redirige a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Ruta de Autenticación (Login / Registro) */}
        <Route path="/login" element={<AuthPage />} />
        
        {/* Ruta del Panel de Tareas Protegida */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Cualquier otra ruta loca va al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
