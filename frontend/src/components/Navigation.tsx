import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Users, History } from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/map', icon: Map, label: 'Map' },
    { to: '/contacts', icon: Users, label: 'Contacts' },
    { to: '/history', icon: History, label: 'History' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 mt-6">
      <div className="flex justify-around">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;