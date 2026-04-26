import ChatApi from "@/api/chatApi"
import { useQuery } from "@tanstack/react-query"

export const useConversation = () => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: () => ChatApi.getConversaion().then(res => res.data),
        staleTime: 1000 * 60 * 5,
    })
}