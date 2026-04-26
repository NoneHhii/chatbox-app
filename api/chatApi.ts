import axiosClient from "./axiosClient";

interface FormDataFile {
    uri: string;
    name: string;
    type: string;
}

const ChatApi = {
    getOrCreateConversation(data: {
        receiverIds: string[];
        name?: string;
        avatar?: string;
        type?: "private" | "group";
        converId?: string;
    }) {
        return axiosClient.post(
            "/api/conversations/merge",
            data
        );
    },

    getConversaion() {
        const url = "/api/conversations";
        return axiosClient.get(url);
    },

    getMessage(convId: string, cursor: string | null, limit: Number) {
        let url = `/api/messages/${convId}`

        return axiosClient.get(url, {
            params: {
                limit: limit,
                cursor: cursor
            }
        });

    },

    sendMessage(conversation_id: string, content: string, message_type: string, files?: any[], parentId?: string) {
        const url = "/api/messages/send";
        const formData = new FormData();
        formData.append('conversation_id', conversation_id);
        formData.append('content', content);
        formData.append('message_type', message_type);
        if (parentId) {
            formData.append('parent_id', parentId); // Thêm dòng này
        }

        if (files && files.length > 0) {
            files.forEach(file => {
                if (file.uri && file.uri.startsWith('http')) {
                    // TRƯỜNG HỢP CHUYỂN TIẾP: file.uri là link S3 (http...)
                    // Ta append vào key 'fileUrls' thay vì 'files'
                    formData.append('fileUrls', file.uri);
                } else {
                    // TRƯỜNG HỢP GỬI MỚI: file.uri là đường dẫn trong máy (file://...)
                    formData.append('files', {
                        uri: file.uri,
                        name: file.fileName || file.originalName || 'upload.jpg',
                        type: file.mimetype || 'image/jpeg',
                    } as any);
                }
            });
        }

        return axiosClient.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    recalled_message(message_id: string) {
        const url = '/api/messages/recall';

        const payload = {
            message_id
        };

        return axiosClient.post(url, payload);
    },

    deleted_message(message_id: string) {
        const url = '/api/messages/delete';

        const payload = {
            message_id
        };

        return axiosClient.post(url, payload);
    },

    sendVoiceMessage(uri: string, conversation_id: string) {
        const formData = new FormData();
        formData.append('files', ({
            uri: uri,
            type: 'audio/m4a',
            name: 'voice_message.m4a',
        } as unknown) as Blob);
        formData.append('conversation_id', conversation_id);
        formData.append('message_type', 'voice');

        return axiosClient.post('/api/messages/send', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    pinMessage(conversation_id: string, message_id: string) {
        const url = '/api/messages/pin';

        const payload = {
            conversation_id,
            message_id,
        };

        return axiosClient.post(url, payload);
    },

    unpinMessage(conversation_id: string, message_id: string) {
        const url = '/api/messages/unpin';
        const payload = {
            conversation_id,
            message_id,
        };

        return axiosClient.post(url, payload);
    },

    updateGroupInfo(data: {
        formData: FormData
    }) {
        return axiosClient.put(
            "/api/conversations/group/info",
            data.formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    },

    addMember(data: { conversationId: string, userId: string }) {
        return axiosClient.post(
            `/api/conversations/${data.conversationId}/add-members`, // Phải khớp 100% với Route Backend
            { userId: data.userId }
        );
    },

    // 3. Kick thành viên hoặc Rời nhóm
    removeMember(data: {
        conversationId: string,
        targetUserId: string
    }) {
        return axiosClient.delete(
            "/api/conversations/group/remove-member",
            { data: { conversation_id: data.conversationId, targetUserId: data.targetUserId } }
        );
    },

    getMembers(id: string) {
        return axiosClient.get(`/api/conversations/${id}/members`);
    },

    // Chỉ định Admin mới
    setAdmin(data: { conversationId: string, targetUserId: string }) {
        return axiosClient.put(
            "/api/conversations/group/set-admin",
            { conversation_id: data.conversationId, targetUserId: data.targetUserId }
        );
    },


}

export default ChatApi;


// useEffect(() => {
//     // 1. Nếu bị kick, văng ra ngoài màn hình chính ngay
//     socket.on("you_are_kicked", (data) => {
//         if (data.conversation_id === currentId) {
//             alert("Bạn đã bị mời ra khỏi nhóm này!");
//             router.replace("/(tabs)"); // Đẩy về trang chủ
//         }
//     });

//     // 2. Cập nhật tên nhóm nếu có thay đổi
//     socket.on("group_updated", (data) => {
//         if (data.conversation_id === currentId) {
//             // Cập nhật lại state partnerName trên Header
//             setPartnerName(data.name);
//         }
//     });

//     return () => {
//         socket.off("you_are_kicked");
//         socket.off("group_updated");
//     };
// }, [currentId]);