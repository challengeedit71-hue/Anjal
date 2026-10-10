import { PhoneAccessSettings, ActiveScreen } from '../types/chat';

export interface CommandExecutionResult {
  isCommand: boolean;
  actionType:
    | 'call'
    | 'whatsapp'
    | 'app_launch'
    | 'camera'
    | 'workspace_gmail'
    | 'workspace_drive'
    | 'settings'
    | 'phone_access'
    | 'app_update'
    | 'android_install'
    | 'none';
  feedbackText: string;
  targetApp?: string;
  intentUrl?: string;
  fallbackWebUrl?: string;
  navigateScreen?: ActiveScreen;
  workspaceTab?: 'gmail' | 'drive';
}

// Known wake words supported for Siri-style assistant
export const WAKE_WORDS = [
  'hey angel amit',
  'angel amit',
  'hey angel',
  'angel',
  'हे एंजल',
  'ok angel',
  'hey angel ai',
  'hey siri',
  'siri',
  'हे सिरी',
  'ok google',
];

/**
 * Checks if spoken transcript starts with or contains the wake word
 */
export function detectWakeWord(transcript: string): {
  detected: boolean;
  cleanCommand: string;
} {
  const lower = transcript.toLowerCase().trim();

  // Sort wake words by length descending so longer phrases match first
  const sortedWake = [...WAKE_WORDS].sort((a, b) => b.length - a.length);

  for (const wake of sortedWake) {
    if (lower.startsWith(wake)) {
      const remaining = lower.substring(wake.length).replace(/^[,.:! ]+/, '').trim();
      return { detected: true, cleanCommand: remaining };
    }
  }

  // Also check if wake word appears anywhere in phrase
  for (const wake of sortedWake) {
    const idx = lower.indexOf(wake);
    if (idx !== -1) {
      const remaining = lower.substring(idx + wake.length).replace(/^[,.:! ]+/, '').trim();
      return { detected: true, cleanCommand: remaining };
    }
  }

  return { detected: false, cleanCommand: transcript };
}

/**
 * Recognizes and parses device phone commands
 */
export function parseVoiceCommand(
  text: string,
  phoneAccess: PhoneAccessSettings
): CommandExecutionResult {
  // Strip wake words if still present
  const { cleanCommand } = detectWakeWord(text);
  const rawText = cleanCommand || text;
  const lower = rawText.toLowerCase().trim();

  // If phone access is completely disabled by user in Settings
  if (!phoneAccess?.enabled) {
    const isDeviceActionIntent =
      lower.includes('call') ||
      lower.includes('कॉल') ||
      lower.includes('whatsapp') ||
      lower.includes('open') ||
      lower.includes('खोलो') ||
      lower.includes('camera') ||
      lower.includes('phone') ||
      lower.includes('instagram') ||
      lower.includes('telegram');

    if (isDeviceActionIntent) {
      return {
        isCommand: true,
        actionType: 'none',
        feedbackText:
          'Phone Access is currently turned OFF in Settings. Please turn ON Phone Access to allow calling, launching apps, and hardware controls.',
        navigateScreen: 'settings',
      };
    }
  }

  // 1. Phone Call Intent:
  // "call the angel amit", "call angel amit", "call amit", "call the angel", "phone lagao amit", "call 9876543210"
  const isAngelAmitCall =
    lower.includes('call the angel amit') ||
    lower.includes('call angel amit') ||
    lower.includes('call the angel') ||
    lower.includes('call angel') ||
    lower.includes('call amit') ||
    lower.includes('amit ko call') ||
    lower.includes('amit ko phone');

  if (isAngelAmitCall && phoneAccess?.allowCallPhone) {
    const dialNumber = '+919876543210';
    return {
      isCommand: true,
      actionType: 'call',
      targetApp: 'Phone Dialer',
      feedbackText: 'Calling Angel Amit (+91 98765 43210)... Launching phone dialer.',
      intentUrl: `tel:${dialNumber}`,
    };
  }

  const callRegex = /(?:call|dial|कॉल करो|कॉल|फोन लगाओ|phone lagao)\s+(?:the\s+)?([a-zA-Z0-9+\s]+)/i;
  const callMatch = lower.match(callRegex);
  if (callMatch && phoneAccess?.allowCallPhone) {
    const target = callMatch[1].trim();
    const cleanNumber = target.replace(/[^0-9+]/g, '');
    const dialTarget = cleanNumber || target;
    const telUri = `tel:${encodeURIComponent(dialTarget)}`;

    return {
      isCommand: true,
      actionType: 'call',
      targetApp: 'Phone Dialer',
      feedbackText: `Calling ${target}... Opening phone dialer.`,
      intentUrl: telUri,
    };
  }

  // 2. WhatsApp Intent: "open whatsapp", "whatsapp चलाओ", "whatsapp kholo", "open the whatsapp"
  if (
    (lower.includes('whatsapp') || lower.includes('व्हाट्सएप') || lower.includes('व्हाट्सअप')) &&
    phoneAccess?.allowWhatsApp
  ) {
    const msgMatch = lower.match(/(?:to|ko|par)\s+([0-9+]+)(?:\s+(?:say|bolo|message)?\s*(.*))?/i);
    let whatsappUrl = 'whatsapp://send';
    let fallbackUrl = 'https://api.whatsapp.com/send';

    if (msgMatch && msgMatch[1]) {
      const phone = msgMatch[1].replace(/[^0-9+]/g, '');
      const textMsg = encodeURIComponent(msgMatch[2] || 'Hello from AK Editor Amit Assistant');
      whatsappUrl = `whatsapp://send?phone=${phone}&text=${textMsg}`;
      fallbackUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${textMsg}`;
    }

    return {
      isCommand: true,
      actionType: 'whatsapp',
      targetApp: 'WhatsApp',
      feedbackText: 'Opening WhatsApp at your command...',
      intentUrl: whatsappUrl,
      fallbackWebUrl: fallbackUrl,
    };
  }

  // 3. Instagram Intent: "hey angel open the instagram", "open instagram", "open the instagram", "instagram kholo"
  if (
    (lower.includes('instagram') || lower.includes('इन्स्टाग्राम') || lower.includes('insta')) &&
    phoneAccess?.allowAppsLaunch
  ) {
    return {
      isCommand: true,
      actionType: 'app_launch',
      targetApp: 'Instagram',
      feedbackText: 'Opening Instagram at your command...',
      intentUrl: 'instagram://app',
      fallbackWebUrl: 'https://instagram.com',
    };
  }

  // 4. Telegram Intent: "hey angel open the telegram", "open telegram", "open the telegram", "telegram kholo"
  if (
    (lower.includes('telegram') || lower.includes('टेलीग्राम') || lower.includes('tg')) &&
    phoneAccess?.allowAppsLaunch
  ) {
    return {
      isCommand: true,
      actionType: 'app_launch',
      targetApp: 'Telegram',
      feedbackText: 'Opening Telegram at your command...',
      intentUrl: 'tg://resolve',
      fallbackWebUrl: 'https://web.telegram.org',
    };
  }

  // 5. Camera Intent: "open camera", "take photo", "कैमरा खोलो", "फोटो खींचो", "photo kheencho"
  if (
    (lower.includes('camera') ||
      lower.includes('कैमरा') ||
      lower.includes('take photo') ||
      lower.includes('फोटो खींच') ||
      lower.includes('take picture')) &&
    phoneAccess?.allowCamera
  ) {
    return {
      isCommand: true,
      actionType: 'camera',
      targetApp: 'Camera',
      feedbackText: 'Opening Camera & Visual Lens sensor...',
      navigateScreen: 'visual-lens',
    };
  }

  // 6. Gmail Intent: "open gmail", "check email", "ईमेल खोलो", "gmail kholo"
  if (lower.includes('gmail') || lower.includes('ईमेल खोलो') || lower.includes('inbox') || lower.includes('check mail')) {
    return {
      isCommand: true,
      actionType: 'workspace_gmail',
      targetApp: 'Gmail',
      feedbackText: 'Accessing Gmail inbox through Google Workspace...',
      navigateScreen: 'workspace',
      workspaceTab: 'gmail',
      intentUrl: 'googlegmail://',
      fallbackWebUrl: 'https://mail.google.com',
    };
  }

  // 7. Google Drive Intent: "open drive", "google drive", "गूगल ड्राइव"
  if (lower.includes('drive') || lower.includes('ड्राइव')) {
    return {
      isCommand: true,
      actionType: 'workspace_drive',
      targetApp: 'Google Drive',
      feedbackText: 'Opening Google Drive cloud storage...',
      navigateScreen: 'workspace',
      workspaceTab: 'drive',
      intentUrl: 'googledrive://',
      fallbackWebUrl: 'https://drive.google.com',
    };
  }

  // 8. Settings or Phone Access: "open settings", "phone access", "permissions", "सेटिंग्स"
  if (
    lower.includes('phone access') ||
    lower.includes('permission') ||
    lower.includes('सेटिंग') ||
    lower.includes('settings')
  ) {
    return {
      isCommand: true,
      actionType: 'settings',
      targetApp: 'Settings',
      feedbackText: 'Opening Phone Access & System Permissions...',
      navigateScreen: 'settings',
    };
  }

  // 9. Update App Intent: "update the app", "update app", "check update", "check for updates", "ऐप अपडेट"
  if (
    lower.includes('update the app') ||
    lower.includes('update app') ||
    lower.includes('check update') ||
    lower.includes('check for update') ||
    lower.includes('अपडेट')
  ) {
    return {
      isCommand: true,
      actionType: 'app_update',
      targetApp: 'App Updater',
      feedbackText: 'Checking for AK Editor Amit app updates and syncing version...',
    };
  }

  // 10. Install to Android App Intent: "install to android app", "install app", "download apk", "install this android", "apk install"
  if (
    lower.includes('install to android') ||
    lower.includes('install android') ||
    lower.includes('install this android') ||
    lower.includes('apk install') ||
    lower.includes('install apk') ||
    lower.includes('apk option') ||
    lower.includes('apk download') ||
    lower.includes('download apk') ||
    lower.includes('install app') ||
    lower.includes('install the app') ||
    lower.includes('android app') ||
    lower.includes('install karo') ||
    lower.includes('ऐप इंस्टॉल') ||
    lower.includes('install on phone') ||
    lower.includes('download app')
  ) {
    return {
      isCommand: true,
      actionType: 'android_install',
      targetApp: 'Android Installer',
      feedbackText: 'Opening Android App installer and APK setup for AK Editor Amit...',
      navigateScreen: 'android-project',
    };
  }

  // 10. General App Launcher Intents
  if (phoneAccess?.allowAppsLaunch) {
    const appsMap: Record<string, { name: string; url: string; fallback: string; feedback: string }> = {
      youtube: {
        name: 'YouTube',
        url: 'vnd.youtube://',
        fallback: 'https://youtube.com',
        feedback: 'Launching YouTube...',
      },
      यूट्यूब: {
        name: 'YouTube',
        url: 'vnd.youtube://',
        fallback: 'https://youtube.com',
        feedback: 'Launching YouTube...',
      },
      maps: {
        name: 'Google Maps',
        url: 'geo:0,0?q=',
        fallback: 'https://maps.google.com',
        feedback: 'Opening Google Maps navigation...',
      },
      मैप्स: {
        name: 'Google Maps',
        url: 'geo:0,0?q=',
        fallback: 'https://maps.google.com',
        feedback: 'Opening Google Maps...',
      },
      chrome: {
        name: 'Chrome',
        url: 'googlechrome://',
        fallback: 'https://google.com',
        feedback: 'Launching Google Chrome browser...',
      },
      browser: {
        name: 'Browser',
        url: 'https://google.com',
        fallback: 'https://google.com',
        feedback: 'Opening browser...',
      },
      spotify: {
        name: 'Spotify',
        url: 'spotify:',
        fallback: 'https://open.spotify.com',
        feedback: 'Opening Spotify music player...',
      },
      calculator: {
        name: 'Calculator',
        url: 'calculator:',
        fallback: 'https://www.google.com/search?q=calculator',
        feedback: 'Opening Calculator...',
      },
    };

    for (const [key, appInfo] of Object.entries(appsMap)) {
      if (
        lower.startsWith(`open ${key}`) ||
        lower.startsWith(`open the ${key}`) ||
        lower.startsWith(`${key} kholo`) ||
        lower.startsWith(`${key} खोलो`) ||
        lower.includes(`launch ${key}`) ||
        lower === key
      ) {
        return {
          isCommand: true,
          actionType: 'app_launch',
          targetApp: appInfo.name,
          feedbackText: appInfo.feedback,
          intentUrl: appInfo.url,
          fallbackWebUrl: appInfo.fallback,
        };
      }
    }
  }

  return {
    isCommand: false,
    actionType: 'none',
    feedbackText: '',
  };
}

/**
 * Execute the recognized intent safely on Android / Web
 */
export function executeAppIntent(result: CommandExecutionResult): boolean {
  if (!result.intentUrl && !result.fallbackWebUrl) return false;

  const primaryUrl = result.intentUrl || result.fallbackWebUrl!;
  const fallbackUrl = result.fallbackWebUrl || result.intentUrl!;

  try {
    // Attempt standard intent URL
    if (primaryUrl.startsWith('tel:') || primaryUrl.startsWith('mailto:')) {
      window.location.href = primaryUrl;
      return true;
    }

    // For custom protocol schemes like instagram://, tg://, whatsapp://
    // Try location redirect with fallback to web URL
    const start = Date.now();
    const isCustomScheme = primaryUrl.includes('://') && !primaryUrl.startsWith('http');

    if (isCustomScheme && fallbackUrl && fallbackUrl.startsWith('http')) {
      window.location.href = primaryUrl;
      setTimeout(() => {
        // If window is still focused after 1000ms, user may not have native app installed
        if (Date.now() - start < 1500) {
          window.open(fallbackUrl, '_blank');
        }
      }, 1000);
      return true;
    }

    // Standard web URL
    window.open(fallbackUrl, '_blank');
    return true;
  } catch (err) {
    console.warn('Intent execution failed, falling back:', err);
    try {
      if (fallbackUrl) {
        window.open(fallbackUrl, '_blank');
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }
}

