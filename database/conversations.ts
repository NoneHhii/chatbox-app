import { Conversation } from "@/types/input";

export const conversations: Conversation[] = [

    {
        conversationId: "C01",
        type: "private",
        createdBy: "U01",
        createdAt: new Date()
    },

    {
        conversationId: "C02",
        type: "private",
        createdBy: "U02",
        createdAt: new Date()
    },

    {
        conversationId: "C03",
        name: "Nhóm học",
        type: "group",
        createdBy: "U01",
        createdAt: new Date()
    }

]