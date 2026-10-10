import { useState, useRef, useCallback, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { VoiceAssistantHUD } from './components/VoiceAssistantHUD';
import { VisualLensScreen } from './components/VisualLensScreen';
import { OrbCustomizationScreen } from './components/OrbCustomizationScreen';
import { PhoneActionsScreen } from './components/PhoneActionsScreen';
import { ConnectorsScreen } from './components/ConnectorsScreen';
import { DiscoverScreen } from './components/DiscoverScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AuthScreen } from './components/AuthScreen';
import { AndroidExportModal } from './components/AndroidExportModal';
import { WorkspaceHub } from './components/WorkspaceHub';
import { AppUpdateModal } from './components/AppUpdateModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useChatStorage } from './hooks/useChatStorage';
import { useVoiceInput } from './hooks/useVoiceInput';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useWakeWord } from './hooks/useWakeWord';
import { parseVoiceCommand, executeAppIntent } from './services/voiceCommandService';
import { Message, ActiveScreen, OrbState, LanguageMode } from './types/chat';
import { ArrowLeft, Trash2, Languages, Sparkles } from 'lucide-react';

export default function App() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    settings,
    setSettings,
    createNewConversation,
    addMessageToActive,
    updateMessageInActive,
    clearActiveConversation,
  } = useChatStorage();

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [workspaceTab, setWorkspaceTab] = useState<'gmail' | 'drive'>('gmail');
  const [isGlobalUpdateModalOpen, setIsGlobalUpdateModalOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [geminiConnected, setGeminiConnected] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Check backend Gemini API status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.geminiConnected === 'boolean') {
          setGeminiConnected(data.geminiConnected);
        }
      })
      .catch(() => {
        // Fallback to true in preview environment
        setGeminiConnected(true);
      });
  }, []);

  // Text to Speech hook
  const {
    isSpeaking,
    speakingMessageId,
    isLoadingAudio,
    speak,
    stop: stopSpeaking,
  } = useSpeechSynthesis({
    voiceName: settings.voiceName,
    engine: settings.ttsEngine,
    onError: (err) => console.warn('TTS Warning:', err),
  });

  // Voice Input (Microphone) hook
  const {
    isListening,
    isProcessingAudio,
    interimText,
    audioLevel,
    permissionDenied,
    toggleListening,
    stopListening,
    startListening,
  } = useVoiceInput({
    onTranscript: (spokenText) => {
      // If voice HUD is active, send immediately!
      if (activeScreen === 'voice') {
        handleSendMessage(spokenText);
      } else {
        setInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
      }
    },
    onError: (err) => {
      // Only show error toast if not already shown inside the Voice HUD
      if (activeScreen !== 'voice') {
        setActiveError(err);
        setTimeout(() => setActiveError(null), 5000);
      }
    },
  });

  // Haptic feedback trigger
  const triggerHaptic = useCallback(
    (durationMs = 25) => {
      if (settings.hapticFeedback && typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(durationMs);
        } catch {
          // Ignore
        }
      }
    },
    [settings.hapticFeedback]
  );

  // Derive Orb State
  const orbState: OrbState = isListening
    ? 'listening'
    : isStreaming || isProcessingAudio
    ? 'processing'
    : isSpeaking
    ? 'speaking'
    : activeError
    ? 'error'
    : !geminiConnected
    ? 'offline'
    : 'idle';

  // Stop current streaming generation
  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Send message and stream response from Gemini backend
  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend !== undefined ? textToSend : input).trim();
    if (!promptText || isStreaming) return;

    triggerHaptic(40);
    stopSpeaking();
    stopListening();
    setInput('');
    setActiveError(null);

    const userMessageId = 'msg_' + Date.now() + '_user';
    const assistantMessageId = 'msg_' + (Date.now() + 1) + '_assistant';

    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    };

    addMessageToActive(userMessage);

    // Check device / phone voice commands (Call, WhatsApp, Apps, Camera, Workspace, Settings)
    const cmdResult = parseVoiceCommand(promptText, settings.phoneAccess);
    if (cmdResult.isCommand) {
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: `⚡ **Voice Command Executed:** ${cmdResult.feedbackText}\n\n*Action: ${cmdResult.targetApp || cmdResult.actionType.toUpperCase()}*`,
        timestamp: Date.now(),
        isStreaming: false,
      };

      addMessageToActive(assistantMessage);

      if (settings.autoSpeak) {
        speak(cmdResult.feedbackText, assistantMessageId);
      }

      if (cmdResult.actionType === 'app_update') {
        setIsGlobalUpdateModalOpen(true);
      }

      if (cmdResult.intentUrl) {
        executeAppIntent(cmdResult);
      }

      if (cmdResult.navigateScreen) {
        if (cmdResult.workspaceTab) {
          setWorkspaceTab(cmdResult.workspaceTab);
        }
        setActiveScreen(cmdResult.navigateScreen);
      }

      return;
    }

    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    addMessageToActive(assistantMessage);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const history = (activeConversation?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      history.push({ role: 'user', content: promptText });

      // Language instruction augment
      let languagePrompt = '';
      if (settings.language === 'hindi') {
        languagePrompt = ' Always respond in fluent, natural Hindi (Devanagari script) with warmth and precision.';
      } else if (settings.language === 'hinglish') {
        languagePrompt = ' When appropriate, respond in natural, friendly Hinglish (Hindi written in Latin/English alphabet) mixed with crisp English.';
      }

      const systemPrompt =
        (settings.persona === 'custom'
          ? settings.customSystemPrompt
          : undefined) + languagePrompt;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          systemInstruction: systemPrompt || undefined,
          temperature: settings.temperature,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body stream is not available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              updateMessageInActive(assistantMessageId, {
                content: accumulatedText,
                isStreaming: true,
              });
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) {
              throw e;
            }
          }
        }
      }

      // Finish streaming
      updateMessageInActive(assistantMessageId, {
        content: accumulatedText || 'I am ready to assist you further.',
        isStreaming: false,
      });

      // Auto-speak if enabled
      if ((settings.autoSpeak || activeScreen === 'voice') && accumulatedText) {
        speak(accumulatedText, assistantMessageId);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        updateMessageInActive(assistantMessageId, (prev) => ({
          ...prev,
          content: prev.content
            ? `${prev.content}\n\n*(Generation stopped)*`
            : '*(Generation stopped)*',
          isStreaming: false,
        }));
      } else {
        console.error('Chat send error:', err);
        const errorText =
          err?.message || 'Failed to communicate with AI service. Please verify network or key.';
        updateMessageInActive(assistantMessageId, {
          content: errorText,
          error: true,
          errorMessage: errorText,
          isStreaming: false,
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = (msgIndex: number) => {
    const msgs = activeConversation?.messages || [];
    const targetMsg = msgs[msgIndex];
    if (!targetMsg) return;

    if (targetMsg.role === 'user') {
      handleSendMessage(targetMsg.content);
    } else {
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (msgs[i].role === 'user') {
          handleSendMessage(msgs[i].content);
          break;
        }
      }
    }
  };

  // Wake-word ("Hey Angel") handler
  const handleWakeWordDetected = useCallback(
    (cleanCommand: string) => {
      triggerHaptic(50);
      if (cleanCommand.trim()) {
        handleSendMessage(cleanCommand.trim());
      } else {
        setActiveScreen('voice');
        if (!isListening) {
          startListening();
        }
      }
    },
    [triggerHaptic, isListening, startListening]
  );

  const { isWakeWordListening } = useWakeWord({
    enabled: !!settings.phoneAccess?.wakeWordEnabled && activeScreen !== 'voice',
    onWakeWordDetected: handleWakeWordDetected,
    isMainVoiceActive: isListening || isSpeaking,
  });

  // Get last assistant response text for voice HUD playback
  const lastAssistantMsg = (activeConversation?.messages || [])
    .filter((m) => m.role === 'assistant' && !m.error && m.content)
    .slice(-1)[0]?.content || '';

  return (
    <div className="relative min-h-screen w-full bg-[#07070a] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-red-500/20 selection:text-red-400">
      {/* Top Ambient Glow Flare */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Error notification banner */}
      {activeError && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4">
          <div className="bg-red-950/90 border border-red-500/50 text-red-200 text-xs px-3.5 py-2.5 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-md">
            <span>{activeError}</span>
            <button
              onClick={() => setActiveError(null)}
              className="text-white font-bold ml-2 hover:opacity-80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Screen Router */}
      <main className="flex-1 flex flex-col w-full relative">
        {/* 1. HOME SCREEN */}
        {activeScreen === 'home' && (
          <HomeScreen
            orbState={orbState}
            orbSettings={settings.orb}
            audioLevel={audioLevel}
            userProfile={settings.profile}
            onOrbClick={() => {
              triggerHaptic(30);
              setActiveScreen('voice');
              if (!isListening) {
                startListening();
              }
            }}
            onNavigate={(screen) => {
              triggerHaptic(20);
              setActiveScreen(screen);
            }}
            onOpenWorkspace={(tab) => {
              triggerHaptic(20);
              setWorkspaceTab(tab);
              setActiveScreen('workspace');
            }}
            onSendPrompt={(prompt, keepOnHome) => {
              if (!keepOnHome) {
                setActiveScreen('chat');
              }
              handleSendMessage(prompt);
            }}
            isOnline={geminiConnected}
            isWakeWordListening={isWakeWordListening}
            wakeWordEnabled={!!settings.phoneAccess?.wakeWordEnabled}
            lastAssistantResponse={lastAssistantMsg}
            isStreaming={isStreaming}
            isSpeaking={isSpeaking}
            onStopSpeaking={stopSpeaking}
            onRepeatSpeaking={() => {
              if (lastAssistantMsg) {
                speak(lastAssistantMsg, 'repeat_' + Date.now());
              }
            }}
          />
        )}

        {/* 2. CHAT SCREEN */}
        {activeScreen === 'chat' && (
          <div className="flex-1 flex flex-col h-screen pb-20">
            {/* Chat Header */}
            <div className="h-14 border-b border-white/10 bg-[#0c0c12]/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveScreen('home')}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                    {activeConversation?.title || 'NOVA Chat'}
                  </h1>
                  <span className="text-[10px] text-red-400 font-mono">
                    Gemini 3.8 Flash • {settings.language.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center space-x-2">
                {/* Language Switch */}
                <button
                  onClick={() => {
                    const nextLang: LanguageMode =
                      settings.language === 'english'
                        ? 'hinglish'
                        : settings.language === 'hinglish'
                        ? 'hindi'
                        : 'english';
                    setSettings((prev) => ({ ...prev, language: nextLang }));
                  }}
                  className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] uppercase font-semibold text-slate-300 hover:text-white flex items-center space-x-1"
                  title="Switch Language"
                >
                  <Languages className="w-3 h-3 text-red-400" />
                  <span>{settings.language}</span>
                </button>

                <button
                  onClick={() => {
                    stopSpeaking();
                    clearActiveConversation();
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <MessageList
              messages={activeConversation?.messages || []}
              isStreaming={isStreaming}
              onSendPrompt={(p) => handleSendMessage(p)}
              onSpeak={speak}
              isSpeaking={isSpeaking}
              speakingMessageId={speakingMessageId}
              isLoadingAudio={isLoadingAudio}
              onRetry={handleRetry}
            />

            {/* Chat Input */}
            <ChatInput
              input={input}
              setInput={setInput}
              onSend={() => handleSendMessage()}
              isStreaming={isStreaming}
              onStop={handleStopStreaming}
              isListening={isListening}
              isProcessingAudio={isProcessingAudio}
              onToggleVoice={toggleListening}
              interimVoiceText={interimText}
              audioLevel={audioLevel}
            />
          </div>
        )}

        {/* 3. VISUAL LENS SCREEN */}
        {activeScreen === 'visual-lens' && (
          <VisualLensScreen
            onBack={() => setActiveScreen('home')}
            onSpeak={(text) => speak(text, 'visual_lens_output')}
          />
        )}

        {/* 4. ORB CUSTOMIZATION SCREEN */}
        {activeScreen === 'orb-custom' && (
          <OrbCustomizationScreen
            settings={settings.orb}
            onUpdateSettings={(updater) =>
              setSettings((prev) => ({ ...prev, orb: updater(prev.orb) }))
            }
            onBack={() => setActiveScreen('home')}
          />
        )}

        {/* 5. PHONE ACTIONS SCREEN */}
        {activeScreen === 'phone-actions' && (
          <PhoneActionsScreen
            onBack={() => setActiveScreen('home')}
            onNavigateToCamera={() => setActiveScreen('visual-lens')}
          />
        )}

        {/* 6. CONNECTORS SCREEN */}
        {activeScreen === 'connectors' && (
          <ConnectorsScreen
            onBack={() => setActiveScreen('home')}
            geminiConnected={geminiConnected}
            onOpenWorkspace={(tab) => {
              triggerHaptic(20);
              setWorkspaceTab(tab);
              setActiveScreen('workspace');
            }}
          />
        )}

        {/* 7. DISCOVER SCREEN */}
        {activeScreen === 'discover' && (
          <DiscoverScreen
            onBack={() => setActiveScreen('home')}
            onSelectTool={(prompt) => {
              setActiveScreen('chat');
              handleSendMessage(prompt);
            }}
          />
        )}

        {/* 8. SETTINGS SCREEN */}
        {activeScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={setSettings}
            onNavigate={(screen) => setActiveScreen(screen)}
            onClearHistory={() => {
              clearActiveConversation();
              setActiveScreen('home');
            }}
            onOpenAuth={() => setActiveScreen('auth')}
            onBack={() => setActiveScreen('home')}
          />
        )}

        {/* 9. AUTH SCREEN */}
        {activeScreen === 'auth' && (
          <AuthScreen
            currentProfile={settings.profile}
            onComplete={(newProfile) => {
              setSettings((prev) => ({ ...prev, profile: newProfile }));
              setActiveScreen('home');
            }}
            onClose={() => setActiveScreen('home')}
          />
        )}

        {/* 10. ANDROID PROJECT EXPORT & APK GUIDE */}
        {activeScreen === 'android-project' && (
          <AndroidExportModal onBack={() => setActiveScreen('home')} />
        )}

        {/* 11. GOOGLE WORKSPACE (GMAIL & GOOGLE DRIVE) HUB */}
        {activeScreen === 'workspace' && (
          <WorkspaceHub
            onBack={() => setActiveScreen('home')}
            onAskNova={(prompt) => {
              setActiveScreen('chat');
              handleSendMessage(prompt);
            }}
            initialTab={workspaceTab}
          />
        )}
      </main>

      {/* Voice Assistant Fullscreen HUD Overlay */}
      {activeScreen === 'voice' && (
        <VoiceAssistantHUD
          orbState={orbState}
          orbSettings={settings.orb}
          audioLevel={audioLevel}
          isListening={isListening}
          isSpeaking={isSpeaking}
          permissionDenied={permissionDenied}
          transcript={interimText || input}
          assistantResponse={lastAssistantMsg}
          language={settings.language}
          onToggleListening={toggleListening}
          onStopSpeaking={stopSpeaking}
          onRepeatSpeaking={() => {
            if (lastAssistantMsg) speak(lastAssistantMsg, 'repeat_hud');
          }}
          onChangeLanguage={(lang) =>
            setSettings((prev) => ({ ...prev, language: lang }))
          }
          onSendTextPrompt={(prompt) => handleSendMessage(prompt)}
          onClose={() => {
            stopListening();
            stopSpeaking();
            setActiveScreen('home');
          }}
        />
      )}

      {/* Bottom Navigation Bar (Shown on main navigation screens) */}
      {activeScreen !== 'voice' && activeScreen !== 'auth' && (
        <BottomNavBar
          activeScreen={activeScreen}
          onNavigate={(screen) => {
            triggerHaptic(20);
            setActiveScreen(screen);
          }}
          onOrbClick={() => {
            triggerHaptic(35);
            setActiveScreen('voice');
            if (!isListening) {
              startListening();
            }
          }}
          orbColor={settings.orb.color}
          isListening={isListening}
        />
      )}

      {/* Offline Toast */}
      <OfflineIndicator />

      {/* Global App Update Modal */}
      <AppUpdateModal
        isOpen={isGlobalUpdateModalOpen}
        onClose={() => setIsGlobalUpdateModalOpen(false)}
      />
    </div>
  );
}
