import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import HomePage from '../components/HomePage';
import MapPage from '../components/MapPage';
import ContactsPage from '../components/ContactsPage';
import HistoryPage from '../components/HistoryPage';
import SettingsPage from '../components/SettingsPage';
import api from '../config/api';
import { SafetyStatus } from '../types';

const MainApp: React.FC = () => {
  const { user, logout } = useAuth();
  const { location, getCurrentLocation } = useLocation();
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    // Check safety status when location changes
    if (location) {
      checkSafetyStatus();
    }
  }, [location]);

  const checkSafetyStatus = async () => {
    if (!location) return;

    try {
      const response = await api.post('/api/location/check-safety', location);
      setSafetyStatus(response.data);
    } catch (error) {
      console.error('Error checking safety status:', error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-md min-h-screen flex flex-col">
        <Header 
          user={user!} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          onLogout={logout}
        />
        
        <main className="flex-1">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  location={location}
                  safetyStatus={safetyStatus}
                  onRefreshLocation={getCurrentLocation}
                />
              } 
            />
            <Route 
              path="/map" 
              element={
                <MapPage 
                  location={location}
                  safetyStatus={safetyStatus}
                />
              } 
            />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        
        <Navigation />
      </div>
    </div>
  );
};

export default MainApp;