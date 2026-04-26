import friendApi from "@/api/friendApi";
import { UserPropComponent } from "@/app/(tabs)";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
const defaultAvatar = require('../assets/images/avatar-default.png');
{/* <FontAwesome5 name="user-times" size={24} color="black" /> */ }

interface UserProp {
    user: UserPropComponent,
    message?: string,
}

const UserComponent: React.FC<UserProp> = ({ user, message }) => {
    const [requesting, setRequesting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSendRequest = async (id: String) => {
        setRequesting(true);
        try {
            await friendApi.sendRequest(id);
            setSent(true);
        } catch (error) {
            console.log("Send request failure");

        } finally {
            setRequesting(false);
        }
    }

    return (
        <View style={styles.container}>
            <Image source={user?.avatar ? { uri: user.avatar } : defaultAvatar} style={styles.avatar} resizeMode="cover" />
            <View style={styles.inforContainer}>
                <Text style={styles.nameText}>{user.username}</Text>
            </View>
            {requesting ? (
                <ActivityIndicator />
            ) : sent || user.request_status ? (
                <FontAwesome5 name="user-times" size={24} color="black" />
            ) : (
                <Ionicons
                    name="person-add-outline"
                    size={24}
                    color="#00FF00"
                    onPress={() => handleSendRequest(user.user_id)}
                />
            )}
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
    },

    nameText: {
        fontWeight: 600,
        fontSize: 16,
        color: " #333"
    }
});

export default UserComponent;