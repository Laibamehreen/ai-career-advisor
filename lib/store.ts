import { create } from "zustand";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatStore {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substring(7),
          createdAt: new Date(),
        },
      ],
    })),
  setMessages: (messages) => set({ messages }),
  clearChat: () => set({ messages: [] }),
}));

interface CareerStore {
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
}

export const useCareerStore = create<CareerStore>((set) => ({
  searchQuery: "",
  selectedCategory: "All",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
