import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Mic, Phone, MessageSquare } from 'lucide-react';
import { LocationData, SafetyStatus } from '../types';
import EmergencyButtons from './EmergencyButtons';
import SafetyStatusCard from './SafetyStatusCard';
import AIAssistant from './AIAssistant';
import SafetyTips from './SafetyTips';

interface HomePageProps {
  location: LocationData | null;
  safetyStatus: SafetyStatus | null;
  onRefreshLocation: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  location, 
  safetyStatus, 
  onRefreshLocation 
}) => {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Safety Status Card */}
      <SafetyStatusCard 
        location={location}
        safetyStatus={safetyStatus}
        lastUpdated={lastUpdated}
        onRefresh={onRefreshLocation}
      />

      {/* Emergency Buttons */}
      <EmergencyButtons location={location} />

      {/* AI Assistant */}
      <AIAssistant />

      {/* Safety Tips */}
      <SafetyTips />
    </div>
  );
};

export default HomePage;