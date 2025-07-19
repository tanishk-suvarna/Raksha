import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Bell, Shield, Bot, TrendingUp } from 'lucide-react';
import { SafetyHistory } from '../types';
import api from '../config/api';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<SafetyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    safeDays: 0,
    totalAlerts: 0,
    safetyScore: 0,
  });

  useEffect(() => {
    fetchHistory();
    calculateStats();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    // Mock stats calculation
    setStats({
      safeDays: 12,
      totalAlerts: 2,
      safetyScore: 85,
    });
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'alert':
        return Bell;
      case 'location_check':
        return MapPin;
      case 'ai_check':
        return Bot;
      case 'zone_entry':
        return Shield;
      default:
        return Clock;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'alert':
        return 'bg-red-500';
      case 'location_check':
        return 'bg-blue-500';
      case 'ai_check':
        return 'bg-purple-500';
      case 'zone_entry':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${diffDays} days ago, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Safety Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Safety Statistics</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.safeDays}</p>
            <p className="text-sm text-green-600 dark:text-green-400">Safe Days</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalAlerts}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Total Alerts</p>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Your Safety Score</span>
            <span className="text-green-600 dark:text-green-400 font-bold">{stats.safetyScore}/100</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.safetyScore}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Based on your safety practices and alert history
          </p>
        </div>
      </div>

      {/* Safety History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activity recorded yet.</p>
            <p className="text-sm">Your safety events will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((event) => {
              const Icon = getEventIcon(event.event_type);
              const colorClass = getEventColor(event.event_type);
              
              return (
                <div key={event.id} className="flex items-start">
                  <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-white mr-3 flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{event.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(event.created_at)}
                      {event.location && (
                        <span> • {event.location.address || 'Location recorded'}</span>
                      )}
                    </p>
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-1">
                        {event.metadata.contacts_notified && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full mr-2">
                            {event.metadata.contacts_notified} contacts notified
                          </span>
                        )}
                        {event.metadata.risk_level && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                            Risk: {event.metadata.risk_level}/10
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold">Weekly Trends</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Safety alerts</span>
            <span className="text-green-600 dark:text-green-400 text-sm">↓ 50% vs last week</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Safe zone time</span>
            <span className="text-green-600 dark:text-green-400 text-sm">↑ 15% vs last week</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Emergency contacts usage</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">No change</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;