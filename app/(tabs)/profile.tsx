// screens/MyAccountScreen.tsx
import authApi from "@/api/authApi";
import { useAppSelector } from "@/redux/hooks";
import { User } from "@/types/input";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const defaultAvatar = require('../../assets/images/avatar-default.png');

const C = {
    bg: "#0a1a12",
    screen: "#0d1f15",
    card: "#112418",
    item: "#1a3020",
    border: "#1e3a26",
    border2: "#2d5a3d",
    green: "#4ade80",
    teal: "#5DCAA5",
    dim: "#4a7a5a",
    text: "#d8f0e0",
    white: "#ffffff",
    amber: "#EF9F27",
    amberBg: "#17100a",
    amberBdr: "#3a2a10",
};

type Row = {
    id: string; icon: string; iconLib?: "Ionicons" | "Feather";
    label: string; value?: string;
    badge?: { text: string; color: string; bg: string; border: string };
};
type Section = { title: string; rows: Row[] };



export default function MyAccountScreen() {
    const user: User | null = useAppSelector(state => state.auth.user);
    const [isLoading, setIsLoading] = useState(false);

    const sections: Section[] = [
        {
            title: "PERSONAL INFO",
            rows: [
                { id: "name", icon: "person-outline", iconLib: "Ionicons", label: "Full Name", value: user?.username },
                {
                    id: "email", icon: "mail", iconLib: "Feather", label: "Email", value: user?.email,
                    badge: { text: "Verified", color: C.green, bg: C.item, border: C.border2 }
                },
                { id: "phone", icon: "phone", iconLib: "Feather", label: "Phone", value: user?.phone },
                { id: "address", icon: "location-outline", iconLib: "Ionicons", label: "Address", value: "33 West Subidbazar, Sylhet" },
            ],
        },
        {
            title: "ACCOUNT",
            rows: [
                { id: "pass", icon: "lock", iconLib: "Feather", label: "Change Password", value: "Last changed 3 months ago" },
                {
                    id: "plan", icon: "star-outline", iconLib: "Ionicons", label: "Subscription Plan", value: "Renews Dec 1, 2025",
                    badge: { text: "Pro", color: C.teal, bg: "#0a2820", border: "#1a4a38" }
                },
                {
                    id: "appear", icon: "sun", iconLib: "Feather", label: "Appearance", value: "Dark mode",
                    badge: { text: "Dark", color: C.green, bg: C.item, border: C.border2 }
                },
                { id: "log", icon: "list", iconLib: "Feather", label: "Activity Log", value: "View recent actions" },
            ],
        },
        {
            title: "PRIVACY & SUPPORT",
            rows: [
                { id: "priv", icon: "shield-outline", iconLib: "Ionicons", label: "Privacy Settings", value: "Manage data & visibility" },
                { id: "help", icon: "help-circle-outline", iconLib: "Ionicons", label: "Help & Support", value: "FAQs, contact us" },
                { id: "about", icon: "information-circle-outline", iconLib: "Ionicons", label: "About App", value: "Version 2.4.1" },
            ],
        },
    ];

    const handleLogout = async () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await authApi.logout();
                        } catch (error) {
                            console.log("Logout API error:", error);
                        } finally {
                            // Dù API lỗi vẫn clear local và redirect
                            await AsyncStorage.removeItem("token");
                            await AsyncStorage.removeItem("user");
                            // await AsyncStorage.removeItem("refreshToken");
                            setIsLoading(false);
                            router.replace("/login");
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Navbar */}
            <View style={s.navbar}>
                <TouchableOpacity style={s.ibtn}>
                    <Ionicons name="menu" size={20} color={C.green} />
                </TouchableOpacity>
                <Text style={s.navTitle}>My Account</Text>
                <TouchableOpacity style={s.ibtn}>
                    <Feather name="edit-2" size={16} color={C.green} />
                </TouchableOpacity>
            </View>

            <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={s.hero}>
                    <View style={s.avRing}>
                        <Image source={user?.avatar ? { uri: user.avatar } : defaultAvatar} style={s.avatar} resizeMode="cover" />
                        <View style={s.avCam}>
                            <Feather name="camera" size={12} color={C.bg} />
                        </View>
                    </View>
                    <Text style={s.heroName}>{user?.username}</Text>
                    <Text style={s.heroHandle}>@jhonabraham · Joined March 2022</Text>
                    <View style={s.badge}>
                        <Ionicons name="checkmark-circle" size={14} color={C.green} />
                        <Text style={s.badgeText}>Verified Account</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={s.statsRow}>
                    {[{ n: "248", l: "Posts" }, { n: "1.4K", l: "Followers" }, { n: "312", l: "Following" }]
                        .map((item, i) => (
                            <View key={item.l} style={[s.stat, i > 0 && s.statBdr]}>
                                <Text style={s.statNum}>{item.n}</Text>
                                <Text style={s.statLbl}>{item.l}</Text>
                            </View>
                        ))}
                </View>

                {/* Sections */}
                {sections.map((sec) => (
                    <View key={sec.title} style={s.section}>
                        <Text style={s.secHeader}>{sec.title}</Text>
                        {sec.rows.map((row, i) => {
                            const Icon = row.iconLib === "Feather" ? Feather : Ionicons;
                            return (
                                <TouchableOpacity key={row.id} style={[s.row, i > 0 && s.rowBdr]} activeOpacity={0.7}>
                                    <View style={s.rowIcon}>
                                        <Icon name={row.icon as any} size={18} color={C.green} />
                                    </View>
                                    <View style={s.rowContent}>
                                        <Text style={s.rowLabel}>{row.label}</Text>
                                        {row.value && <Text style={s.rowValue}>{row.value}</Text>}
                                    </View>
                                    <View style={s.rowRight}>
                                        {row.badge && (
                                            <View style={[s.pill, { backgroundColor: row.badge.bg, borderColor: row.badge.border }]}>
                                                <Text style={[s.pillText, { color: row.badge.color }]}>{row.badge.text}</Text>
                                            </View>
                                        )}
                                        <Ionicons name="chevron-forward" size={18} color={C.border2} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}

                {/* Logout */}
                <TouchableOpacity
                    style={s.logout}
                    activeOpacity={0.85}
                    onPress={() => handleLogout()}
                >
                    {isLoading ? (
                        <ActivityIndicator size={24} color={C.amber} />
                    ) : (
                        <View style={{ flexDirection: 'row' }}>
                            <Feather name="log-out" size={18} color={C.amber} />
                            <Text style={s.logoutText}>Đăng xuất</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1, backgroundColor: C.screen },
    navbar: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        padding: 10, paddingHorizontal: 20, backgroundColor: C.bg,
        borderBottomWidth: 0.5, borderBottomColor: C.border
    },
    navTitle: { fontSize: 17, fontWeight: "700", color: C.white },
    ibtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: C.item,
        alignItems: "center", justifyContent: "center"
    },

    hero: { backgroundColor: C.bg, alignItems: "center", paddingVertical: 28, gap: 10 },
    avRing: {
        width: 92, height: 92, borderRadius: 46, borderWidth: 3, borderColor: C.green,
        padding: 3, position: "relative"
    },
    avInner: {
        flex: 1, borderRadius: 40, backgroundColor: C.item,
        alignItems: "center", justifyContent: "center"
    },
    avText: { fontSize: 28, fontWeight: "800", color: C.green },
    avCam: {
        position: "absolute", bottom: 2, right: 2, width: 26, height: 26,
        borderRadius: 13, backgroundColor: C.green,
        borderWidth: 2.5, borderColor: C.bg,
        alignItems: "center", justifyContent: "center"
    },
    heroName: { fontSize: 22, fontWeight: "800", color: C.white },
    heroHandle: { fontSize: 13, color: C.dim },
    badge: {
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: C.item, borderWidth: 0.5, borderColor: C.border2,
        paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20
    },
    badgeText: { fontSize: 11, fontWeight: "700", color: C.green, letterSpacing: 0.3 },

    statsRow: {
        flexDirection: "row", marginHorizontal: 16, marginBottom: 12,
        backgroundColor: C.item, borderRadius: 16,
        borderWidth: 0.5, borderColor: C.border2, overflow: "hidden"
    },
    stat: { flex: 1, paddingVertical: 15, alignItems: "center" },
    statBdr: { borderLeftWidth: 0.5, borderLeftColor: C.border2 },
    statNum: { fontSize: 20, fontWeight: "800", color: C.green },
    statLbl: { fontSize: 11, color: C.dim, marginTop: 3, fontWeight: "500" },

    section: {
        backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16,
        marginBottom: 10, borderWidth: 0.5, borderColor: C.border, overflow: "hidden"
    },
    secHeader: {
        paddingHorizontal: 16, paddingTop: 13, paddingBottom: 7,
        fontSize: 10, fontWeight: "800", color: C.green, letterSpacing: 1
    },
    row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, paddingHorizontal: 16 },
    rowBdr: { borderTopWidth: 0.5, borderTopColor: C.item },
    rowIcon: {
        width: 34, height: 34, borderRadius: 9, backgroundColor: C.item,
        alignItems: "center", justifyContent: "center"
    },
    rowContent: { flex: 1 },
    rowLabel: { fontSize: 15, color: "#d8f0e0", fontWeight: "500" },
    rowValue: { fontSize: 12, color: C.dim, marginTop: 2 },
    rowRight: { flexDirection: "row", alignItems: "center", gap: 7 },
    pill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, borderWidth: 0.5 },
    pillText: { fontSize: 11, fontWeight: "700" },

    logout: {
        marginHorizontal: 16, marginTop: 4, marginBottom: 32,
        backgroundColor: C.amberBg, borderWidth: 0.5, borderColor: C.amberBdr,
        borderRadius: 16, padding: 15, flexDirection: "row",
        alignItems: "center", justifyContent: "center", gap: 9
    },
    logoutText: { fontSize: 15, fontWeight: "700", color: C.amber },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: "center",
        justifyContent: "center",

    },
});