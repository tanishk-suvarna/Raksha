import React from 'react';
import { Shield, Moon, Sun, LogOut, Settings } from 'lucide-react';
import { User } from '../types';
import { Link } from 'react-router-dom';

interface HeaderProps {
  user: User;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, darkMode, toggleDarkMode, onLogout }) => {
  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            Raksha<span className="text-blue-600">+</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome, {user.full_name.split(' ')[0]}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        {/* Settings */}
        <Link
          to="/settings"
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>
        
        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-2 rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;