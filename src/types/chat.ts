export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
  errorMessage?: string;
  audioUrl?: string;
  imageAttachment?: string; // Optional image attachment for multimodal chat
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type PersonaType = 'helpful' | 'coder' | 'creative' | 'tutor' | 'concise' | 'jarvis' | 'custom';
export type LanguageMode = 'english' | 'hindi' | 'hinglish';
export type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'offline';
export type OrbType = 'classic' | 'energy' | 'neon' | 'quantum' | 'solar';
export type OrbColor = 'crimson' | 'blue' | 'emerald' | 'purple' | 'solar';

export interface OrbSettings {
  orbType: OrbType;
  color: OrbColor;
  size: number; // 0.6 to 1.4
  animationIntensity: number; // 0.5 to 1.5
  particleEffects: boolean;
  auraBorderMode: boolean;
  voiceVisualizer: boolean;
  hapticFeedback: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  isGuest: boolean;
  themeStyle: 'default' | 'auraRed' | 'midnight';
}

export interface PhoneAccessSettings {
  enabled: boolean;
  allowCallPhone: boolean;
  allowWhatsApp: boolean;
  allowCamera: boolean;
  allowAppsLaunch: boolean;
  allowContacts: boolean;
  allowNotifications: boolean;
  wakeWordEnabled: boolean;
  wakeWord: string; // e.g. 'Hey Angel'
}

export interface AssistantSettings {
  persona: PersonaType;
  language: LanguageMode;
  customSystemPrompt: string;
  temperature: number;
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  speechRate: number; // 0.8 to 1.4
  ttsEngine: 'gemini' | 'browser';
  autoSpeak: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  orb: OrbSettings;
  profile: UserProfile;
  phoneAccess: PhoneAccessSettings;
}

export interface QuickPrompt {
  id: string;
  title: string;
  prompt: string;
  category: 'code' | 'writing' | 'learning' | 'productivity' | 'hindi';
}

export interface ConnectorInfo {
  id: string;
  name: string;
  description: string;
  category: 'AI & Models' | 'Research & Web' | 'Creative & Voice' | 'Google Workspace';
  connected: boolean;
  isDefault?: boolean;
  apiKey?: string;
  requiresConfig?: boolean;
  documentationUrl?: string;
}

export type ActiveScreen =
  | 'home'
  | 'chat'
  | 'voice'
  | 'visual-lens'
  | 'orb-custom'
  | 'phone-actions'
  | 'connectors'
  | 'discover'
  | 'settings'
  | 'auth'
  | 'android-project'
  | 'workspace';
