import React from 'react';
import { Lightbulb } from 'lucide-react';

const SafetyTips: React.FC = () => {
  const tips = [
    {
      title: "Share Your Location",
      description: "Share your live location with trusted contacts when traveling alone, especially at night."
    },
    {
      title: "Stay Alert",
      description: "Avoid displaying expensive items in public places and stay aware of your surroundings."
    },
    {
      title: "Trust Your Instincts",
      description: "If something feels wrong, it probably is. Don't hesitate to seek help or change your route."
    },
    {
      title: "Emergency Contacts",
      description: "Keep your emergency contacts updated and ensure they know how to respond to alerts."
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Safety Tips</h2>
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3 mt-1 flex-shrink-0">
              <Lightbulb className="w-3 h-3" />
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">{tip.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafetyTips;