import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Smartphone,
  Folder,
  FileCode,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  PhoneCall,
  Mic,
  Camera,
  Share2,
  Radio,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidExportModalProps {
  onBack: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'install' | 'source' | 'permissions'>('install');
  const [selectedFile, setSelectedFile] = useState<string>('MainActivity.kt');
  const [copied, setCopied] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    }
  };

  const androidFiles: Record<string, { path: string; lang: string; content: string }> = {
    'MainActivity.kt': {
      path: 'app/src/main/java/com/akeditoramit/aiassistant/MainActivity.kt',
      lang: 'kotlin',
      content: `package com.akeditoramit.aiassistant

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.akeditoramit.aiassistant.ui.theme.AKTheme
import com.akeditoramit.aiassistant.ui.screens.HomeScreen
import com.akeditoramit.aiassistant.ui.screens.ChatScreen
import com.akeditoramit.aiassistant.ui.screens.VoiceAssistantScreen
import com.akeditoramit.aiassistant.ui.screens.VisualLensScreen
import com.akeditoramit.aiassistant.ui.screens.PhoneActionsScreen

/**
 * AK Editor Amit - Intelligent Voice Assistant
 * Developed by: AK Editor Amit
 * Features: "Hey Angel" Voice Activation, Animated Waveform, Full Android Phone Access
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AKTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF07070A) // Pure black futuristic backdrop
                ) {
                    val navController = rememberNavController()
                    NavHost(
                        navController = navController,
                        startDestination = "home"
                    ) {
                        composable("home") { HomeScreen(navController) }
                        composable("chat") { ChatScreen(navController) }
                        composable("voice") { VoiceAssistantScreen(navController) }
                        composable("visual_lens") { VisualLensScreen(navController) }
                        composable("phone_actions") { PhoneActionsScreen(navController) }
                    }
                }
            }
        }
    }
}`,
    },
    'NovaOrb.kt': {
      path: 'app/src/main/java/com/akeditoramit/aiassistant/ui/components/NovaOrb.kt',
      lang: 'kotlin',
      content: `package com.akeditoramit.aiassistant.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp

enum class OrbState { IDLE, LISTENING, PROCESSING, SPEAKING, ERROR }

/**
 * Animated Futuristic Siri & Gemini Core Waveform
 * Designed for AK Editor Amit Voice Assistant
 */
@Composable
fun NovaOrb(
    state: OrbState,
    audioLevel: Float = 0f,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "OrbSpin")
    
    val ringRotation1 by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = if (state == OrbState.PROCESSING) 3000 else 16000, easing = LinearEasing)
        ),
        label = "Ring1"
    )

    val ringRotation2 by infiniteTransition.animateFloat(
        initialValue = 360f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 20000, easing = LinearEasing)
        ),
        label = "Ring2"
    )

    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "Pulse"
    )

    Canvas(modifier = modifier.size(240.dp)) {
        val center = Offset(size.width / 2f, size.height / 2f)
        val crimsonGlow = Color(0xFFFF1E38)
        val outerRadius = 85.dp.toPx() * pulseScale

        // Ambient radial glow
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(crimsonGlow.copy(alpha = 0.4f), Color.Transparent),
                center = center,
                radius = outerRadius * 1.5f
            ),
            center = center,
            radius = outerRadius * 1.5f
        )

        // Orbital Ring 1
        drawArc(
            color = crimsonGlow.copy(alpha = 0.85f),
            startAngle = ringRotation1,
            sweepAngle = 260f,
            useCenter = false,
            topLeft = Offset(center.x - outerRadius, center.y - (outerRadius * 0.65f)),
            size = Size(outerRadius * 2f, outerRadius * 1.3f),
            style = Stroke(width = 4f)
        )

        // Orbital Ring 2 (Opposite Axis)
        drawArc(
            color = Color(0xFFFF4D6D).copy(alpha = 0.7f),
            startAngle = ringRotation2,
            sweepAngle = 220f,
            useCenter = false,
            topLeft = Offset(center.x - (outerRadius * 1.1f), center.y - (outerRadius * 0.55f)),
            size = Size(outerRadius * 2.2f, outerRadius * 1.1f),
            style = Stroke(width = 3f)
        )

        // Central Solid Glowing Core
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(Color.White, crimsonGlow, Color(0xFF660011)),
                center = Offset(center.x - 10f, center.y - 10f),
                radius = 50.dp.toPx()
            ),
            center = center,
            radius = 48.dp.toPx()
        )
    }
}`,
    },
    'AndroidManifest.xml': {
      path: 'app/src/main/AndroidManifest.xml',
      lang: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.akeditoramit.aiassistant">

    <!-- Essential Android Permissions for Voice, Vision, & Full Phone Access -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <!-- Phone Action Intent Queries for Instant App Launching -->
    <queries>
        <intent>
            <action android:name="android.intent.action.DIAL" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="tel" />
        </intent>
        <package android:name="com.whatsapp" />
        <package android:name="com.instagram.android" />
        <package android:name="org.telegram.messenger" />
        <package android:name="com.google.android.youtube" />
        <package android:name="com.google.android.apps.maps" />
        <package android:name="com.google.android.gm" />
        <package android:name="com.google.android.apps.docs" />
    </queries>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="AK Editor Amit"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AKAssistant">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.AKAssistant">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- Siri / Assistant Trigger Intent -->
            <intent-filter>
                <action android:name="android.intent.action.ASSIST" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    'build.gradle.kts': {
      path: 'app/build.gradle.kts',
      lang: 'kotlin',
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.akeditoramit.aiassistant"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.akeditoramit.aiassistant"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "2.4.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.kotlinx.coroutines.android)
    
    // Official Google Gemini AI SDK for Android
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")
}`,
    },
    'README.md': {
      path: 'README.md',
      lang: 'markdown',
      content: `# AK Editor Amit - Intelligent Voice Assistant
## Developer: AK Editor Amit (Package: com.akeditoramit.aiassistant)
### Native Android Project with Jetpack Compose & Google Gemini 3.8

### System Requirements:
- Android Studio Ladybug or newer
- JDK 17 or higher
- Android SDK 35 (Min SDK 26, Android 8.0+)

### How to Build APK on Android Studio:
1. Open this unzipped folder in **Android Studio**.
2. Let Gradle sync project dependencies.
3. In top menu: **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
4. Android Studio will notify when complete with a **locate** button.
5. Your signed debug APK will be at:
   \`app/build/outputs/apk/debug/app-debug.apk\`

### Build APK via Command Line:
\`\`\`bash
# Build Debug APK
./gradlew assembleDebug

# Install directly to phone connected via USB or WiFi:
adb install app/build/outputs/apk/debug/app-debug.apk
\`\`\`
`,
    },
  };

  const handleCopyCode = () => {
    const code = androidFiles[selectedFile]?.content || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      const zip = new JSZip();

      // Populate files into zip structure
      Object.entries(androidFiles).forEach(([_, file]) => {
        zip.file(file.path, file.content);
      });

      // Add extra Gradle settings and root wrapper
      zip.file(
        'settings.gradle.kts',
        `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "AKEditorAmit"
include(":app")
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AK_Editor_Amit_Android_App.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-24 pt-3 px-4 max-w-lg mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase truncate">
              AK Editor Amit
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-600 text-white font-mono shrink-0">
              Android Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">
            Developer: AK Editor Amit • com.akeditoramit.aiassistant
          </p>
        </div>
      </div>

      {/* Navigation Mode Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#14141e] p-1 rounded-2xl border border-white/10 my-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('install')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'install'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Install to Phone</span>
        </button>

        <button
          onClick={() => setActiveTab('source')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'source'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">APK Source (ZIP)</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'permissions'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Permissions</span>
        </button>
      </div>

      {/* TAB 1: 1-CLICK DIRECT ANDROID APP INSTALL */}
      {activeTab === 'install' && (
        <div className="space-y-4">
          {/* Main Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/70 via-[#181018] to-[#0c0c14] border border-red-500/40 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Direct Android App Installation
                  </h3>
                  <p className="text-[11px] text-slate-400">WebAPK • Standalone Fullscreen</p>
                </div>
              </div>

              {isInstalled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Installed</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 font-mono">
                  Ready to Install
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Install <strong>AK Editor Amit</strong> directly onto your Android device home screen.
              It operates like a native phone assistant: full-screen, with "Hey Angel" voice detection,
              direct app launch shortcuts, and offline storage.
            </p>

            {/* Direct Install Button */}
            {isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-900/50 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Install AK Editor Amit App on Phone</span>
              </button>
            ) : isInstalled ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  App is already installed on this phone! You can launch it anytime from your phone's home screen.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>How to Install on Any Android Device (Chrome / Samsung Internet):</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
                    <li>
                      In Google Chrome on your phone, tap the <strong className="text-white">Three Dots (⋮)</strong> at top right.
                    </li>
                    <li>
                      Tap <strong className="text-red-400">"Install app"</strong> or <strong className="text-red-400">"Add to Home screen"</strong>.
                    </li>
                    <li>
                      Tap <strong className="text-white">"Install"</strong> — The app icon appears on your Android phone home screen instantly!
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Option 2: APK Direct Download Option Card */}
          <div className="p-4 rounded-2xl bg-[#141420] border border-red-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Option 2: Download Android APK Package
                </h4>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">v2.4.0 APK Ready</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Prefer compiling or installing a standalone Android package? Download the complete ready-to-build Android Studio project bundle with one tap:
            </p>

            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow active:scale-[0.98] transition-all"
            >
              {isExportingZip ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Packaging APK Project ZIP...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>APK Project Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download AK Editor Amit APK Package (.ZIP)</span>
                </>
              )}
            </button>
          </div>

          {/* Android App Capabilities Included */}
          <div className="p-4 rounded-2xl bg-[#14141e] border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Installed Android Features:</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start space-x-2">
                <Mic className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Hey Angel Voice</div>
                  <div className="text-[10px] text-slate-400">Continuous Siri-style listen</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start space-x-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Call Angel Amit</div>
                  <div className="text-[10px] text-slate-400">1-click direct dialer</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start space-x-2">
                <Layers className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white">App Launcher</div>
                  <div className="text-[10px] text-slate-400">Instagram, Telegram, etc.</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start space-x-2">
                <Camera className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Gemini Lens Vision</div>
                  <div className="text-[10px] text-slate-400">Camera multimodal AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NATIVE ANDROID STUDIO PROJECT & APK EXPORT */}
      {activeTab === 'source' && (
        <div className="space-y-4">
          {/* APK Overview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/50 to-[#14141e] border border-red-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>Jetpack Compose APK Project</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">v2.4.0</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Official native Android Studio project files with Kotlin, Jetpack Compose 2026,
              animated Canvas Orb, Android SpeechRecognizer, and Gemini Generative AI SDK.
            </p>

            {/* Download Complete ZIP Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadZip}
                disabled={isExportingZip}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-red-950/50"
              >
                {isExportingZip ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Packaging ZIP...</span>
                  </>
                ) : exportSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Downloaded Successfully!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Project ZIP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* File Selector Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {Object.keys(androidFiles).map((fileName) => {
              const isSelected = selectedFile === fileName;
              return (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-[#14141e] text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{fileName}</span>
                </button>
              );
            })}
          </div>

          {/* File Path & Copy Action */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="font-mono text-[10px] truncate max-w-xs">
              {androidFiles[selectedFile]?.path}
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-2xl bg-black/80 border border-white/10 p-3.5 overflow-x-auto text-[11px] font-mono text-slate-300 shadow-inner max-h-80">
            <pre>{androidFiles[selectedFile]?.content}</pre>
          </div>

          {/* Step by Step Guide to Generate APK */}
          <div className="p-4 rounded-2xl bg-[#14141e] border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>3 Steps to Compile APK in Android Studio:</span>
            </h3>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Download or extract project files into an Android Studio folder with package <code className="text-red-400">com.akeditoramit.aiassistant</code>.
              </li>
              <li>
                Run <strong className="text-white">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> or run <code className="text-red-400">./gradlew assembleDebug</code>.
              </li>
              <li>
                Transfer <code className="text-white">app-debug.apk</code> to your phone and install!
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 3: ANDROID PERMISSIONS CHECKLIST */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#14141e] border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Android Runtime Permissions</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              For complete Siri-style hands-free operation and device control on Android,
              ensure the following permissions are granted in your phone's Android App Settings:
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Microphone (Audio)</div>
                    <div className="text-[10px] text-slate-400">android.permission.RECORD_AUDIO</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Required
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Camera (Vision Lens)</div>
                    <div className="text-[10px] text-slate-400">android.permission.CAMERA</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Required
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Phone Dialer / Calls</div>
                    <div className="text-[10px] text-slate-400">android.permission.CALL_PHONE</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  Active
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Notifications & Background</div>
                    <div className="text-[10px] text-slate-400">POST_NOTIFICATIONS & FOREGROUND_SERVICE</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  Recommended
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Credit Footer */}
      <div className="mt-6 text-center text-xs text-slate-500 border-t border-white/5 pt-4 space-y-1">
        <p className="font-semibold text-slate-400">AK Editor Amit - Intelligent Voice Assistant</p>
        <p className="text-[11px]">Developer: AK Editor Amit • All Android rights reserved</p>
      </div>
    </div>
  );
};
