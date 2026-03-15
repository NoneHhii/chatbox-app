import { ConversationProp } from "@/app/(tabs)"
import { Image, StyleSheet, Text, View } from "react-native"
import { avatarDefault } from '../assets/images/avatar-default.png'

interface props {
    conversation: ConversationProp,
}

const ConversationItem = ({ conversation }: props) => {

    const nameChat = () => {
        if (conversation.converDetail.members.length > 2)
            return conversation.converDetail.nameGroup || conversation.converDetail.members.map(m => m.username).join();

        return conversation.converDetail.members?.[1].username;
    }

    return (
        <View style={styles.container}>
            <View style={[styles.avatarBorder, { marginRight: 12 }]}>
                {/* <View style={styles.avatar}> */}
                <Image source={{ uri: conversation.converDetail.members?.[1]?.avatar || avatarDefault }} style={styles.avatar} resizeMode="cover" />
                {/* </View> */}
            </View>
            <View style={{ flex: 1 }}>
                <Text
                    numberOfLines={1}
                    style={{
                        fontSize: 16,
                    }}
                >
                    {nameChat()}
                </Text>

                <Text
                    numberOfLines={1}
                    style={{
                        fontSize: 12,
                    }}
                >
                    {conversation.lastMessage}
                </Text>
            </View>
            <View>
                <Text
                    style={{
                        fontSize: 12,
                        color: '#797C7B'
                    }}
                >
                    {conversation.lastActive}
                </Text>
                <Text style={{ display: 'none' }}>
                    {conversation.lastActive}
                </Text>
            </View>
        </View>
    )
}

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