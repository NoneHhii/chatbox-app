import authApi from "@/api/authApi";
import UserComponent from "@/components/user-component";
import { User } from "@/types/input";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SearchSreen = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [loading, setLoading] = useState(false);


    const handleFindUser = async (value: string) => {
        setSearchValue(value);

        if (!value.trim()) {
            setUsers([]);
            return;
        }

        const regexPhoneNumber = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
        const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

        if (regexPhoneNumber.test(value) || regexEmail.test(value)) {
            try {
                setLoading(true);
                const res = await authApi.findUser(value);
                const data = res.data;

                setUsers(data ? [data] : []);
                console.log(data);

            } catch (error) {
                console.log("not found", error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        }
    }

    const handleSendRequest = () => {

    }

    const renderUser = ({ item }: { item: User }) => {
        return (
            <UserComponent user={item} />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Xử lý touch cho keyboard */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, width: "100%", alignItems: 'center' }}>
                    <KeyboardAvoidingView>
                        <View style={styles.input_box}>
                            <Ionicons name='search' size={24} />
                            <TextInput
                                style={{ flex: 1, fontSize: 14 }}
                                value={searchValue}
                                onChangeText={(value) => handleFindUser(value)}
                            />
                            {searchValue.length > 0 && (
                                <Ionicons
                                    name="close-circle" // Dùng circle nhìn sẽ chuyên nghiệp hơn
                                    size={20}
                                    color="#888"
                                    onPress={() => {
                                        setSearchValue("");
                                        handleFindUser(""); // Đừng quên gọi lại hàm tìm kiếm để reset list
                                    }}
                                />
                            )}
                        </View>
                    </KeyboardAvoidingView>

                    <View style={{ width: "90%" }}>
                        {loading ? (
                            <View style={styles.box}>
                                <ActivityIndicator color={"#333"} size={24} />
                            </View>
                        ) : (users.length > 0 ? (
                            <View style={{ marginTop: 25, width: "100%", alignItems: 'center' }}>
                                {users.length > 0 && (
                                    <Text style={{ textAlign: 'left', width: '100%', marginBottom: 20 }}>
                                        <Text style={{ fontWeight: 'bold' }}>Liên hệ: </Text>
                                        ({users.length})
                                    </Text>
                                )}
                                <FlatList
                                    data={users}
                                    renderItem={renderUser}
                                    style={{ width: "100%" }}
                                />
                            </View>
                        ) : (
                            <View style={styles.box}>
                                <Text style={{ color: "#333" }}>Không tìm thấy</Text>
                            </View>
                        ))}
                    </View>


                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center'
    },

    input_box: {
        backgroundColor: '#F3F6F6',
        flexDirection: 'row',
        width: "90%",
        alignItems: 'center',
        paddingHorizontal: 8,
        borderRadius: 10,
    },

    box: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
    }
});

export default SearchSreen;