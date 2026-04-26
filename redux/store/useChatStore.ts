import { ConversationProp } from '@/app/(tabs)';
import { create } from 'zustand';

interface ChatState {
    conversations: ConversationProp[];
    setConversations: (list: ConversationProp[]) => void;
    addConversation: (conv: ConversationProp) => void;
    updateLastMessage: (convId: string, message: string, senderName?: string) => void;
    getConversationById: (id: string) => ConversationProp | undefined;
    updateConversationInfo: (convId: string, data: { name?: string, avatar?: string }) => void;
    // Xóa hội thoại khỏi danh sách (Dùng khi rời nhóm hoặc bị kick)
    removeConversation: (convId: string) => void;
}

const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],

    setConversations: (list: ConversationProp[]) => set({ conversations: list }),
    addConversation: (conv) => set((state) => ({
        conversations: [conv, ...state.conversations]
    })),
    updateLastMessage: (convId, message) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.conversation_id === convId
                    ? { ...c, last_message: message, last_time_message: new Date().toISOString() }
                    : c
            ),
        })),
    getConversationById: (id: string) => {
        return get().conversations.find((c: ConversationProp) => c.conversation_id === id);
    },

    updateConversationInfo: (convId, data) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.conversation_id === convId
                    ? { ...c, name: data.name ?? c.name, avatar: data.avatar ?? c.avatar }
                    : c
            ),
        })),

    removeConversation: (convId) =>
        set((state) => ({
            conversations: state.conversations.filter((c) => c.conversation_id !== convId),
        })),
}))

export default useChatStore;