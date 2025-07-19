export interface User {
  id: string;
  email: string;
  phone_number: string;
  full_name: string;
  created_at: string;
  is_active: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string;
  is_primary: boolean;
  user_id: string;
  created_at: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  type: string;
  message: string;
  location: LocationData;
  audio_data?: string;
  video_data?: string;
  user_id: string;
  created_at: string;
  contacts_notified: string[];
  status: string;
}

export interface SafetyHistory {
  id: string;
  user_id: string;
  event_type: string;
  description: string;
  location?: LocationData;
  metadata?: any;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  voice_activation_phrase: string;
  emergency_message: string;
  auto_alert_zones: boolean;
  voice_monitoring_enabled: boolean;
  predictive_alerts_enabled: boolean;
  dark_mode: boolean;
}

export interface SafetyStatus {
  safety_status: 'safe' | 'caution' | 'danger';
  risk_level: number;
  current_zone?: any;
  recommendations: string[];
}