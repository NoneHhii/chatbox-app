import RequestComponent from "@/components/request-component";
import { useFriend } from "@/hooks/useFriends";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserPropComponent } from "./(tabs)";

const RequestsScreen = () => {

    const { data: requests, isLoading } = useFriend();
    console.log(requests);


    const renderUser = ({ item }: { item: UserPropComponent }) => {
        return (
            <RequestComponent user={item} />
        )
    }

    return (
        <SafeAreaView style={styles.container}>

            <View style={{ width: "90%" }}>
                <View style={styles.headerScreen}>
                    <Ionicons name="chevron-back" size={24} color="black" onPress={() => router.back()} />
                    <Text style={styles.headerTitle}>Lời mời kết bạn</Text>
                </View>

                {isLoading ? (
                    <View style={styles.box}>
                        <ActivityIndicator color={"#333"} size={24} />
                    </View>
                ) : (requests.length > 0 ? (
                    <View style={{ marginTop: 25, width: "100%", alignItems: 'center' }}>
                        {requests.length > 0 && (
                            <Text style={{ textAlign: 'left', width: '100%', marginBottom: 20 }}>
                                <Text style={{ fontWeight: 'bold' }}>Liên hệ: </Text>
                                ({requests.length})
                            </Text>
                        )}
                        <FlatList
                            data={requests}
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
    },

    headerScreen: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center'
    }
});

export default RequestsScreen;