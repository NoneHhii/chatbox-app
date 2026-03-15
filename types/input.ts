export interface User {
    userId: string;
    username: string;
    email: string;
    phone: string;
    avatar?: string;
    statusMessage?: string;
    isOnline: boolean;
    lastSeen: Date;
    createdAt: Date;
}

export interface Friend {
    friendId: string;
    userId: string;
    friendUserId: string;
    status: "pending" | "accepted" | "blocked";
    createdAt: Date;
}

export interface FriendRequest {
    requestId: string;
    senderId: string;
    receiverId: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
}

export interface Conversation {
    conversationId: string;
    name?: string;
    type: "private" | "group";
    createdBy: string;
    createdAt: Date;
}

export interface ConversationMember {
    id: string;
    conversationId: string;
    userId: string;
    role: "admin" | "member";
    joinedAt: Date;
}

export interface Message {
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

    lastMessage: Message;

    nameGroup?: string,
}

export interface MessageView {

    messageId: string;

    senderName: string;

    avatar: string;

    content: string;

    time: Date;

}