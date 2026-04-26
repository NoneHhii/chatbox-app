import friendApi from "@/api/friendApi";
import { UserPropComponent } from "@/app/(tabs)";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
const defaultAvatar = require('../assets/images/avatar-default.png');
{/* <FontAwesome5 name="user-times" size={24} color="black" /> */ }

interface UserProp {
    user: UserPropComponent,
    message?: string,
}

const RequestComponent: React.FC<UserProp> = ({ user, message }) => {
    const [requesting, setRequesting] = useState(false);
    const [sent, setSent] = useState(true);
    const queryClient = useQueryClient();

    const { mutate: handleAccept, isPending: isAccepting } = useMutation({
        mutationFn: (id: String) => friendApi.acceptRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
            queryClient.invalidateQueries({ queryKey: ['friendsList'] });
        },
        onError: (error) => {
            console.error("Lỗi chấp nhận kết bạn:", error);
        }
    });

    const { mutate: handleReject, isPending: isRejecting } = useMutation({
        mutationFn: (id: String) => friendApi.rejectRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
        },
        onError: (error) => {
            console.error("Lỗi chấp nhận kết bạn:", error);
        }
    });

    const isProcessing = isAccepting || isRejecting;

    return (
        <View style={styles.container}>
            <Image source={user?.avatar ? { uri: user.avatar } : defaultAvatar} style={styles.avatar} resizeMode="cover" />
            <View style={styles.inforContainer}>
                <Text style={styles.nameText}>{user.username} đã gửi lời mời kết bạn</Text>
                <View style={styles.btnGroup}>
                    <TouchableOpacity
                        style={styles.btnReject}
                        disabled={isProcessing}
                        onPress={() => handleReject(user.friend_id)}
                    >
                        <Text style={{ fontWeight: '600' }}>Từ chối</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnAccept}
                        disabled={isProcessing}
                        onPress={() => handleAccept(user.friend_id)}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Đồng ý</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        // width: "100%",
        alignItems: 'center',
    },

    avatar: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#ccc'
    },

    inforContainer: {
        flex: 1,
        marginLeft: 15,
        gap: 4
    },

    nameText: {
        fontWeight: 600,
        fontSize: 16,
        color: " #333"
    },

    btnGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,

    },

    btnAccept: {
        backgroundColor: '#4169E1',
        color: '#fff',
        padding: 8,
        borderRadius: 16,
        flex: 1,
        alignItems: 'center'
    },

    btnReject: {
        backgroundColor: '#00FFFF',
        padding: 8,
        borderRadius: 16,
        flex: 1,
        alignItems: 'center'
    },
});

export default RequestComponent;