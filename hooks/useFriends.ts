import friendApi from "@/api/friendApi"
import { useQuery } from "@tanstack/react-query"

export const useFriend = () => {
    return useQuery({
        queryKey: ['friendRequests'],
        queryFn: () => friendApi.getRequests().then(res => res.data),
        staleTime: 1000 * 60 * 5,
    })
}

export const useMyFriend = () => {
    return useQuery({
        queryKey: ['friends'],
        queryFn: () => friendApi.getFriends().then(res => res.data),
        staleTime: 1000 * 60 * 5,
    })
}