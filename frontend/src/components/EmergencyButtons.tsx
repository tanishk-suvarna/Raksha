import React, { useState, useRef, useEffect } from 'react';
import { Mic, Bell, Phone, MicOff } from 'lucide-react';
import { LocationData } from '../types';
import api from '../config/api';

interface EmergencyButtonsProps {
  location: LocationData | null;
}

const EmergencyButtons: React.FC<EmergencyButtonsProps> = ({ location }) => {
  const [voiceListening, setVoiceListening] = useState(false);
  const [panicPressed, setPanicPressed] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const panicTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log('Voice detected:', transcript);
        
        if (transcript.includes('help me') || transcript.includes('emergency')) {
          triggerVoiceAlert(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setVoiceListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    if (voiceListening) {
      recognitionRef.current.stop();
      setVoiceListening(false);
    } else {
      recognitionRef.current.start();
      setVoiceListening(true);
    }
  };

  const triggerVoiceAlert = async (transcript: string) => {
    if (!location) {
      alert('Location not available for emergency alert');
      return;
    }

    try {
      const alertData = {
        type: 'voice_sos',
        message: `Voice SOS activated. Detected phrase: "${transcript}"`,
        location: location,
      };

      await api.post('/api/alerts', alertData);
      
      // Show confirmation
      alert('🚨 Voice SOS Alert sent to your emergency contacts!');
      
      // Stop listening after alert
      setVoiceListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.error('Error sending voice alert:', error);
      alert('Failed to send voice alert. Please try manual panic button.');
    }
  };

  const handlePanicButtonPress = () => {
    setPanicPressed(true);
    panicTimerRef.current = setTimeout(() => {
      triggerPanicAlert();
    }, 3000);
  };

  const handlePanicButtonRelease = () => {
    setPanicPressed(false);
    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
    }
  };

  const triggerPanicAlert = async () => {
    if (!location) {
      alert('Location not available for emergency alert');
      return;
    }

    try {
      const alertData = {
        type: 'panic_button',
        message: 'EMERGENCY: Panic button activated. Please check on me immediately!',
        location: location,
      };

      await api.post('/api/alerts', alertData);
      
      // Show confirmation
      alert('🚨 Emergency Alert sent to your emergency contacts!');
      setPanicPressed(false);
    } catch (error) {
      console.error('Error sending panic alert:', error);
      alert('Failed to send emergency alert. Please call emergency services directly.');
    }
  };

  const triggerFakeCall = () => {
    setFakeCallActive(true);
    
    // Create fake call interface
    const fakeCallDiv = document.createElement('div');
    fakeCallDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1e3a8a, #3730a3);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: #374151;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
          ">👤</div>
          <h2 style="font-size: 28px; margin: 0 0 8px 0;">Dad</h2>
          <p style="font-size: 16px; opacity: 0.8; margin: 0;">Incoming call...</p>
        </div>
        
        <div style="display: flex; gap: 40px; margin-top: 40px;">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: #dc2626;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
          ">📞</button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: #16a34a;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
          ">📞</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(fakeCallDiv);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (document.body.contains(fakeCallDiv)) {
        document.body.removeChild(fakeCallDiv);
      }
      setFakeCallActive(false);
    }, 10000);
  };

  return (
    <div className="space-y-4">
      {/* Main Emergency Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Voice SOS Button */}
        <button
          onClick={toggleVoiceListening}
          className={`relative py-6 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
            voiceListening
              ? 'bg-green-500 hover:bg-green-600 animate-pulse'
              : 'bg-yellow-500 hover:bg-yellow-600'
          } text-white shadow-lg`}
        >
          {voiceListening ? (
            <Mic className="w-8 h-8 mb-2" />
          ) : (
            <MicOff className="w-8 h-8 mb-2" />
          )}
          <span className="font-medium">Voice SOS</span>
          <small className="text-xs opacity-80">
            {voiceListening ? 'Listening...' : 'Say "Help me"'}
          </small>
          {voiceListening && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          )}
        </button>

        {/* Panic Button */}
        <button
          onMouseDown={handlePanicButtonPress}
          onMouseUp={handlePanicButtonRelease}
          onTouchStart={handlePanicButtonPress}
          onTouchEnd={handlePanicButtonRelease}
          className={`relative py-6 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
            panicPressed
              ? 'bg-red-700 animate-pulse scale-105'
              : 'bg-red-500 hover:bg-red-600'
          } text-white shadow-lg`}
          style={{
            boxShadow: panicPressed ? '0 0 20px rgba(239, 68, 68, 0.7)' : undefined,
          }}
        >
          <Bell className="w-8 h-8 mb-2" />
          <span className="font-medium">Panic Button</span>
          <small className="text-xs opacity-80">Hold for 3s</small>
          {panicPressed && (
            <div className="absolute inset-0 rounded-xl border-4 border-red-300 animate-ping" />
          )}
        </button>
      </div>

      {/* Fake Call Button */}
      <button
        onClick={triggerFakeCall}
        disabled={fakeCallActive}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-4 rounded-xl flex items-center justify-center transition-colors"
      >
        <Phone className="w-6 h-6 mr-2" />
        <span className="font-medium">
          {fakeCallActive ? 'Call Active...' : 'Fake Call'}
        </span>
      </button>

      {/* Emergency Numbers Quick Access */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <h3 className="font-medium text-sm mb-3 text-gray-700 dark:text-gray-300">
          Emergency Numbers (India)
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <a href="tel:100" className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-center hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
            Police: 100
          </a>
          <a href="tel:102" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
            Ambulance: 102
          </a>
          <a href="tel:1091" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg text-center hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors">
            Women: 1091
          </a>
          <a href="tel:1098" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg text-center hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
            Child: 1098
          </a>
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default EmergencyButtons;