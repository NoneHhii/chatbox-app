import { ConversationProp } from "@/app/(tabs)";
import { format, formatDistanceToNow, isToday } from "date-fns";
import { vi } from 'date-fns/locale';
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { avatarDefault } from '../assets/images/avatar-default.png';

interface StartChatParams {
    name: string;
    avatar: string;
    friend_id?: string;
    conversation_id?: string;
}

interface props {
    conversation: ConversationProp,
    isMe: boolean,
    handleStartChat: (params: StartChatParams) => void,
}

const ConversationItem = ({ conversation, handleStartChat, isMe }: props) => {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1); // Cứ mỗi 1 phút tăng tick để hàm renderTime chạy lại
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Hàm render thời gian an toàn tránh lỗi Metro Resolve
    const renderTime = (time: string | Date) => {
        try {
            if (!time) return "";
            const date = new Date(time);

            // Nếu là trong ngày hôm nay thì hiện "X phút trước"
            if (isToday(date)) {
                return formatDistanceToNow(date, {
                    addSuffix: true,
                    locale: vi
                }).replace('khoảng ', ''); // Bỏ bớt chữ "khoảng" cho ngắn gọn
            }

            // Nếu đã qua ngày hôm sau thì hiện "Ngày/Tháng"
            return format(date, 'dd/MM', { locale: vi });
        } catch (e) {
            return "Vừa xong";
        }
    };
    // console.log("item: ", conversation?.avatar);


    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                console.log("press: ", conversation.conversation_id);

                handleStartChat({
                    name: conversation.name,
                    avatar: conversation.avatar,
                    friend_id: conversation.friend_id || conversation.last_sender_id,
                    conversation_id: conversation.conversation_id
                })
            }}
        >
            <View style={[styles.avatarBorder, { marginRight: 12 }]}>
                <Image
                    source={conversation.avatar ? { uri: conversation.avatar } : avatarDefault}
                    style={styles.avatar}
                    resizeMode="cover"
                />
            </View>

            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '600' }}>
                    {conversation.name}
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 14, color: '#797C7B' }}>
                    {isMe ? "Bạn: " : (conversation.last_sender_id && conversation.last_sender_name + ": ")}{conversation.last_message}
                </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, color: '#797C7B' }}>
                    {renderTime(conversation.last_time_message)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10
    },

    avatar: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#ccc'
    },

    avatarBorder: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    },
})

export default ConversationItem;