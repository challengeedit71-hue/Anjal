import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, AssistantSettings } from '../types/chat';
import { DEFAULT_SETTINGS } from '../utils/constants';

const STORAGE_KEY_CONVERSATIONS = 'aura_ai_conversations_v2';
const STORAGE_KEY_ACTIVE_ID = 'aura_ai_active_conv_id';
const STORAGE_KEY_SETTINGS = 'aura_ai_settings_v2';
const STORAGE_KEY_THEME = 'aura_ai_theme';

export function useChatStorage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    }
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (saved) {
        return saved;
      }
    } catch (e) {
      console.error('Error loading active conv id:', e);
    }
    return '';
  });

  const [settings, setSettings] = useState<AssistantSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          phoneAccess: {
            ...DEFAULT_SETTINGS.phoneAccess,
            ...(parsed.phoneAccess || {}),
          },
        };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Ignore
    }
    return 'dark';
  });

  // Apply theme class to <html>
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignore
    }
  }, [theme]);

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Error persisting conversations:', e);
    }
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    try {
      if (activeConversationId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeConversationId);
      }
    } catch (e) {
      console.error('Error persisting active conv id:', e);
    }
  }, [activeConversationId]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error persisting settings:', e);
    }
  }, [settings]);

  // Create a new blank conversation
  const createNewConversation = useCallback((): Conversation => {
    const newConv: Conversation = {
      id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv;
  }, []);

  // Initialize conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    } else if (!activeConversationId || !conversations.some((c) => c.id === activeConversationId)) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations, createNewConversation]);

  // Get active conversation object
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Add message to active conversation
  const addMessageToActive = useCallback(
    (message: Message) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            // Update title if first message
            let title = c.title;
            if (c.messages.length === 0 && message.role === 'user') {
              title = message.content.slice(0, 32).trim() || 'Conversation';
            }
            return {
              ...c,
              title,
              messages: [...c.messages, message],
              updatedAt: Date.now(),
            };
          }
          return c;
        })
      );
    },
    [activeConversationId]
  );

  // Update existing message in active conversation (e.g. streaming update or error)
  const updateMessageInActive = useCallback(
    (messageId: string, updater: Partial<Message> | ((prevMsg: Message) => Message)) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id === messageId) {
                  if (typeof updater === 'function') {
                    return updater(m);
                  }
                  return { ...m, ...updater };
                }
                return m;
              }),
              updatedAt: Date.now(),
            };
          }
          return c;
        })
      );
    },
    [activeConversationId]
  );

  // Clear messages from active conversation
  const clearActiveConversation = useCallback(() => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            title: 'New Conversation',
            messages: [],
            updatedAt: Date.now(),
          };
        }
        return c;
      })
    );
  }, [activeConversationId]);

  // Rename a conversation
  const renameConversation = useCallback((id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim() || 'Untitled Chat', updatedAt: Date.now() } : c))
    );
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (filtered.length === 0) {
          const fresh = {
            id: 'conv_' + Date.now(),
            title: 'New Conversation',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setActiveConversationId(fresh.id);
          return [fresh];
        }
        if (activeConversationId === id) {
          setActiveConversationId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeConversationId]
  );

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    const fresh: Conversation = {
      id: 'conv_' + Date.now(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations([fresh]);
    setActiveConversationId(fresh.id);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    settings,
    setSettings,
    theme,
    toggleTheme,
    createNewConversation,
    addMessageToActive,
    updateMessageInActive,
    clearActiveConversation,
    renameConversation,
    deleteConversation,
    clearAllConversations,
  };
}
