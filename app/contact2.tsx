import { useAppSelector } from "@/redux/hooks";
import { User } from "@/types/input";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ActionButton = {
    id: string;
    icon: React.ReactNode;
};

type MediaItem = {
    id: string;
    type: "image" | "more";
    count?: number;
};

const { width } = Dimensions.get("window");
const MEDIA_SIZE = (width - 48 - 16) / 3;

const mediaItems: MediaItem[] = [
    { id: "1", type: "image" },
    { id: "2", type: "image" },
    { id: "3", type: "more", count: 255 },
];

export default function ContactProfileScreen() {
    const user: User | null = useAppSelector(state => state.auth.user);

    const actionButtons: ActionButton[] = [
        {
            id: "message",
            icon: <Ionicons name="chatbubble-ellipses-outline" size={22} color="#4ade80" />,
        },
        {
            id: "video",
            icon: <Feather name="video" size={22} color="#4ade80" />,
        },
        {
            id: "call",
            icon: <Feather name="phone" size={22} color="#4ade80" />,
        },
        {
            id: "more",
            icon: <MaterialCommunityIcons name="dots-horizontal" size={22} color="#4ade80" />,
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0a1a12" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[]}
            >
                {/* Dark Header */}
                <View style={styles.header}>
                    {/* <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity> */}

                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: user?.avatar || "https://i.pravatar.cc/150?img=12" }}
                            style={styles.avatar}

                        />
                    </View>

                    <Text style={styles.name}>{user?.username}</Text>
                    {/* <Text style={styles.username}>@jhonabraham</Text> */}

                    {/* Action Buttons */}
                    <View style={styles.actionsRow}>
                        {actionButtons.map((btn) => (
                            <TouchableOpacity key={btn.id} style={styles.actionButton}>
                                {btn.icon}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* White Card */}
                <View style={styles.card}>
                    <View style={styles.dragHandle} />

                    <InfoField label="Display Name" value={user?.username || ""} />
                    <Divider />
                    <InfoField label="Email Address" value={user?.email || ""} />
                    <Divider />
                    {/* <InfoField label="Address" value="33 street west subidbazar, sylhet" />
                    <Divider /> */}
                    <InfoField label="Phone Number" value={user?.phone || ""} />

                    {/* Media Shared */}
                    <View style={styles.mediaHeader}>
                        <Text style={styles.mediaTitle}>Media Shared</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mediaRow}>
                        {mediaItems.map((item) =>
                            item.type === "more" ? (
                                <View key={item.id} style={[styles.mediaThumb, styles.mediaMore]}>
                                    <Text style={styles.mediaMoreText}>{item.count}+</Text>
                                </View>
                            ) : (
                                <Image
                                    key={item.id}
                                    source={{ uri: `https://picsum.photos/seed/${item.id}00/200` }}
                                    style={styles.mediaThumb}
                                />
                            )
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* ── Sub-components ── */
function InfoField({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue}>{value}</Text>
        </View>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

/* ── Styles ── */
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0a1a12",
    },
    scrollView: {
        flex: 1,
    },

    /* Header */
    header: {
        backgroundColor: "#0a1a12",
        alignItems: "center",
        paddingBottom: 28,
        paddingTop: 8,
    },
    backButton: {
        alignSelf: "flex-start",
        marginLeft: 20,
        marginBottom: 16,
    },
    avatarContainer: {
        width: 84,
        height: 84,
        borderRadius: 42,
        overflow: "hidden",
        backgroundColor: "#e8a825",
        marginBottom: 12,
    },
    avatar: {
        width: "100%",
        height: "100%",
        objectFit: 'cover'
    },
    name: {
        color: "white",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },
    username: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 13,
        marginBottom: 20,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 20,
    },
    actionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#1a3020",
        alignItems: "center",
        justifyContent: "center",
    },

    /* Card */
    card: {
        backgroundColor: "white",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        minHeight: 500,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#e5e7eb",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 20,
    },

    /* Fields */
    fieldContainer: {
        paddingVertical: 14,
    },
    fieldLabel: {
        fontSize: 12,
        color: "#9ca3af",
        marginBottom: 4,
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    divider: {
        height: 0.5,
        backgroundColor: "#f3f4f6",
    },

    /* Media */
    mediaHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 12,
    },
    mediaTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    viewAll: {
        fontSize: 14,
        fontWeight: "600",
        color: "#16a34a",
    },
    mediaRow: {
        flexDirection: "row",
        gap: 8,
    },
    mediaThumb: {
        width: MEDIA_SIZE,
        height: MEDIA_SIZE,
        borderRadius: 12,
        backgroundColor: "#f3f4f6",
    },
    mediaMore: {
        backgroundColor: "#374151",
        alignItems: "center",
        justifyContent: "center",
    },
    mediaMoreText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },
});