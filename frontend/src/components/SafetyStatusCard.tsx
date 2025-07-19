import React from 'react';
import { MapPin, RefreshCw, Shield, AlertTriangle, AlertCircle } from 'lucide-react';
import { LocationData, SafetyStatus } from '../types';

interface SafetyStatusCardProps {
  location: LocationData | null;
  safetyStatus: SafetyStatus | null;
  lastUpdated: string;
  onRefresh: () => void;
}

const SafetyStatusCard: React.FC<SafetyStatusCardProps> = ({
  location,
  safetyStatus,
  lastUpdated,
  onRefresh,
}) => {
  const getStatusInfo = () => {
    if (!safetyStatus) {
      return {
        text: 'Checking...',
        color: 'bg-gray-500',
        icon: Shield,
      };
    }

    switch (safetyStatus.safety_status) {
      case 'safe':
        return {
          text: 'Safe',
          color: 'bg-green-500',
          icon: Shield,
        };
      case 'caution':
        return {
          text: 'Caution',
          color: 'bg-yellow-500',
          icon: AlertTriangle,
        };
      case 'danger':
        return {
          text: 'Danger',
          color: 'bg-red-500',
          icon: AlertCircle,
        };
      default:
        return {
          text: 'Unknown',
          color: 'bg-gray-500',
          icon: Shield,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Safety Status</h2>
        <div className="flex items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Location Info */}
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm">
              {location ? (
                location.address || 
                `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`
              ) : (
                'Location not available'
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {lastUpdated}
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh location"
          >
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Safety Information */}
        {safetyStatus && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <StatusIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium">Safety Assessment</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {safetyStatus.recommendations?.[0] || 'Stay aware of your surroundings.'}
            </p>
            {safetyStatus.risk_level && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Risk Level</span>
                  <span>{safetyStatus.risk_level}/10</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      safetyStatus.risk_level <= 3
                        ? 'bg-green-500'
                        : safetyStatus.risk_level <= 6
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(safetyStatus.risk_level / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyStatusCard;