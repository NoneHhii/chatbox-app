import ChatApi from "@/api/chatApi";
import { Message } from "@/app/chat-room";
import useChatStore from "@/redux/store/useChatStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Clipboard, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const CHAT_ACTION = [
    { id: 1, icon: 'arrow-redo-outline', label: "Chuyển tiếp" },
    { id: 2, icon: 'arrow-undo-outline', label: "Trả lời" },
    { id: 3, icon: 'copy-outline', label: "Sao chép" },
    { id: 4, icon: 'reload-outline', label: "Thu hồi" },
    { id: 5, icon: 'trash-outline', label: "Xóa" },
    { id: 6, icon: 'pin-outline', label: "Ghim" },
]

const MessageItem = ({ message, isMyMessage, onReact, deleteForMe, playSound, playingMessageId, friends, handleReply, handlePinnedMsg, handleUnpinnedMsg }: {
    message: Message,
    isMyMessage: boolean,
    onReact: (msgId: string, emoji: string) => void,
    deleteForMe: (msgId: string) => void,
    playSound: (url: string, messageId: string) => void,
    playingMessageId: string,
    friends: any,
    handleReply: (message: Message) => void,
    handlePinnedMsg: (message_id: string, conversation_id: string) => void,
    handleUnpinnedMsg: (message_id: string, conversation_id: string) => void
}) => {
    // console.log(message.file_url);
    const updateLastMessage = useChatStore(s => s.updateLastMessage);
    const [isSelected, setIsSelected] = useState(false);
    const [undoMessage, setUndoMessage] = useState<string | null>(null);
    const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [originalContent, setOriginalContent] = useState("");
    const [forwardModalVisible, setForwardModalVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);

    const handleLongPress = () => {
        setIsSelected(true);
    }

    const copyToClipboard = () => {
        Clipboard.setString(message.content);
        setIsSelected(false);
    }

    const handleReact = async (emoji: string) => {
        onReact(message.message_id, emoji);

        setIsSelected(false);


    }

    const handleRecallMessage = async () => {
        const messageDate = new Date(message.create_at).getTime();
        const now = new Date().getTime();
        const h24 = 24 * 60 * 60 * 100;

        if (now - messageDate > h24) {
            alert("Chỉ có thể thu hồi tin nhắn trong vòng 24h");
            setIsSelected(false);
            return;
        }

        setOriginalContent(message.content);
        message.content = "Tin nhắn đã được thu hồi";
        message.is_recalled = true;

        const timer = setTimeout(() => {
            confirmRecall(message.message_id);
        }, 5000);

        setUndoTimer(timer);
    }

    const confirmRecall = async (message_id: string) => {
        try {
            await ChatApi.recalled_message(message_id);
            setUndoMessage(null);
        } catch (error) {
            console.log("Loi thu hoi tin nhan", error);

        }
    };

    const handleUndo = () => {
        if (undoTimer) clearTimeout(undoTimer);

        message.content = originalContent;
        message.is_recalled = false;

        setUndoMessage(null);
        setUndoTimer(null);
    }

    const handleOpenForward = () => {
        setSelectedMessage(message);
        setForwardModalVisible(true);
    };

    const onForward = async (targetConversationId: string) => {
        // Nếu là text thì truyền content, nếu là file/voice thì truyền URL vào fileList
        const type = message.message_type;
        const content = message.content;

        // Nếu là file/image/voice, ta gửi kèm URL cũ
        const fileList = type !== 'text'
            ? [{
                uri: message.file_url, // Lấy URL từ S3 đã có
                name: 'forwarded_file',
                type: 'forward' // Đánh dấu là hàng chuyển tiếp
            }]
            : [];

        try {
            await ChatApi.sendMessage(targetConversationId, message.content, message.message_type, fileList);
            setForwardModalVisible(false);
            alert("Đã chuyển tiếp!");
        } catch (error) {
            console.error("Lỗi chuyển tiếp:", error);
            alert("Không thể chuyển tiếp tin nhắn");
        }
        setForwardModalVisible(false); // Đóng modal
    };

    // console.log(message.parent_id);


    return (
        <View style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.theirMessage,

        ]}>
            <View style={{ flexDirection: 'row' }}>
                {!isMyMessage && (
                    <Image source={{ uri: message.sender_avatar }} style={styles.avatarChat} />
                )}
                <TouchableOpacity
                    onLongPress={handleLongPress}
                    activeOpacity={0.8}
                    delayLongPress={500}
                    style={[
                        styles.bubble,
                        isMyMessage ? styles.myBubble : styles.theirBubble
                    ]}
                    disabled={message.is_recalled}
                >
                    {!isMyMessage && (
                        <Text style={{ color: '#333' }}>{message.sender_name}</Text>
                    )}
                    {message.is_recalled ? (
                        <Text style={{ color: '#999', fontStyle: 'italic', fontSize: 14 }}>
                            Tin nhắn đã được thu hồi
                        </Text>
                    ) : (
                        <>
                            {message.message_type === 'image' && (
                                <Image source={{ uri: message.file_url || message.attachment?.file_url }} style={styles.imageMsg} resizeMode="cover" />
                            )}
                            {message.message_type === 'file' && (
                                <View style={styles.fileContainer}>
                                    <Ionicons name="document-text" size={30} color={isMyMessage ? "#fff" : "#24786D"} />
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.fileName,
                                                message.is_recalled ? styles.recallMessage : { color: isMyMessage ? "#fff" : "#000" }
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {message.content} {/* Tên file */}
                                        </Text>
                                        <Text style={{ fontSize: 10, color: isMyMessage ? "#ddd" : "#797C7B" }}>
                                            2.4 MB
                                        </Text>
                                    </View>
                                    <Ionicons name="download-outline" size={20} color={isMyMessage ? "#fff" : "#797C7B"} />
                                </View>
                            )}
                            {message.message_type === 'voice' && (
                                <View style={styles.voiceContainer}>
                                    <TouchableOpacity onPress={() => playSound(message.file_url!, message.message_id)}>
                                        <Ionicons
                                            /* Kiểm tra xem ID của tin nhắn này có trùng với ID đang phát không */
                                            name={playingMessageId === message.message_id ? "pause-circle" : "play-circle"}
                                            size={32}
                                            color={playingMessageId === message.message_id ? "red" : "#24786D"}
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.waveformPlaceholder}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                            <View
                                                key={i}
                                                style={[styles.waveBar, { height: Math.random() * 15 + 5 }]}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                            {message.parent_id && (
                                <View style={styles.repliedContainer}>
                                    <Text style={styles.repliedText} numberOfLines={2}>
                                        {/* Khoa có thể cần fetch hoặc tìm tin nhắn gốc dựa trên parent_id */}
                                        {message.reply_to_content || "Tin nhắn đã trả lời"}
                                    </Text>
                                </View>
                            )}
                            <Text style={[{ fontSize: 14 }, isMyMessage ? { color: '#fff' } : { color: '#000E08' }]}>
                                {message.content}
                            </Text>
                            {message.reactions && message.reactions.length > 0 && (
                                <View style={styles.reactionContainer}>
                                    {Array.from(new Set(message.reactions.map(r => r.emoji))).map((emoji, index) => (
                                        <Text key={index} style={styles.reactionEmoji}>{emoji}</Text>

                                    ))}
                                    <Text style={styles.reactionCount}>{message.reactions?.length}</Text>
                                </View>
                            )}
                        </>
                    )}
                </TouchableOpacity>
            </View>
            <Text style={styles.time}>
                {new Date(message.create_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <Modal
                transparent={true}
                visible={isSelected}
                animationType="fade"
                onRequestClose={() => setIsSelected(false)}
            >
                <TouchableWithoutFeedback
                    onPress={() => setIsSelected(false)}
                >
                    <View style={styles.modalOverlay}>

                        <View style={styles.modalContainer}>

                            <View style={[
                                styles.bubble,
                                isMyMessage ? styles.myBubble : styles.theirBubble,
                                { marginBottom: 30, maxWidth: '80%', alignSelf: isMyMessage ? 'flex-end' : 'flex-start', marginRight: isMyMessage ? 12 : 0, marginLeft: !isMyMessage ? 12 : 0 }
                            ]}>
                                {message.message_type === 'image' && (
                                    <Image source={{ uri: message.file_url }} style={styles.imageMsg} />
                                )}
                                {/* <Text style={styles.messageText}>{message.content}</Text> */}
                                <Text style={{ color: isMyMessage ? '#fff' : '#000' }}>
                                    {message.content}
                                </Text>
                            </View>

                            <View style={[styles.reactGrid]}>
                                {['❤️', '😂', '😮', '😢', '👍'].map(emoji => (
                                    <TouchableOpacity key={emoji} onPress={() => handleReact(emoji)}>
                                        <Text style={{ fontSize: 28 }}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>


                            <View style={styles.actionGrid}>
                                {CHAT_ACTION
                                    .filter(item => isMyMessage || item.id !== 4)
                                    .map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.gridItem, { overflow: (!isMyMessage && item.label === "Thu hồi") ? 'hidden' : 'visible' }]}
                                            onPress={() => {
                                                if (item.id === 4) handleRecallMessage();
                                                else if (item.id === 3) copyToClipboard();
                                                else if (item.id === 5) deleteForMe(message.message_id);
                                                else if (item.id === 1) handleOpenForward();
                                                else if (item.id === 2) handleReply(message);
                                                else if (item.id === 6) handlePinnedMsg(message.message_id, message.conversation_id);

                                                setIsSelected(false);
                                            }}
                                        >
                                            <View style={styles.iconCircle}>
                                                <Ionicons name={item.icon as any} size={22} color={'#24786D'} />
                                            </View>
                                            <Text style={styles.actionText}>{item.label}</Text>
                                        </TouchableOpacity>
                                    ))
                                }
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal visible={forwardModalVisible} animationType="slide">
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chuyển tiếp đến...</Text>
                        <TouchableOpacity onPress={() => setForwardModalVisible(false)}>
                            <Ionicons name="close" size={28} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={friends} // Danh sách bạn bè Khoa đã có
                        keyExtractor={(item) => item.conversation_id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.friendItem}
                                onPress={() => onForward(item.conversation_id)}
                            >
                                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                                <Text>{item.name}</Text>
                                <Ionicons name="send-outline" size={20} color="#24786D" />
                            </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </SafeAreaView>
            </Modal>

            {undoMessage && (
                <View style={styles.undoBar}>
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                        <TouchableOpacity onPress={handleUndo}>
                            <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>Khôi phục tin nhắn</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            if (undoTimer) clearTimeout(undoTimer);
                            confirmRecall(undoMessage);
                        }}>
                            <Ionicons name="close" size={20} color='#fff' />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View >
    )
}

const styles = StyleSheet.create({
    messageContainer: {
        paddingHorizontal: 12,
        maxWidth: '80%',
        position: 'relative',
        marginBottom: 14,
    },

    myMessage: {
        alignSelf: 'flex-end'
    },

    theirMessage: {
        alignSelf: 'flex-start',
    },

    recallMessage: {
        color: '#ccc',
    },

    bubble: {
        padding: 12,
        borderRadius: 16,
    },

    myBubble: {
        backgroundColor: '#20A090',
        borderBottomRightRadius: 2,
    },

    theirBubble: {
        backgroundColor: '#F2F7FB',
        borderBottomLeftRadius: 2,
    },

    time: { fontSize: 10, color: '#797C7B', marginTop: 4, alignSelf: 'flex-end' },
    imageMsg: { width: 200, height: 200, borderRadius: 10, marginBottom: 5 },
    singleImage: {
        width: 200,
        height: 150,
        borderRadius: 12,
    },
    fileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        minWidth: 180,
    },
    fileName: {
        fontSize: 13,
        fontWeight: '500',
    },
    voiceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        minWidth: 150, // Đảm bảo đủ rộng để hiện waveform
        backgroundColor: '#E3F2FD', // Màu nền xanh nhạt cho tin nhắn thoại
        borderRadius: 15,
    },

    // Nút Play/Pause
    playButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },

    // Giả lập thanh sóng âm (Waveform)
    waveformPlaceholder: {
        flex: 1,
        height: 20,
        marginHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // Các vạch sóng âm đơn giản
    waveBar: {
        width: 3,
        backgroundColor: '#2196F3',
        borderRadius: 2,
    },

    // Văn bản hiển thị thời gian
    durationText: {
        fontSize: 12,
        color: '#555',
        fontFamily: 'System', // Hoặc font của Khoa
        minWidth: 35,
    },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 200,
        gap: 2,
    },
    quarterImage: {
        width: 98,
        height: 98,
    },
    imageItem: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)', // Làm tối nền
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },

    modalContainer: {
        // Quan trọng: alignSelf giúp View chỉ dài bằng nội dung bên trong
        alignSelf: 'flex-end',
        // Giới hạn chiều rộng tối đa để không chạm mép màn hình
        flex: 1,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        justifyContent: 'flex-end'
    },

    actionGrid: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 24,
        // justifyContent: 'center',
        padding: 16,
    },

    reactGrid: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderRadius: 24,
        padding: 8,
        marginBottom: 20,
        justifyContent: 'space-around',

    },

    btnModal: {
        alignItems: 'center'
    },

    gridItem: {
        width: '25%', // 100% / 4 cột = 25%
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F2F7FB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        textAlign: 'center',
    },

    reactionContainer: {
        position: 'absolute',
        bottom: -10, // Đẩy xuống dưới mép bubble
        right: 10,   // Căn lề phải (hoặc trái tùy tin nhắn của ai)
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        // Đổ bóng nhẹ để nổi bật trên nền bubble
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        alignItems: 'center',
    },
    reactionEmoji: {
        fontSize: 12,
    },
    reactionCount: {
        fontSize: 10,
        color: '#797C7B',
        marginLeft: 2,
        fontWeight: '600',
    },

    undoBar: {
        position: 'absolute',
        bottom: 80, // Nằm trên InputForm
        left: 20,
        right: 20,
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 5,
    },
    avatarChat: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ccc',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ccc',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },

    // Từng dòng bạn bè trong danh sách
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0',
    },

    // Tên bạn bè
    friendName: {
        flex: 1, // Để tên chiếm hết khoảng trống, đẩy nút Send về bên phải
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },

    // Nút Send bên phải mỗi dòng
    sendIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#F3F6F6', // Tạo vòng tròn mờ bao quanh icon gửi
    },

    replyBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#F3F6F6',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    repliedContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 8,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#24786D',
        marginBottom: 4,
    },
    repliedText: {
        fontSize: 12,
        color: '#666',
    }
});

export default MessageItem;