import { Animated, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ConversationItem from '@/components/conversationItem';
import { ThemedText } from '@/components/themed-text';
import { conversationDetails } from '@/database/conversationDetail';
import { conversations } from '@/database/conversations';
import { friends } from '@/database/friends';
import { messages } from '@/database/messages';
import { users } from '@/database/users';
import { ConversationDetail, User } from '@/types/input';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ConversationProp {
  converDetail: ConversationDetail,
  lastMessage: string,
  lastActive: string,
}

const myID = 'U01';

export default function HomeScreen() {
  const [myFriends, setMyFriends] = useState<User[]>([]);
  // const [conversations, setConversations] = useState<Conversation[]>([]);
  const [converProps, setConverProps] = useState<ConversationProp[]>([]);
  const [user, setUser] = useState<User | undefined>(users.find(u => u.userId === myID));

  const filterFriend = useMemo(() => {
    const idFriend = friends.filter(f => f.userId === myID && f.status === 'accepted').map(f => f.friendUserId);
    return users.filter(u => idFriend.includes(u.userId));
  }, [friends])

  const filterConversation = useMemo(() => {
    // 1. Lấy danh sách hội thoại mà user hiện tại tham gia (createdBy hoặc là thành viên)
    const myConversations = conversations.filter(c => c.createdBy === myID);



    // 2. Map trực tiếp sang kiểu ConversationProp
    return myConversations.map((convers) => {
      const detail = conversationDetails.find(
        (d) => d.conversation.conversationId === convers.conversationId
      );

      const members = detail?.members || [];
      const idMembers = members.map((u) => u.userId);

      // Lọc tin nhắn thuộc về cuộc hội thoại này (dựa trên người gửi là thành viên)
      // Lưu ý: Logic chuẩn thường là messages có conversationId, nhưng theo code bạn là lọc theo members
      const messageConver = messages.filter((m) => idMembers.includes(m.senderId));

      // Sắp xếp lấy tin nhắn mới nhất (Số lớn nhất - mới nhất nằm ở vị trí 0)
      const sortedMessages = [...messageConver].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      const lastMsg = sortedMessages[0]; // Tin nhắn mới nhất

      // Trả về object đúng kiểu ConversationProp
      return {
        converDetail: detail,
        lastMessage: lastMsg?.content || "Chưa có tin nhắn",
        // Tính toán lastActive
        lastActive: lastMsg
          ? (new Date().getTime() - lastMsg.createdAt.getTime() < 60000
            ? 'Vừa xong'
            : lastMsg.createdAt.getHours().toString() + " giờ trước")
          : '',
      };
    }).filter((item): item is ConversationProp => item !== null);
  }, [conversations, messages, conversationDetails]);

  const renderUser = ({ item }: { item: User }) => {
    return (
      <View>
        <View style={[styles.avatarBorder, { marginRight: 12 }]}>
          <Image
            source={{ uri: item.avatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
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
        <ConversationItem conversation={item} />
      </Swipeable>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <View>
          <View style={[styles.flexBox, { justifyContent: 'space-between', marginHorizontal: 8 }]}>
            <View style={styles.circleBorder}>
              <Ionicons name='search' size={24} color={'white'} />
            </View>
            <ThemedText type='subtitle' lightColor='white'>Home</ThemedText>
            <Ionicons name="notifications" size={24} color="white" />
          </View>

          <View style={[styles.flexBox, { marginVertical: 12 }]}>
            {/* user */}
            <View style={{ paddingRight: 8 }}>
              <View style={styles.boxCircle}>
                <View style={[styles.circleDashedBorder, { borderColor: 'red', borderRightColor: 'transparent', borderBottomColor: 'transparent' }]} />
                <View style={[styles.circleDashedBorder, { borderColor: 'white', borderLeftColor: 'transparent' }]} />
                <View style={[styles.circleDashedBorder, { borderColor: 'red', borderTopColor: 'transparent', borderBottomColor: 'transparent' }]} />
                <Image
                  source={{ uri: user?.avatar }}
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
                Me
              </Text>
            </View>
            {/* friend */}
            <FlatList
              data={filterFriend}
              renderItem={renderUser}
              horizontal
            />
          </View>
        </View>

        <View style={styles.chatbox}>
          <View style={styles.dragLine} />
          <FlatList
            data={filterConversation}
            renderItem={renderConver}
            style={{
              width: '90%'
            }}
          />
        </View>
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

  dragLine: { borderWidth: 4, borderRadius: 10, borderColor: '#ccc', width: '15%', marginTop: 15 }
});
