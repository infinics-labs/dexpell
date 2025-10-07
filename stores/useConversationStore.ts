import { create } from "zustand";
import { Item } from "@/lib/assistant";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getInitialMessage } from "@/config/constants";
import { CARGO_INITIAL_MESSAGE } from "@/config/cargo-prompt";

// Function to get language from cookie or browser
function getInitialLanguage(): 'en' | 'tr' {
  if (typeof window === 'undefined') return 'en';
  
  try {
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('lang='));
    if (cookie) {
      const value = cookie.split('=')[1];
      if (value === 'tr') return 'tr';
      if (value === 'en') return 'en';
    }
    
    // Default from browser
    const isTR = navigator.language.toLowerCase().includes('tr');
    return isTR ? 'tr' : 'en';
  } catch (error) {
    // Fallback to English if there's any error
    return 'en';
  }
}

export type AssistantMode = 'general' | 'cargo';

interface ConversationState {
  // Items displayed in the chat
  chatMessages: Item[];
  // Items sent to the Responses API
  conversationItems: any[];
  // Whether we are waiting for the assistant response
  isAssistantLoading: boolean;
  // Current assistant mode
  assistantMode: AssistantMode;
  // Current language
  language: 'en' | 'tr';

  setChatMessages: (items: Item[]) => void;
  setConversationItems: (messages: any[]) => void;
  addChatMessage: (item: Item) => void;
  addConversationItem: (message: ChatCompletionMessageParam) => void;
  setAssistantLoading: (loading: boolean) => void;
  setAssistantMode: (mode: AssistantMode) => void;
  setLanguage: (language: 'en' | 'tr') => void;
  updateInitialMessage: () => void;
  initializeLanguage: () => void;
  rawSet: (state: any) => void;
  resetConversation: () => void;
}

const useConversationStore = create<ConversationState>((set, get) => {
  const initialLanguage = getInitialLanguage();
  const initialMessage = getInitialMessage(initialLanguage);
  
  return {
    chatMessages: [
      {
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: initialMessage }],
      },
    ],
    conversationItems: [],
    isAssistantLoading: false,
    assistantMode: 'general',
    language: initialLanguage,
    setChatMessages: (items) => set({ chatMessages: items }),
    setConversationItems: (messages) => set({ conversationItems: messages }),
    addChatMessage: (item) =>
      set((state) => ({ chatMessages: [...state.chatMessages, item] })),
    addConversationItem: (message) =>
      set((state) => ({
        conversationItems: [...state.conversationItems, message],
      })),
    setAssistantLoading: (loading) => set({ isAssistantLoading: loading }),
    setAssistantMode: (mode) => set({ assistantMode: mode }),
    setLanguage: (language) => set({ language }),
    updateInitialMessage: () => {
      const state = get();
      const currentMode = state.assistantMode;
      const currentLanguage = state.language;
      const initialMessage = currentMode === 'cargo' ? CARGO_INITIAL_MESSAGE : getInitialMessage(currentLanguage);
      
      // Update only the first message (initial message)
      set((state) => ({
        chatMessages: state.chatMessages.map((msg, index) => 
          index === 0 && msg.type === 'message' && msg.role === 'assistant'
            ? { ...msg, content: [{ type: "output_text", text: initialMessage }] }
            : msg
        ),
      }));
    },
    initializeLanguage: () => {
      const detectedLanguage = getInitialLanguage();
      const state = get();
      
      // Only update if language is different
      if (state.language !== detectedLanguage) {
        set({ language: detectedLanguage });
        // Update the initial message with the correct language
        const currentMode = state.assistantMode;
        const initialMessage = currentMode === 'cargo' ? CARGO_INITIAL_MESSAGE : getInitialMessage(detectedLanguage);
        
        set((state) => ({
          chatMessages: state.chatMessages.map((msg, index) => 
            index === 0 && msg.type === 'message' && msg.role === 'assistant'
              ? { ...msg, content: [{ type: "output_text", text: initialMessage }] }
              : msg
          ),
        }));
      }
    },
    rawSet: set,
    resetConversation: () => {
      const currentMode = get().assistantMode;
      const currentLanguage = get().language;
      const initialMessage = currentMode === 'cargo' ? CARGO_INITIAL_MESSAGE : getInitialMessage(currentLanguage);
      
      set(() => ({
        chatMessages: [
          {
            type: "message",
            role: "assistant",
            content: [{ type: "output_text", text: initialMessage }],
          },
        ],
        conversationItems: [],
      }));
    },
  };
});

export default useConversationStore;
