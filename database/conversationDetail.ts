import { ConversationDetail } from "@/types/input";
import { conversations } from "./conversations";
import { messages } from "./messages";
import { users } from "./users";

export const conversationDetails: ConversationDetail[] = [

    {
        conversation: conversations[0],
        members: [users[0], users[1]],
        lastMessage: messages[1]
    },

    {
        conversation: conversations[2],
        members: [
            users[0],
            users[1],
            users[2],
            users[3]
        ],
        lastMessage: messages[3],
        nameGroup: 'DEV mobile'
    }

]