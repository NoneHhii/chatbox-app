import { Message } from "@/types/input";

export const messages: Message[] = [

    {
        messageId: "MSG01",
        conversationId: "C01",
        senderId: "U01",
        content: "Hello Nam",
        messageType: "text",
        createdAt: new Date(),
        isDeleted: false
    },

    {
        messageId: "MSG02",
        conversationId: "C01",
        senderId: "U02",
        content: "Hi Khoa",
        messageType: "text",
        createdAt: new Date(),
        isDeleted: false
    },

    {
        messageId: "MSG03",
        conversationId: "C03",
        senderId: "U01",
        content: "Chào mọi người",
        messageType: "text",
        createdAt: new Date(),
        isDeleted: false
    },

    {
        messageId: "MSG04",
        conversationId: "C03",
        senderId: "U03",
        content: "OK",
        messageType: "text",
        createdAt: new Date(),
        isDeleted: false
    }

]