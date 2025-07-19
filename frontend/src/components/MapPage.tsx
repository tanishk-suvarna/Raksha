import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Shield, AlertTriangle, AlertCircle } from 'lucide-react';
import { LocationData, SafetyStatus } from '../types';

interface MapPageProps {
  location: LocationData | null;
  safetyStatus: SafetyStatus | null;
}

const MapPage: React.FC<MapPageProps> = ({ location, safetyStatus }) => {
  const [mapError, setMapError] = useState<string>('');

  // Mock safety zones for demonstration
  const safetyZones = [
    { id: 1, type: 'safe', name: 'Residential Area', lat: 12.9716, lng: 77.5946 },
    { id: 2, type: 'caution', name: 'Market Street', lat: 12.9726, lng: 77.5956 },
    { id: 3, type: 'danger', name: 'Construction Zone', lat: 12.9706, lng: 77.5936 },
  ];

  const getZoneColor = (type: string) => {
    switch (type) {
      case 'safe': return 'bg-green-500';
      case 'caution': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'safe': return Shield;
      case 'caution': return AlertTriangle;
      case 'danger': return AlertCircle;
      default: return MapPin;
    }
  };

  const openInMaps = () => {
    if (!location) return;
    
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Safety Map</h2>
        
        {/* Mock Map Display */}
        <div className="relative h-64 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg mb-4 overflow-hidden">
          {/* Grid pattern to simulate map */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Current Location Marker */}
          {location && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg animate-pulse">
                <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
              </div>
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                You are here
              </div>
            </div>
          )}
          
          {/* Safety Zone Markers */}
          {safetyZones.map((zone, index) => {
            const Icon = getZoneIcon(zone.type);
            return (
              <div
                key={zone.id}
                className={`absolute w-4 h-4 rounded-full border-2 border-white ${getZoneColor(zone.type)}`}
                style={{
                  top: `${20 + index * 30}%`,
                  left: `${30 + index * 20}%`
                }}
                title={zone.name}
              >
                <Icon className="w-2 h-2 text-white m-0.5" />
              </div>
            );
          })}
          
          {/* Map placeholder message */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white dark:bg-gray-800 bg-opacity-90 p-4 rounded-lg">
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Interactive Safety Map</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Google Maps integration required
              </p>
            </div>
          </div>
        </div>

        {/* Zone Legend */}
        <div className="flex justify-between mb-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Safe Zone</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Caution Zone</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Danger Zone</span>
          </div>
        </div>

        {/* Current Location Info */}
        {location && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium">Current Location</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Accuracy: ±{location.accuracy?.toFixed(0) || '0'}m
            </p>
          </div>
        )}

        {/* Map Actions */}
        <div className="space-y-2">
          <button
            onClick={openInMaps}
            disabled={!location}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Navigation className="w-5 h-5 inline mr-2" />
            Open in Google Maps
          </button>
          
          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
            <MapPin className="w-5 h-5 inline mr-2" />
            Get Safest Route
          </button>
        </div>
      </div>

      {/* Predictive Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Predictive Alerts</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white mr-3 flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Route Analysis</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your current route passes through 1 caution zone. Consider alternative path for safer travel.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3 flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Time-Based Alert</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                It's getting late. Would you like to share your location with emergency contacts?
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">15 minutes ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Google Maps Integration Required
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Add your Google Maps API key to enable real-time interactive maps with live location tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;