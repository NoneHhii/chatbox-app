import ChatApi from "@/api/chatApi";
import MessageItem from "@/components/messageItem";
import { useConversation } from "@/hooks/useChat";
import { useMyFriend } from "@/hooks/useFriends";
import { useAppSelector } from "@/redux/hooks";
import useChatStore from "@/redux/store/useChatStore";
import { socket } from "@/socket/config";
import { User } from "@/types/input";
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, Keyboard, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
// import { mediaDevices } from "react-native-webrtc";
import { avatarDefault } from '../assets/images/avatar-default.png';


export interface Message {
    message_id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'file' | 'voice';
    create_at: string;
    file_url?: string,
    file_size?: string,
    attachment?: {
        file_url: string
    },
    reactions?: Reaction[],
    is_recalled?: boolean,
    id_delete?: boolean,
    parent_id?: string,
    reply_to_content?: string,
    sender_name?: string,
    sender_avatar?: string,
}

export interface Reaction {
    user_id: string,
    emoji: string,
}

const ChatRoom = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
    const getConversation = useChatStore(s => s.getConversationById);
    const [isPress, setIsPress] = useState(false);
    const [content, setContent] = useState("");
    const user: User | null = useAppSelector(state => state.auth.user);
    const [messages, setMessages] = useState<Message[]>([]);
    const updateLastMessage = useChatStore(s => s.updateLastMessage);
    const [cursor, setCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [recordingN, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const isCreatingRecording = useRef(false);
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
    const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
    const flatListRef = useRef<FlatList>(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [groupMembers, setGroupMembers] = useState<any[]>([]);
    const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
    const [friendsToInvite, setFriendsToInvite] = useState<any[]>([]);
    const [loadingAdd, setLoadingAdd] = useState<string | null>(null);


    // const { data: friends, isLoading } = useMyFriend();
    const { data: conversations, isLoading: loadingConver } = useConversation();
    const conversation = getConversation(id);
    // console.log(conversation);
    const [newGroupName, setNewGroupName] = useState(conversation?.name || "");
    const { updateConversationInfo, removeConversation, addConversation } = useChatStore();
    const { data: myFriends } = useMyFriend();

    useEffect(() => {
        if (!id) return;

        // console.log("Mobile đang xin vào phòng:", id);

        socket.emit("join_conversation", id);

        const handleNewMessage = (newMessage: any) => {
            if (String(newMessage.conversation_id) === String(id)) {
                setMessages(prev => {
                    // Kiểm tra xem tin nhắn này đã có trong danh sách chưa (tránh trùng)
                    const isExist = prev.some(msg => msg.message_id === newMessage.message_id);
                    if (isExist) return prev;

                    // Nếu là tin nhắn của CHÍNH MÌNH (vừa gửi xong), hãy tìm và thay thế cái "temp_"
                    // Hoặc đơn giản là lọc bỏ cái temp có nội dung tương tự
                    const filtered = prev.filter(msg =>
                        msg.message_id !== newMessage.message_id &&
                        !(msg.message_id.startsWith("temp_") && msg.content === newMessage.content)
                    );

                    return [newMessage, ...filtered];
                });
                updateLastMessage(id, newMessage.content);
            }
        };

        const handleBatch = (newMessages: Message[]) => {
            setMessages(prev => {
                const incomingIds = new Set(newMessages.map(m => m.message_id));
                const filtered = prev.filter(msg => !incomingIds.has(msg.message_id) && !msg.message_id.startsWith("temp_"));
                return [...newMessages, ...prev]
            });

            updateLastMessage(
                id,
                newMessages[0]?.message_type === "image"
                    ? "[Hình ảnh]"
                    : "[Tệp đính kèm]"
            );
        };

        const handlePinned = (newPinnedMsg: any) => {
            setPinnedMessages(prev => {
                const isExist = prev.some(m => m.message_id === newPinnedMsg.pinnedData.message_id);
                return isExist ? prev : [newPinnedMsg.pinnedData, ...prev];
            })
        }

        const handleUnpinned = ({ message_id }: { message_id: string }) => {
            setPinnedMessages(prev => prev.filter(m => m.message_id !== message_id));
        }

        socket.on("new_messages_batch", handleBatch);

        socket.on("new_message", handleNewMessage);

        socket.on("pinned_message", handlePinned);

        socket.on("unpinned_message", handleUnpinned);

        socket.on("group_updated", (data) => {
            // Cập nhật lại thông tin nhóm trong danh sách hội thoại
            updateConversationInfo(data.conversation_id, {
                name: data.name,
                avatar: data.avatar
            });

            // Nếu đang ở trong chính phòng chat đó, cập nhật tiêu đề Header
            // if (currentId === data.conversation_id) {
            //     setPartnerName(data.name);
            // }
        });

        // 2. Lắng nghe khi bị Kick (Dành cho người bị kick)
        socket.on("you_are_kicked", (data) => {
            if (id === data.conversation_id) {
                alert("Bạn không còn là thành viên của nhóm này");
                router.replace("/(tabs)");
            }
            // Xóa hội thoại này khỏi danh sách chat của người bị kick
            removeConversation(data.conversation_id);
        });

        // 3. Lắng nghe khi có người được thêm vào nhóm (Dành cho người mới)
        socket.on("added_to_group", (groupData) => {
            // Tự động thêm nhóm mới vào danh sách hội thoại mà không cần load lại
            addConversation(groupData);
        });

        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("new_messages_batch", handleBatch);
            socket.off("pinned_essage", handlePinned);
            socket.off("unpinned_message", handleUnpinned);
            socket.off("added_to_group");
            socket.off("group_updated");
            socket.off("you_are_kicked");
            socket.emit("leave_conversation", id);
        };
    }, [id]);

    const loadMessages = async (currentCursor: string | null = null) => {
        if (loadingMore || (!hasMore && currentCursor !== null)) return;

        setLoadingMore(true);

        try {
            const res = await ChatApi.getMessage(id, currentCursor, 20);
            const newMsgs = res.data.messages;

            if (currentCursor === null) setMessages(newMsgs);
            else setMessages(prev => [...prev, ...newMsgs]);

            setCursor(res.data.nextCursor);

            if (newMsgs.length < 20) setHasMore(false);
        } catch (error) {
            console.error("Lỗi load tin nhắn", error);

        } finally {
            setLoadingMore(false);
        }
    }

    useEffect(() => {
        setHasMore(true);
        setCursor(null);
        loadMessages(null);
    }, [id]);

    useEffect(() => {
        return () => {
            if (sound) sound.unloadAsync().catch(() => { });
            console.log(replyingMessage);
        };
    }, []);

    const handleSend = async (type: 'text' | 'image' | 'file' | 'voice', fileList: any[] = []) => {
        if (!content.trim() && fileList.length === 0) return;
        const parentId = replyingMessage?.message_id;

        const currentContent = content;
        setReplyingMessage(null);
        setContent("");
        setIsPress(false);

        if (!user) return;
        const tempMsg: Message = {
            message_id: "temp_" + Date.now(),
            conversation_id: id,
            sender_id: user.user_id,
            content:
                type === "text"
                    ? currentContent
                    : type === "image"
                        ? "[Đang gửi ảnh...]"
                        : type === "voice" ? "[Tin nhắn thoại]"
                            : "[Đang gửi file...]",
            message_type: type,
            create_at: new Date().toISOString(),
            file_url: "",
            file_size: "",
            attachment: {
                file_url: ""
            },
            parent_id: parentId,
        };

        setMessages(prev => [tempMsg, ...prev]);

        try {
            await ChatApi.sendMessage(id, currentContent, type, fileList, parentId);
            setReplyingMessage(null);
        } catch (error) {
            alert("Gửi tin nhắn thất bại");
            console.log(error);

        }
    }

    const handleInput = (text: string) => {

        setContent(text);
        if (text.trim().length > 0) setIsPress(true);
        else setIsPress(false);
    }

    const renderMessage = ({ item }: { item: Message }) => {
        return (
            <MessageItem
                message={item}
                isMyMessage={item.sender_id === user?.user_id}
                onReact={handleReact}
                deleteForMe={handleDeleteForMe}
                playSound={playSound}
                playingMessageId={playingMessageId!}
                friends={conversations}
                handleReply={handleReply}
                handlePinnedMsg={handlePinnedMsg}
                handleUnpinnedMsg={handleUnpinnedMsg}
            />
        )
    }

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Cho phép truy cập quyền truy cập hình ảnh");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const selectedFiles = result.assets.map(asset => ({
                uri: asset.uri,
                fileName: asset.fileName || `image_${Date.now()}.jpg`,
                mimeType: asset.mimeType || "image/jpeg"
            }));

            handleSend("image", selectedFiles);
        }
    }

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            multiple: true,
        });

        if (!result.canceled) {
            const selectedFiles = result.assets?.map(asset => ({
                uri: asset.uri,
                fileName: asset.name,
                mimeType: asset.mimeType
            }));

            handleSend("file", selectedFiles);
        };


    }

    const handleReact = (messageId: string, emoji: string) => {
        if (!user?.user_id) return;

        setMessages(prev => prev.map(msg => {
            if (msg.message_id === messageId) {
                const exist = msg.reactions?.find(r => r.user_id = user?.user_id);

                let newReact = msg.reactions || [];
                if (exist?.emoji === emoji) {
                    newReact = newReact.filter(r => r.user_id !== user?.user_id);
                } else {
                    newReact = [
                        ...newReact.filter(r => r.user_id !== user?.user_id),
                        { user_id: user?.user_id, emoji }
                    ];
                }

                return { ...msg, reactions: newReact };
            }

            return msg;
        }));
    };

    // console.log(messages.map(m => m.content));

    const handleDeleteForMe = async (message_id: string) => {
        try {
            await ChatApi.deleted_message(message_id);

            setMessages(prev => prev.filter(m => m.message_id !== message_id));


        } catch (error) {
            console.error("Lỗi xóa tin nhắn: ", error);

        }
    }

    const startRecording = async () => {
        if (isCreatingRecording.current) return;
        isCreatingRecording.current = true;
        try {
            if (recordingN) {
                console.log("Đang giải phóng recording cũ...");
                await recordingN.stopAndUnloadAsync().catch(() => { });
                setRecording(null);
            }
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                alert("Bạn cần cho phép quyền truy cập micro");
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);
            console.log('Recording started');

        } catch (error) {
            console.error('Failed to start recording', error);

        };
    };

    const stopRecording = async () => {
        if (!recordingN) return;

        try {
            setIsRecording(false);

            const status = await recordingN.getStatusAsync();
            if (status.canRecord) {
                await recordingN.stopAndUnloadAsync();
                const uri = recordingN.getURI();
                setRecording(null);

                if (uri) {
                    console.log('Recording stopped and stored at', uri);
                    handleSendVoice(uri)
                }
            } else {
                console.log("Recording đã bị unload trước đó rồi");
                setRecording(null);

            }
        } catch (error) {
            console.error("Failed to stop recording", error);

        }
    }

    const playSound = async (url: string, messageId: string) => {
        try {
            // 1. Nếu đang phát chính tin nhắn này -> Bấm vào là Dừng
            if (sound && playingMessageId === messageId) {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
                setPlayingMessageId(null); // Reset về null để hiện icon Play
                return;
            }

            // 2. Nếu đang phát tin nhắn khác -> Dừng cái cũ trước khi phát cái mới
            if (sound) {
                await sound.unloadAsync();
                setPlayingMessageId(null);
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true }
            );

            setSound(newSound);
            setPlayingMessageId(messageId); // Đặt ID đang phát để hiện icon Pause

            // 3. Khi hát xong (Finish) -> Tự động đổi về icon Play
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingMessageId(null); // Hát xong thì không còn ID nào đang phát
                    newSound.unloadAsync();
                }
            });

        } catch (error) {
            console.error("Lỗi phát âm thanh:", error);
            setPlayingMessageId(null);
        }
    };

    const handleSendVoice = async (uri: string) => {
        const fileName = `voice_${Date.now()}.m4a`;
        const fileData = {
            uri: uri,
            fileName: fileName,
            mimeType: 'audio/m4a',
        };

        try {
            const res = await ChatApi.sendVoiceMessage(uri, id);
            const newMsg = res.data[0];
            setMessages(prev => [newMsg, ...prev]);
        } catch (error) {
            console.log("Lỗi gửi voice", error);

        }
    }

    const handleReply = (message: Message) => {
        setReplyingMessage(message);


        setIsVoiceMode(false);
        Keyboard.isVisible();
    };

    const scrollToPinnedMessage = () => {
        const index = messages.findIndex(m => m.message_id === pinnedMessages[0].message_id);
        if (index !== -1) flatListRef.current?.scrollToIndex({ index, animated: true });
    }

    const handlePinnedMsg = async (message_id: string, conversation_id: string) => {
        try {
            if (pinnedMessages.length > 3) {
                alert("Chỉ pin được 3 cái");
                return;
            }
            await ChatApi.pinMessage(conversation_id, message_id);
        } catch (error) {
            console.error("Pinned failure:", error);

        }
    }

    const handleUnpinnedMsg = async (message_id: string, conversation_id: string) => {
        try {
            await ChatApi.unpinMessage(conversation_id, message_id);
        } catch (error) {
            console.error("Pinned failure:", error);

        }
    }

    const pickGroupImage = async () => {
        // 1. Xin quyền truy cập thư viện ảnh
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Khoa cần cấp quyền truy cập ảnh để đổi avatar nhóm nhé!");
            return;
        }

        // 2. Mở thư viện chọn ảnh
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // Cho phép cắt ảnh
            aspect: [1, 1],      // Cắt theo tỉ lệ vuông cho đẹp
            quality: 1,
        });

        // 3. Nếu chọn xong và không hủy, tiến hành update
        if (!result.canceled) {
            const selectedImageUri = result.assets[0].uri;
            // Gọi hàm update của Khoa, truyền tên cũ và URI ảnh mới
            await onUpdateGroup(conversation?.name || "Nhóm mới", selectedImageUri);
        }
    };

    const onUpdateGroup = async (newName: string, imageUri?: string) => {
        const formData = new FormData();
        formData.append('conversation_id', id); // ID nhóm hiện tại
        formData.append('name', newName);

        if (imageUri) {
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('avatar', {
                uri: imageUri,
                name: filename,
                type,
            } as any);
        }

        try {
            const res = await ChatApi.updateGroupInfo({ formData });
            // Không cần setLocal state vì Socket bên dưới sẽ lo việc đó cho tất cả mọi người
            alert("Cập nhật thông tin nhóm thành công!");
        } catch (error) {
            alert("Lỗi khi cập nhật nhóm");
            console.log(error);

        }
    };

    const handleRemoveMember = async (targetId: string, isSelf: boolean) => {
        try {
            await ChatApi.removeMember({
                conversationId: id,
                targetUserId: targetId
            });

            if (isSelf) {
                alert("Bạn đã rời khỏi nhóm");
                router.replace("/(tabs)"); // Rời nhóm thì về trang chủ
            } else {
                alert("Đã mời thành viên ra khỏi nhóm");
            }
        } catch (error) {
            alert("Lỗi khi thực hiện thao tác");
        }
    };

    const handleAddMember = async (friendId: string) => {
        try {
            await ChatApi.addMember({
                conversationId: id,
                userId: friendId
            });
            // Sau khi add thành công, gọi lại getMembers để cập nhật list UI
            fetchMembers();
            alert("Đã thêm thành viên vào nhóm");
        } catch (error) {
            alert("Lỗi khi thêm thành viên" + error);
            console.log(error);

        }
    };

    // 2. Hàm lấy danh sách thành viên (Dùng khi mở Menu)
    const fetchMembers = async () => {
        try {
            const res = await ChatApi.getMembers(id);
            setGroupMembers(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách thành viên:", error);
        }
    };

    // 3. Hàm chỉ định Admin (Chỉ Admin hiện tại mới gọi được)
    const handleSetAdmin = async (targetId: string) => {
        try {
            await ChatApi.setAdmin({
                conversationId: id,
                targetUserId: targetId
            });
            fetchMembers(); // Load lại để cập nhật Badge "Trưởng nhóm"
            alert("Đã thay đổi quyền quản trị");
        } catch (error) {
            alert("Không thể thay đổi quyền");
        }
    };

    const openGroupMenu = async () => {
        setIsMenuVisible(true);
        try {
            const res = await ChatApi.getMembers(id); // Giả sử Khoa đã thêm route getMembers vào ChatApi
            setGroupMembers(res.data);
        } catch (error) {
            console.error("Lỗi lấy thành viên:", error);
        }
    };

    const openAddMemberModal = () => {
        // Lọc: Chỉ hiện những người bạn CHƯA có trong groupMembers
        const currentMemberIds = groupMembers.map(m => m.user_id);
        const filtered = (myFriends || []).filter((f: any) => !currentMemberIds.includes(f.user_id));

        setFriendsToInvite(filtered);
        setIsAddMemberModalVisible(true);
    };

    const handleInviteFriend = async (friendId: string) => {
        try {
            await ChatApi.addMember({
                conversationId: id,
                userId: friendId
            });

            // Cập nhật lại UI sau khi add thành công
            setIsAddMemberModalVisible(false);
            fetchMembers(); // Load lại danh sách thành viên nhóm
            alert("Đã thêm thành viên vào nhóm!");
        } catch (error) {
            alert("Lỗi khi thêm thành viên");
            console.log(error);

        }
    };

    // const startCall = async (isVideo: boolean) => {
    //     try {
    //         // 1. Lấy Stream từ máy mình
    //         const stream = await mediaDevices.getUserMedia({
    //             audio: true,
    //             video: isVideo ? { facingMode: 'user' } : false,
    //         });

    //         // 2. Chuyển sang màn hình cuộc gọi và truyền dữ liệu đi
    //         router.push({
    //             pathname: "/call-screen",
    //             params: {
    //                 id: id,
    //                 targetUserId: id, // ID người nhận từ chat-room
    //                 userName: conversation?.name,
    //                 userAvatar: conversation?.avatar,
    //                 isVideo: isVideo ? "true" : "false",
    //                 mode: "outgoing" // Mình là người gọi
    //             }
    //         });
    //     } catch (err) {
    //         alert("Không thể truy cập Camera/Mic");
    //     }
    // };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.headerChat}>
                    <Ionicons name="arrow-back" size={24} color="black" onPress={() => router.back()} />
                    <TouchableOpacity
                        style={[styles.box, { flex: 1, marginLeft: 8, }]}
                        onPress={openGroupMenu}
                    >
                        <Image source={conversation?.avatar ? { uri: conversation.avatar } : avatarDefault} style={styles.avatar} resizeMode="cover" />
                        <View>
                            <Text>{conversation?.name}</Text>
                            <Text style={styles.subText}>Chạm để xem thông tin</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={[styles.box]}>
                        {/* <TouchableOpacity onPress={() => startCall(false)}> */}
                        <Ionicons name="call-outline" size={24} color="black" />
                        {/* </TouchableOpacity> */}

                        {/* Nút Gọi Video */}
                        {/* <TouchableOpacity onPress={() => startCall(true)}> */}
                        <Ionicons name="videocam-outline" size={24} color="black" />
                        {/* </TouchableOpacity> */}
                    </View>
                </View>
                {pinnedMessages.length > 0 && (
                    <TouchableOpacity
                        style={styles.pinnedBar}
                        onPress={() => scrollToPinnedMessage()}
                    >
                        <Ionicons name="pin" size={16} color="#24786D" />
                        <Text style={styles.pinnedText} numberOfLines={1}>
                            Tin nhắn ghim: {pinnedMessages[0].content}
                        </Text>
                        <TouchableOpacity>
                            <Ionicons name="close" size={16} color="gray" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
                >
                    <FlatList
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.message_id}
                        inverted // Đảo ngược để tin nhắn mới nhất ở sát Input
                        onEndReached={() => {
                            if (hasMore && !loadingMore && cursor) {
                                loadMessages(cursor);
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={() => (
                            loadingMore ? <ActivityIndicator size='small' color="#24786D" /> : null
                        )}
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingBottom: 10 // Tạo khoảng trống nhỏ với input
                        }}
                        // Loại bỏ các cảnh báo về scroll
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={20}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        removeClippedSubviews
                    />

                    {replyingMessage && (
                        <View style={styles.replyBar}>
                            <View style={{ flex: 1, borderLeftWidth: 4, borderLeftColor: '#24786D', paddingLeft: 8 }}>
                                <Text style={{ fontWeight: 'bold', color: '#24786D' }}>
                                    Trả lời {replyingMessage.sender_id === user?.user_id ? 'chính mình' : conversation?.name}
                                </Text>
                                <Text numberOfLines={1} style={{ color: 'gray' }}>
                                    {replyingMessage.message_type === 'text' ? replyingMessage.content : `[${replyingMessage.message_type}]`}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setReplyingMessage(null)}>
                                <Ionicons name="close-circle" size={20} color="gray" />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.inputForm}>
                        {isVoiceMode ? (
                            <TouchableOpacity onPress={() => setIsVoiceMode(false)}>
                                <Ionicons name="close-circle" size={26} color="red" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={pickDocument}>
                                <Ionicons name="attach" size={24} color="black" />
                            </TouchableOpacity>
                        )}
                        <View style={styles.inputBox}>
                            <TextInput
                                placeholder="Tin nhắn"
                                placeholderTextColor="#797C7B"
                                style={styles.input}
                                value={content}
                                onChangeText={(text) => handleInput(text)}
                                multiline={true}
                                onFocus={() => setIsVoiceMode(false)}
                            />
                            <MaterialCommunityIcons name="sticker-emoji" size={24} color="black" />
                        </View>
                        {isPress ? (
                            <TouchableOpacity
                                style={{ paddingHorizontal: 10 }}
                                onPress={() => handleSend('text')}
                            >
                                <AntDesign name="send" size={24} color="#24786D" />
                            </TouchableOpacity>
                        ) : (
                            /* TRƯỜNG HỢP 2: KHÔNG CÓ CHỮ -> HIỆN CAMERA VÀ MIC */
                            <View style={[styles.box, { flexDirection: 'row', gap: 12, marginLeft: 10 }]}>
                                <TouchableOpacity onPress={pickImage}>
                                    <Ionicons name="camera-outline" size={26} color="black" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => {
                                    setIsVoiceMode(true);
                                    Keyboard.dismiss();
                                }}>
                                    <Ionicons name="mic-outline" size={26} color="black" />
                                </TouchableOpacity>
                            </View>
                        )}

                    </View>
                    {isVoiceMode && (
                        <View style={styles.voicePanel}>
                            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                <Text style={{ marginBottom: 20, color: '#797C7B' }}>
                                    {isRecording ? "Đang ghi âm... Thả để gửi" : "Nhấn giữ vào Micro để ghi âm"}
                                </Text>

                                <TouchableOpacity
                                    onPressIn={() => {
                                        setIsRecording(true);
                                        startRecording();
                                    }}
                                    onPressOut={() => {
                                        setIsRecording(false);
                                        stopRecording();
                                    }}
                                    style={[styles.bigMicButton, { backgroundColor: isRecording ? 'red' : '#24786D' }]}
                                >
                                    <Ionicons name="mic" size={40} color="white" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{ marginTop: 20 }}
                                    onPress={() => setIsVoiceMode(false)}
                                >
                                    <Text style={{ color: 'gray' }}>Hủy bỏ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </KeyboardAvoidingView>
                {/* </KeyboardStickyView> */}
                <Modal visible={isMenuVisible} animationType="slide">
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F6F6' }}>
                        <View style={styles.menuHeader}>
                            <Ionicons name="arrow-back" size={24} onPress={() => setIsMenuVisible(false)} />
                            <Text style={styles.menuTitle}>Thông tin nhóm</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        <FlatList
                            ListHeaderComponent={() => (
                                <View style={styles.menuTopInfo}>
                                    <TouchableOpacity onPress={pickGroupImage}>
                                        <Image source={conversation?.avatar ? { uri: conversation.avatar } : avatarDefault} style={styles.bigAvatar} />
                                        <View style={styles.cameraIcon}><Ionicons name="camera" size={14} color="white" /></View>
                                    </TouchableOpacity>
                                    <Text style={styles.groupNameText}>{conversation?.name}</Text>

                                    <View style={styles.actionGrid}>
                                        <TouchableOpacity style={styles.actionBtn} onPress={openAddMemberModal}>
                                            <View style={styles.iconCircle}><Ionicons name="person-add" size={20} color="black" /></View>
                                            <Text style={styles.iconLabel}>Thêm</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => setPinnedMessages([])}>
                                            <View style={styles.iconCircle}><Ionicons name="notifications-off" size={20} color="black" /></View>
                                            <Text style={styles.iconLabel}>Tắt thông báo</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            data={groupMembers}
                            keyExtractor={(item) => item.user_id}
                            renderItem={({ item }) => {
                                const isAdmin = item.role === 'admin';
                                const isMeAdmin = groupMembers.find(m => m.user_id === user?.user_id)?.role === 'admin';

                                return (
                                    <View style={styles.memberItem}>
                                        <Image source={{ uri: item.avatar }} style={styles.smallAvatar} />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={{ fontWeight: '500' }}>{item.username} {item.user_id === user?.user_id && "(Bạn)"}</Text>
                                            {isAdmin && <Text style={styles.adminBadge}>Trưởng nhóm</Text>}
                                        </View>

                                        {/* Menu chức năng cho Admin đối với thành viên khác */}
                                        {isMeAdmin && item.user_id !== user?.user_id && (
                                            <View style={{ flexDirection: 'row', gap: 15 }}>
                                                {!isAdmin && (
                                                    <TouchableOpacity onPress={() => handleSetAdmin(item.user_id)}>
                                                        <MaterialCommunityIcons name="shield-check-outline" size={22} color="#24786D" />
                                                    </TouchableOpacity>
                                                )}
                                                <TouchableOpacity onPress={() => handleRemoveMember(item.user_id, false)}>
                                                    <Ionicons name="person-remove-outline" size={22} color="red" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                );
                            }}
                            ListFooterComponent={() => (
                                <TouchableOpacity
                                    style={styles.leaveButton}
                                    onPress={() => handleRemoveMember(user?.user_id || "", true)}
                                >
                                    <Ionicons name="log-out-outline" size={22} color="red" />
                                    <Text style={{ color: 'red', fontWeight: 'bold', marginLeft: 10 }}>Rời khỏi nhóm</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </SafeAreaView>
                </Modal>
                <Modal visible={isAddMemberModalVisible} animationType="fade" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.addMemberContent}>
                            <View style={styles.addMemberHeader}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Thêm thành viên</Text>
                                <TouchableOpacity onPress={() => setIsAddMemberModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="black" />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={friendsToInvite}
                                keyExtractor={(item) => item.user_id}
                                style={{ maxHeight: 400 }}
                                ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20 }}>Tất cả bạn bè đã ở trong nhóm</Text>}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.friendInviteItem}
                                        onPress={() => handleInviteFriend(item.user_id)}
                                    >
                                        <Image source={{ uri: item.avatar }} style={styles.smallAvatar} />
                                        <Text style={{ flex: 1, marginLeft: 12 }}>{item.username}</Text>
                                        <Ionicons name="person-add-outline" size={20} color="#24786D" />
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>

            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    headerChat: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
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

    inputForm: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
    },

    inputBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F6F6',
        borderRadius: 10
    },

    input: {
        height: 40,
        flex: 1,
    },

    box: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ccc',
    },

    subText: {
        fontSize: 12,
        color: '#797C7B'
    },

    voicePanel: {
        height: 250, // Chiều cao cố định tương đương bàn phím
        backgroundColor: '#F5F5F5',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        padding: 20,
    },
    bigMicButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        // Đổ bóng cho nút Mic nhìn cho xịn
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    pinnedBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // Nền trắng cho sạch
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        // Tạo hiệu ứng đổ bóng nhẹ
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        // Đảm bảo thanh này luôn nằm trên cùng của danh sách chat
        zIndex: 10,
    },

    pinnedText: {
        flex: 1, // Chiếm hết không gian ở giữa
        fontSize: 14,
        color: '#24786D', // Màu xanh thương hiệu của Khoa
        fontWeight: '500',
        marginHorizontal: 10,
    },

    // Nếu Khoa muốn thanh ghim có bo góc nhẹ thì thêm cái này
    pinnedContainer: {
        marginHorizontal: 10,
        marginTop: 5,
        borderRadius: 8,
        overflow: 'hidden',
    },

    menuTopInfo: { alignItems: 'center', backgroundColor: 'white', paddingBottom: 20 },
    groupNameText: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
    adminBadge: { color: '#24786D', fontSize: 11, fontWeight: '600' },
    actionGrid: { flexDirection: 'row', marginTop: 20, gap: 30 },
    actionBtn: { alignItems: 'center' },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F6F6', justifyContent: 'center', alignItems: 'center' },
    iconLabel: { fontSize: 12, marginTop: 5 },
    menuHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: 'white' },
    menuTitle: { fontSize: 17, fontWeight: 'bold' },
    bigAvatar: { width: 80, height: 80, borderRadius: 40 },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#24786D', padding: 4, borderRadius: 10 },
    memberItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'white', borderBottomWidth: 0.5, borderBottomColor: '#EEE' },
    smallAvatar: { width: 40, height: 40, borderRadius: 20 },
    leaveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, marginTop: 10, backgroundColor: 'white' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addMemberContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        elevation: 10,
    },
    addMemberHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    friendInviteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    }
})

export default ChatRoom;