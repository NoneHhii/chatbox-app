import { ConversationMember } from "@/types/input";

export const members: ConversationMember[] = [

    {
        id: "M01",
        conversationId: "C01",
        userId: "U01",
        role: "member",
        joinedAt: new Date()
    },

    {
        id: "M02",
        conversationId: "C01",
        userId: "U02",
        role: "member",
        joinedAt: new Date()
    },

    {
        id: "M03",
        conversationId: "C02",
        userId: "U02",
        role: "member",
        joinedAt: new Date()
    },

    {
        id: "M04",
        conversationId: "C02",
        userId: "U03",
        role: "member",
        joinedAt: new Date()
    },

    {
        id: "M05",
        conversationId: "C03",
        userId: "U01",
        role: "admin",
        joinedAt: new Date()
    },

    {
        id: "M06",
        conversationId: "C03",
        userId: "U02",
        role: "member",
        joinedAt: new Date()
    },

    {
        id: "M07",
        conversationId: "C03",
        userId: "U03",
        role: "member",
        joinedAt: new Date()
    },

    {
        id: "M08",
        conversationId: "C03",
        userId: "U04",
        role: "member",
        joinedAt: new Date()
    }

]