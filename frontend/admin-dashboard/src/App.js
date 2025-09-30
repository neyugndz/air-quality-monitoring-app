import AdminDashboard from './component/dashboard'; 
import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLogin from './component/admin-portal';

function App() {
 return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin-portal" replace />} />
        <Route path="/admin-portal" element={<AdminLogin/>} />
        <Route path="/dashboard" element={<AdminDashboard/>} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;
