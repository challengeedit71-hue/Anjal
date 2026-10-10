import { AssistantSettings, QuickPrompt, ConnectorInfo } from '../types/chat';

export const APP_CONFIG = {
  name: 'AK Editor Amit',
  developer: 'AK Editor Amit',
  altName: 'Angel AI Assistant',
  tagline: 'Siri-Style AI Voice & Phone Assistant',
  version: '2.5.0',
  defaultModel: 'Google Gemini 3.8 Flash',
  packageName: 'com.amitai.aiassistant',
  wakeWord: 'Hey Angel',
};

export const COLOR_PRESETS = [
  {
    id: 'crimson',
    name: 'Crimson Aura',
    primary: '#ff1e38',
    glow: 'rgba(255, 30, 56, 0.45)',
    border: 'rgba(255, 30, 56, 0.3)',
    gradient: 'from-red-600 via-rose-500 to-amber-500',
    ringColor: '#ff2d55',
  },
  {
    id: 'blue',
    name: 'Cyber Cyan',
    primary: '#00d2ff',
    glow: 'rgba(0, 210, 255, 0.45)',
    border: 'rgba(0, 210, 255, 0.3)',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    ringColor: '#00e5ff',
  },
  {
    id: 'emerald',
    name: 'Matrix Neon',
    primary: '#00ff88',
    glow: 'rgba(0, 255, 136, 0.45)',
    border: 'rgba(0, 255, 136, 0.3)',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    ringColor: '#10b981',
  },
  {
    id: 'purple',
    name: 'Midnight Void',
    primary: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.45)',
    border: 'rgba(168, 85, 247, 0.3)',
    gradient: 'from-purple-600 via-fuchsia-500 to-pink-500',
    ringColor: '#c084fc',
  },
  {
    id: 'solar',
    name: 'Solar Flare',
    primary: '#ff9900',
    glow: 'rgba(255, 153, 0, 0.45)',
    border: 'rgba(255, 153, 0, 0.3)',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    ringColor: '#fbbf24',
  },
];

export const PERSONA_PROMPTS: Record<string, { name: string; description: string; prompt: string }> = {
  helpful: {
    name: 'NOVA Standard',
    description: 'Cinematic, razor-sharp, empathetic, and exceptionally capable AI voice assistant.',
    prompt:
      'You are NOVA (Angel AI Assistant), an exceptionally intelligent, futuristic, empathetic, and proactive neural assistant. Respond clearly, with elegance and warmth. When the user speaks or writes in Hindi or Hinglish, respond naturally in their language. Format code cleanly and keep answers insightful.',
  },
  jarvis: {
    name: 'JARVIS Protocol',
    description: 'Tactical, ultra-sophisticated hardware & system executive briefing intelligence.',
    prompt:
      'You are NOVA running under JARVIS Tactical Protocol. You speak with refined sophistication, precision, and executive brevity. You report system statuses, solve technical queries with mathematical rigor, and address the user with supreme respect ("At your command, Sir/Ma\'am").',
  },
  coder: {
    name: 'Senior Architect',
    description: 'Expert programmer focusing on clean architecture, TypeScript, Kotlin, and modern best practices.',
    prompt:
      'You are NOVA Senior Software Architect. Provide production-ready, clean, idiomatic code (Kotlin, Jetpack Compose, TypeScript, Python). Point out architectural nuances and security considerations. Always specify languages in code blocks.',
  },
  creative: {
    name: 'Creative Muse',
    description: 'Vivid imagery, imaginative storytelling, inventive brainstormer.',
    prompt:
      'You are NOVA Creative Muse. Write with poetic cadence, unexpected metaphors, vivid depth, and electric wit. Avoid clichés.',
  },
  concise: {
    name: 'Executive Brief',
    description: 'Direct, bulleted answers with zero filler or polite preambles.',
    prompt:
      'You are NOVA Executive Intelligence. Provide high-signal data with minimal words. Use bullet points and numbers. No conversational fluff.',
  },
  custom: {
    name: 'Custom Protocol',
    description: 'Your own tailored system instruction prompt.',
    prompt: '',
  },
};

export const DEFAULT_SETTINGS: AssistantSettings = {
  persona: 'helpful',
  language: 'hinglish',
  customSystemPrompt: '',
  temperature: 0.7,
  voiceName: 'Kore',
  speechRate: 1.0,
  ttsEngine: 'browser',
  autoSpeak: true,
  soundEffects: true,
  hapticFeedback: true,
  orb: {
    orbType: 'energy',
    color: 'crimson',
    size: 1.0,
    animationIntensity: 1.0,
    particleEffects: true,
    auraBorderMode: false,
    voiceVisualizer: true,
    hapticFeedback: true,
  },
    profile: {
    name: 'AK EDITOR AMIT',
    email: 'editbhai846@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isLoggedIn: true,
    isGuest: false,
    themeStyle: 'auraRed',
  },
  phoneAccess: {
    enabled: true,
    allowCallPhone: true,
    allowWhatsApp: true,
    allowCamera: true,
    allowAppsLaunch: true,
    allowContacts: true,
    allowNotifications: true,
    wakeWordEnabled: true,
    wakeWord: 'Hey Angel',
  },
};

export const CONNECTORS_LIST: ConnectorInfo[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: "Google's Gemini 3.8 Flash - NOVA's native primary neural engine.",
    category: 'AI & Models',
    connected: true,
    isDefault: true,
    documentationUrl: 'https://ai.google.dev',
  },
  {
    id: 'gmail',
    name: 'Gmail Workspace',
    description: 'Read, search, summarize, and draft emails with real Google Workspace OAuth.',
    category: 'Google Workspace',
    connected: true,
    requiresConfig: false,
    documentationUrl: 'https://mail.google.com',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    description: 'Search, browse files, create text docs, and manage storage with Google Workspace OAuth.',
    category: 'Google Workspace',
    connected: true,
    requiresConfig: false,
    documentationUrl: 'https://drive.google.com',
  },
  {
    id: 'groq',
    name: 'Groq LPU',
    description: 'Ultra fast AI inference with Llama 3.3 70B & Mixtral models.',
    category: 'AI & Models',
    connected: false,
    requiresConfig: true,
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o',
    description: 'GPT-4o omni reasoning, vision, and tool calling capabilities.',
    category: 'AI & Models',
    connected: false,
    requiresConfig: true,
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: "Claude 3.7 Sonnet for deep analytical research and nuanced reasoning.",
    category: 'AI & Models',
    connected: false,
    requiresConfig: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity Sonar',
    description: 'Real-time web-aware search with live cited sources and news.',
    category: 'Research & Web',
    connected: false,
    requiresConfig: true,
  },
  {
    id: 'tavily',
    name: 'Tavily Search',
    description: 'Deep web research and autonomous search crawler for AI agents.',
    category: 'Research & Web',
    connected: false,
    requiresConfig: true,
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs Prime',
    description: 'Ultra-realistic emotional voice cloning and multi-lingual voices.',
    category: 'Creative & Voice',
    connected: false,
    requiresConfig: true,
  },
];

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'deep-research',
    title: 'Deep Research',
    prompt: 'Conduct a comprehensive, structured analysis of the future of autonomous humanoid robotics in 2026-2030, covering hardware, energy, AI compute, and economic impact.',
    category: 'productivity',
  },
  {
    id: 'hindi-intro',
    title: 'Hindi & Hinglish Mode',
    prompt: 'Namaste NOVA! Mujhe aaj ke top technology trends ke baare mein Hindi aur Hinglish mein samjhao.',
    category: 'hindi',
  },
  {
    id: 'code-review',
    title: 'Code Architecture',
    prompt: 'Review best practices for building native Android Jetpack Compose voice assistants with coroutines, Room database, and state management.',
    category: 'code',
  },
  {
    id: 'brainstorm',
    title: 'Startup Ideation',
    prompt: 'Give me 3 breakthrough startup ideas that combine real-time multimodal AI vision with wearable hardware.',
    category: 'writing',
  },
];

export const AVAILABLE_VOICES = [
  { id: 'Kore', label: 'Kore (Balanced & Warm)', gender: 'Female' },
  { id: 'Puck', label: 'Puck (Energetic & Expressive)', gender: 'Male' },
  { id: 'Zephyr', label: 'Zephyr (Smooth & Calm)', gender: 'Neutral' },
  { id: 'Fenrir', label: 'Fenrir (Deep & Authoritative)', gender: 'Male' },
  { id: 'Charon', label: 'Charon (Thoughtful & Measured)', gender: 'Male' },
] as const;
