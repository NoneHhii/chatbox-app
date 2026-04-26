import { User } from "@/types/input";
import axiosClient from "./axiosClient"

const friendApi = {
    sendRequest(receiverId: String) {
        const url = "/api/friends/request";
        const payload = {
            receiverId
        }

        return axiosClient.post(url, payload);
    },

    getRequests() {
        const url = "/api/friends/request";
        return axiosClient.get(url)
    },

    getFriends() {
        const url = "/api/friends";
        return axiosClient.get(url);
    },

    acceptRequest(requestId: String) {
        return axiosClient.post(`/api/friends/accept/${requestId}`);
    },

    rejectRequest(requestId: String) {
        return axiosClient.post(`/api/friends/${requestId}`);
    }
}

export default friendApi;