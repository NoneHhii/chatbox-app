import { Call } from "@/types/input";

export const calls: Call[] = [

    {
        callId: "CALL01",
        conversationId: "C01",
        callerId: "U01",
        callType: "voice",
        startTime: new Date(),
        endTime: new Date(),
        status: "completed"
    },

    {
        callId: "CALL02",
        conversationId: "C03",
        callerId: "U02",
        callType: "video",
        startTime: new Date(),
        status: "missed"
    }

]