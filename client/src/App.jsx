import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CitizenDashboard from './pages/CitizenDashboard';
import RescueDashboard from './pages/RescueDashboard';
import { ThemeProvider, useTheme } from './ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Theme toggle button component
const ThemeToggle = () => {
  const { toggleTheme } = useTheme();
  return <button className="toggle-button" onClick={toggleTheme}>🥳 Light / 🌙 Dark</button>;
};

const App = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <ThemeProvider>
      <Router>
        <ThemeToggle />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/citizen-dashboard"
            element={token && role === 'citizen' ? <CitizenDashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/rescue-dashboard"
            element={token && role === 'rescue' ? <RescueDashboard /> : <Navigate to="/" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
