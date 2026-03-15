import { FriendRequest } from "@/types/input";

export const friendRequests: FriendRequest[] = [

    {
        requestId: "R01",
        senderId: "U01",
        receiverId: "U04",
        status: "pending",
        createdAt: new Date()
    },

    {
        requestId: "R02",
        senderId: "U05",
        receiverId: "U01",
        status: "pending",
        createdAt: new Date()
    },

    {
        requestId: "R03",
        senderId: "U10",
        receiverId: "U07",
        status: "rejected",
        createdAt: new Date()
    }

]