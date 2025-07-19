import React, { useState, useEffect } from 'react';
import { Save, Bell, Mic, Shield, Moon, Sun } from 'lucide-react';
import { UserSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    user_id: user?.id || '',
    voice_activation_phrase: 'help me',
    emergency_message: 'I need help! My current location is: [LOCATION]. Please check on me immediately.',
    auto_alert_zones: true,
    voice_monitoring_enabled: true,
    predictive_alerts_enabled: true,
    dark_mode: false,
  });
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setSaveMessage('');

    try {
      await api.put('/api/settings', settings);
      setSaveMessage('Settings saved successfully!');
      
      // Apply dark mode immediately
      if (settings.dark_mode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={user?.full_name || ''}
              disabled
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 opacity-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 opacity-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={user?.phone_number || ''}
              disabled
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 opacity-50 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <Mic className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold">Voice SOS Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Voice Activation Phrase</label>
            <input
              type="text"
              value={settings.voice_activation_phrase}
              onChange={(e) => handleInputChange('voice_activation_phrase', e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., help me, emergency"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Speak this phrase to trigger an emergency alert
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Voice Monitoring</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable background voice listening for emergency phrases
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.voice_monitoring_enabled}
                onChange={(e) => handleInputChange('voice_monitoring_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <Bell className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold">Alert Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Emergency Message Template</label>
            <textarea
              rows={3}
              value={settings.emergency_message}
              onChange={(e) => handleInputChange('emergency_message', e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Customize your emergency message..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use [LOCATION] placeholder for automatic location insertion
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Zone Alerts</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatically alert when entering unsafe zones
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.auto_alert_zones}
                onChange={(e) => handleInputChange('auto_alert_zones', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Predictive Alerts</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-powered safety recommendations and warnings
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.predictive_alerts_enabled}
                onChange={(e) => handleInputChange('predictive_alerts_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Appearance</h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {settings.dark_mode ? (
              <Moon className="w-6 h-6 text-blue-600 mr-3" />
            ) : (
              <Sun className="w-6 h-6 text-blue-600 mr-3" />
            )}
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark themes
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.dark_mode}
              onChange={(e) => handleInputChange('dark_mode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        ) : (
          <Save className="w-5 h-5 mr-2" />
        )}
        {loading ? 'Saving...' : 'Save Settings'}
      </button>

      {/* Save Message */}
      {saveMessage && (
        <div className={`text-center text-sm p-3 rounded-lg ${
          saveMessage.includes('successfully') 
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
        }`}>
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;