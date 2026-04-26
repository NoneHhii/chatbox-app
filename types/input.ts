export interface User {
    user_id: string;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    password?: string;
    is_online: boolean;
    created_at: Date;
}

export interface Friend {
    friendId: string;
    userId: string;
    friendUserId: string;
    status: "pending" | "accepted" | "blocked";
    createdAt: Date;
}

export interface FriendRequest {
    friend_id: string;
    sender_id: string;
    receiver_id: string;
    status: "pending" | "accepted" | "rejected";
    created_at: Date;
}

export interface Conversation {
    conversation_id: string;
    name?: string;
    type: "private" | "group";
    create_by: string;
    create_at: Date;
    avatar: string
}

export interface ConversationMember {
    id: string;
    conversationId: string;
    userId: string;
    role: "admin" | "member";
    joinedAt: Date;
}

export interface Message2 {
    messageId: string;
    conversationId: string;
    senderId: string;
    content: string;
    messageType: "text" | "image" | "video" | "file";
    createdAt: Date;
    isDeleted: boolean;
}

export interface Attachment {
    attachmentId: string;
    messageId: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}

export interface Call {
    callId: string;
    conversationId: string;
    callerId: string;
    callType: "voice" | "video";
    startTime: Date;
    endTime?: Date;
    status: "missed" | "completed" | "rejected";
}

export interface ConversationDetail {

    conversation: Conversation;

    members: User[];

    lastMessage: Message2;

    nameGroup?: string,
}

export interface MessageView {

    messageId: string;

    senderName: string;

    avatar: string;

    content: string;

    time: Date;

}