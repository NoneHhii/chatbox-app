import { Animated, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ChatApi from '@/api/chatApi';
import ConversationItem from '@/components/conversationItem';
import { ThemedText } from '@/components/themed-text';
// import { conversations } from '@/database/conversations';
import { useConversation } from '@/hooks/useChat';
import { useMyFriend } from '@/hooks/useFriends';
import { useAppSelector } from '@/redux/hooks';
import useChatStore from '@/redux/store/useChatStore';
import { socket } from '@/socket/config';
import { FriendRequest, User } from '@/types/input';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// export interface ConversationProp {
//   converDetail: ConversationDetail,
//   lastMessage: string,
//   lastActive: string,
//   lastMessageAt: number,
// }

export interface ConversationProp {
  conversation_id?: string,
  name: string,
  type?: String,
  avatar: string,
  last_message: String,
  last_time_message: any,
  last_sender_id?: string,
  last_sender_name?: string,
  friend_id?: string,
  converId?: string
}

export interface requests {
  friendRequest: FriendRequest,
  user_id: String,
  username: String,
  avatar: String
}

export interface UserPropComponent {
  user_id: String,
  username: String,
  avatar: String,
  request_create_at?: String,
  request_status?: string,
  friend_id: string,
}

interface StartChatParams {
  name: string,
  avatar: string,
  friend_id?: string,  // avatar
  conversation_id?: string,
}

const myID = 'U01';

export default function HomeScreen() {
  const [myFriends, setMyFriends] = useState<User[]>([]);
  // const [conversations, setConversations] = useState<Conversation[]>([]);
  const [converProps, setConverProps] = useState<ConversationProp[]>([]);
  const user: User | null = useAppSelector(state => state.auth.user);
  // console.log(user);
  const query = useQueryClient();

  const { data: friends, isLoading } = useMyFriend();
  const { data: conversations, isLoading: loadingConver } = useConversation();
  // console.log(conversations);
  const [menuVisible, setMenuVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]); // Lưu ID
  const [groupName, setGroupName] = useState("");


  const { setConversations, addConversation, getConversationById, updateConversationInfo } = useChatStore();


  // const filterFriend = useMemo(() => {
  //   const idFriend = friends.map(f => f.sender_id);
  //   return users.filter(u => idFriend.includes(u.user_id));
  // }, [friends])
  useEffect(() => {
    if (conversations) setConversations(conversations);
  }, [conversations])

  const handleStartChat = async (
    name: string,
    avatar: string,
    friend_id?: string,
    conversation_id?: string
  ) => {
    try {
      const receiverIds = friend_id
        ? [friend_id]
        : [];

      console.log("cvId: ", conversation_id);


      const res =
        await ChatApi.getOrCreateConversation({
          receiverIds,
          name: name,
          avatar,
          type: "private",
          converId: conversation_id,
        });

      const newConv =
        res.data;

      const existing =
        getConversationById(
          newConv.conversation_id
        );

      if (!existing) {
        addConversation({
          conversation_id:
            newConv.conversation_id,

          name:
            newConv.name ||
            name,

          avatar:
            newConv.avatar ||
            avatar,

          last_message:
            newConv.last_message ||
            "Bắt đầu cuộc trò chuyện",

          last_time_message:
            newConv.last_time_message ||
            new Date().toISOString(),

          last_sender_id:
            newConv.last_sender_id,

          last_sender_name:
            newConv.last_sender_name,
        });
      }

      router.push({
        pathname:
          "/chat-room",
        params: {
          id:
            newConv.conversation_id,
          partnerName:
            newConv.name ||
            name,
        },
      });
    } catch (error) {
      console.log(error);
      alert(
        "Không thể bắt đầu chat"
      );
    }
  };

  useEffect(() => {
    const handleUpdate = (data: any) => {
      console.log("Socket nhận update nhóm:", data.name);
      // Gọi hàm của Store để cập nhật toàn hệ thống
      updateConversationInfo(data.conversation_id, {
        name: data.name,
        avatar: data.avatar
      });
    };

    socket.on("group_updated", handleUpdate);

    return () => {
      socket.off("group_updated", handleUpdate);
    };
  }, []);

  const toggleSelectFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    );
  };

  // Hàm gọi API tạo nhóm
  const handleCreateGroup = async () => {
    try {
      const res = await ChatApi.getOrCreateConversation({
        receiverIds: selectedFriends,
        name: groupName || "Nhóm mới",
        avatar: "",
        type: "group"
      });
      setGroupModalVisible(false);
      setSelectedFriends([]);
      const newConv = res.data;
      const existingConv = getConversationById(newConv.conversation_id);
      if (!existingConv) {
        // Nếu là hội thoại mới tạo (chưa có trong Store), thêm nó vào
        addConversation({
          conversation_id: newConv.conversation_id,
          name: groupName,
          avatar: newConv.avatar || "", // Đảm bảo lấy đủ thông tin từ res.data
          last_message: "Bắt đầu cuộc trò chuyện ngay",
          last_time_message: new Date().toISOString(),
        });
      }
      router.push({ pathname: '/chat-room', params: { id: newConv.conversation_id, partnerName: groupName } });
    } catch (error) {
      alert("Lỗi tạo nhóm");
    }
  };


  const finalDisplayList = useMemo(() => {
    const safeConversations = conversations || [];

    // Lọc những người bạn chưa có trong danh sách hội thoại để tránh trùng lặp
    const talkedUserIds = safeConversations.map(c => c.friend_id);
    const talkedUserName = safeConversations.map(c => c.name);
    console.log(talkedUserName);


    const virtualConversations = (friends || [])
      .filter((friend: User) => !talkedUserIds.includes(friend.user_id))
      .map((friend: User) => ({
        conversation_id: `temp_${friend.user_id}`,
        name: friend.username,
        avatar: friend.avatar || "",
        last_message: `Vẫy tay chào ${friend.username} 👋`,
        last_time_message: new Date().toISOString(), // Dùng chuỗi ISO cho đồng bộ
        last_sender_id: friend.user_id,
        last_sender_name: friend.username,
        lastMessageAt: Date.now(), // Dùng để sort
      }));

    // Gộp hội thoại thật và ảo
    const combined = [...safeConversations, ...virtualConversations];
    // console.log("conver: ", combined);


    // Sắp xếp: ưu tiên những gì mới nhất lên đầu
    return combined.sort((a, b) => {
      const timeA = new Date(a.last_time_message).getTime() || 0;
      const timeB = new Date(b.last_time_message).getTime() || 0;
      return timeB - timeA;
    });
  }, [friends, conversations]);



  const renderUser = ({ item }: { item: User }) => {
    return (
      <View >
        <View style={[styles.avatarBorder, { marginRight: 12, position: 'relative' }]}>
          <Image
            source={{ uri: item.avatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
          {item.is_online && (
            <View style={[styles.btnAdd, { backgroundColor: '#00FF00' }]}>

            </View>
          )}
        </View>
        <Text
          numberOfLines={1}
          style={{
            color: 'white',
            width: 66,
            fontSize: 12,
            textAlign: 'center'
          }}
        >
          {item.username}
        </Text>

      </View>
    )
  }

  const renderConver = ({ item }: { item: ConversationProp }) => {
    // console.log("ItemC: ", item);


    const renderRightSlide = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const trans = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [0, 100]
      })

      return (
        <View style={{ flexDirection: 'row', width: 100, alignItems: 'center', paddingLeft: 20 }}>
          <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
            <TouchableOpacity style={[styles.btnCicrle, { backgroundColor: '#ccc' }]}>
              <Ionicons name="notifications" size={22} color="white" />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
            <TouchableOpacity style={[styles.btnCicrle, { backgroundColor: 'red' }]}>
              <Ionicons name="trash" size={22} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )
    }

    return (
      <Swipeable renderRightActions={renderRightSlide}>
        <ConversationItem conversation={item} handleStartChat={(p: StartChatParams) => handleStartChat(
          p.name,      // friendName
          p.avatar,
          p.friend_id,   // avatar
          p.conversation_id // THÊM CÁI NÀY ĐỂ BACKEND KHÔNG NHẦM
        )} isMe={item.last_sender_id ? item.last_sender_id === user?.user_id : false} />
      </Swipeable>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <View>
          <View style={[styles.flexBox, { justifyContent: 'space-between', marginHorizontal: 8 }]}>
            <TouchableOpacity
              style={styles.circleBorder}
              onPress={() => router.push("/search-sreen")}
            >
              <Ionicons name='search' size={24} color={'white'} />
            </TouchableOpacity>
            <ThemedText type='subtitle' lightColor='white'>Home</ThemedText>
            <View style={[styles.flexBox, { gap: 8 }]}>
              <Ionicons
                name="notifications"
                size={24}
                color="white"
                onPress={() => router.push('/requests-screen')}
              />
              <Ionicons
                name="add-circle"
                size={24}
                color="white"
                onPress={() => setMenuVisible(true)}
              />

              {/* Modal Menu Lựa chọn */}
              <Modal visible={menuVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                  <View style={styles.menuContent}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); setGroupModalVisible(true); }}>
                      <Ionicons name="people-outline" size={20} />
                      <Text>Tạo nhóm mới</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                      <Ionicons name="document-outline" size={20} />
                      <Text>My Document</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>

          <View style={[styles.flexBox, { marginVertical: 12 }]}>
            {/* user */}
            <View style={{ paddingRight: 8 }}>
              <View style={styles.boxCircle}>
                <View style={[styles.circleDashedBorder, { borderColor: 'red', borderRightColor: 'transparent', borderBottomColor: 'transparent' }]} />
                <View style={[styles.circleDashedBorder, { borderColor: 'white', borderLeftColor: 'transparent' }]} />
                <View style={[styles.circleDashedBorder, { borderColor: 'red', borderTopColor: 'transparent', borderBottomColor: 'transparent' }]} />
                <Image
                  source={{ uri: user?.avatar?.replace('/svg', '/png') }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
                <TouchableOpacity style={styles.btnAdd}>
                  <Text style={{ textAlign: 'center', lineHeight: 16, fontWeight: 'semibold' }}>+</Text>
                </TouchableOpacity>
              </View>
              <Text
                numberOfLines={1}
                style={{
                  color: 'white',
                  width: 52,
                  fontSize: 12,
                  textAlign: 'center'
                }}
              >
                {user?.username}
              </Text>
            </View>
            {/* friend */}
            <FlatList
              data={friends || []}
              renderItem={renderUser}
              horizontal
            />
          </View>
        </View>

        <View style={styles.chatbox}>
          <View style={styles.dragLine} />
          <FlatList
            data={finalDisplayList}
            renderItem={renderConver}
            style={{
              width: '90%'
            }}
          />
        </View>
        <Modal visible={groupModalVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>Tạo nhóm ({selectedFriends.length})</Text>
              <TouchableOpacity onPress={() => setGroupModalVisible(false)}>
                <Text style={{ color: 'red' }}>Hủy</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Nhập tên nhóm..."
              style={styles.groupInput}
              onChangeText={setGroupName}
            />

            {/* Danh sách bạn bè để chọn */}
            <FlatList
              data={friends || []}
              keyExtractor={item => item.user_id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.friendSelectItem} onPress={() => toggleSelectFriend(item.user_id)}>
                  <Image source={{ uri: item.avatar }} style={styles.avatarSmall} />
                  <Text style={{ flex: 1, marginLeft: 10 }}>{item.username}</Text>
                  <Ionicons
                    name={selectedFriends.includes(item.user_id) ? "checkbox" : "square-outline"}
                    size={24} color="#24786D"
                  />
                </TouchableOpacity>
              )}
            />

            {/* Thanh hiển thị Avatar người đã chọn và nút Tạo */}
            {selectedFriends.length > 0 && (
              <View style={styles.footerCreateGroup}>
                <FlatList
                  data={friends?.filter(f => selectedFriends.includes(f.user_id))}
                  horizontal
                  renderItem={({ item }) => (
                    <Image source={{ uri: item.avatar }} style={styles.avatarSelected} />
                  )}
                  style={{ flex: 1 }}
                />
                <TouchableOpacity style={styles.btnConfirmGroup} onPress={handleCreateGroup}>
                  <Ionicons name="arrow-forward" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  },

  flexBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },

  boxCircle: {
    width: 66,
    height: 66,
    borderRadius: 29,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleDashedBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
    // margin: 2,
  },

  circleBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
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

  btnAdd: {
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '70%',
    right: 0
  },

  chatbox: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F3F6F6',
    alignItems: 'center',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 20
  },

  btnCicrle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },

  dragLine: { borderWidth: 4, borderRadius: 10, borderColor: '#ccc', width: '15%', marginTop: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: 200,
    padding: 10
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  groupTitle: { fontSize: 18, fontWeight: 'bold' },
  groupInput: { padding: 16, fontSize: 16, backgroundColor: '#f9f9f9' },
  friendSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: '#eee'
  },
  avatarSmall: { width: 40, height: 40, borderRadius: 20 },
  footerCreateGroup: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee'
  },
  avatarSelected: { width: 35, height: 35, borderRadius: 17.5, marginRight: 5 },
  btnConfirmGroup: {
    backgroundColor: '#24786D',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
