// screens/OtpScreen.tsx
import authApi from "@/api/authApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator, Alert, Keyboard,
    StatusBar,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
    bg: "#fff", screen: "#fff", card: "#fff",
    item: "#1a3020", border: "#1e3a26", border2: "#2d5a3d",
    green: "#4ade80", dim: "#4a7a5a", white: "#ffffff",
};

const OTP_LENGTH = 6;

export default function OtpScreen() {
    const { email, username, password, avatar } = useLocalSearchParams<{
        email: string;
        username: string;
        password: string;
        avatar: string;
    }>();
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [activeIdx, setActiveIdx] = useState(0);
    const [loading, setLoading] = useState(false);
    const [seconds, setSeconds] = useState(90);
    const [canResend, setCanResend] = useState(false);
    const inputs = useRef<Array<TextInput | null>>([]);

    // Countdown timer
    useEffect(() => {
        if (seconds <= 0) { setCanResend(true); return; }
        const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [seconds]);

    const timerLabel = () => {
        const m = String(Math.floor(seconds / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleChange = (val: string, idx: number) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp];
        next[idx] = val.slice(-1);
        setOtp(next);
        if (val && idx < OTP_LENGTH - 1) {
            inputs.current[idx + 1]?.focus();
            setActiveIdx(idx + 1);
        }
    };

    const handleKeyPress = (e: any, idx: number) => {
        if (e.nativeEvent.key === "Backspace") {
            if (!otp[idx] && idx > 0) {
                const next = [...otp];
                next[idx - 1] = "";
                setOtp(next);
                inputs.current[idx - 1]?.focus();
                setActiveIdx(idx - 1);
            }
        }
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length < OTP_LENGTH) {
            Alert.alert("Incomplete", "Please enter all 6 digits.");
            return;
        }
        Keyboard.dismiss();
        try {
            setLoading(true);
            // Đổi verifyOtp → register, otp: code
            await authApi.register({ email, otp: code });
            router.replace("/(tabs)");
        } catch (err: any) {
            Alert.alert(
                "Invalid OTP",
                err?.response?.data?.message ?? "Please try again."
            );
            setOtp(Array(OTP_LENGTH).fill(""));
            inputs.current[0]?.focus();
            setActiveIdx(0);
        } finally {
            setLoading(false);
        }
    };



    const handleResend = async () => {
        if (!canResend) return;
        try {
            await authApi.sendOtp({ username, email, password, avatar });
            setSeconds(90);
            setCanResend(false);
            setOtp(Array(OTP_LENGTH).fill(""));
            inputs.current[0]?.focus();
            setActiveIdx(0);
        } catch (err: any) {
            Alert.alert(
                "Error",
                err?.response?.data?.message ?? "Failed to resend. Please try again."
            );
        }
    };

    const filled = otp.every((d) => d !== "");

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Navbar */}
            <View style={s.navbar}>
                <TouchableOpacity style={s.ibtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={C.green} />
                </TouchableOpacity>
                <Text style={s.navTitle}>Verification</Text>
                <View style={{ width: 36 }} />
            </View>

            <View style={s.body}>
                {/* Icon */}
                <View style={s.iconWrap}>
                    <Ionicons name="mail-outline" size={36} color={C.green} />
                </View>

                <Text style={s.title}>Enter OTP Code</Text>
                <Text style={s.subtitle}>We sent a 6-digit verification code to</Text>
                <Text style={s.email}>{email}</Text>

                {/* OTP boxes */}
                <View style={s.otpRow}>
                    {otp.map((digit, i) => (
                        <TouchableOpacity
                            key={i}
                            activeOpacity={0.8}
                            onPress={() => { inputs.current[i]?.focus(); setActiveIdx(i); }}
                        >
                            <View style={[s.otpBox, digit ? s.otpFilled : null, i === activeIdx ? s.otpActive : null]}>
                                <TextInput
                                    ref={(r) => { inputs.current[i] = r; }}
                                    style={s.otpInput}
                                    value={digit}
                                    onChangeText={(v) => handleChange(v, i)}
                                    onKeyPress={(e) => handleKeyPress(e, i)}
                                    onFocus={() => setActiveIdx(i)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    caretHidden
                                    selectTextOnFocus
                                />
                                {!digit && i === activeIdx && <View style={s.cursor} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Timer / Resend */}
                <View style={s.timerRow}>
                    {canResend ? (
                        <TouchableOpacity onPress={handleResend}>
                            <Text style={s.resend}>Resend Code</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <Text style={s.timerTxt}>Resend code in </Text>
                            <Text style={s.timerVal}>{timerLabel()}</Text>
                        </>
                    )}
                </View>

                {/* Verify button */}
                <TouchableOpacity
                    style={[s.btn, (!filled || loading) && s.btnDisabled]}
                    onPress={handleVerify}
                    disabled={!filled || loading}
                    activeOpacity={0.85}
                >
                    {loading
                        ? <ActivityIndicator color={C.green} />
                        : <Text style={[s.btnText, !filled && s.btnTextDim]}>Verify</Text>
                    }
                </TouchableOpacity>

                {/* Secure note */}
                <View style={s.secureRow}>
                    <Ionicons name="shield-checkmark-outline" size={13} color={C.border2} />
                    <Text style={s.secureTxt}>Secured with end-to-end encryption</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    navbar: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingVertical: 10, backgroundColor: C.bg,
        borderBottomWidth: 0.5, borderBottomColor: C.border
    },
    navTitle: { fontSize: 16, fontWeight: "700", color: C.white },
    ibtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: C.item,
        alignItems: "center", justifyContent: "center"
    },

    body: { flex: 1, backgroundColor: C.screen, alignItems: "center", paddingTop: 40, paddingHorizontal: 28 },
    iconWrap: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: C.item,
        borderWidth: 1.5, borderColor: C.border2,
        alignItems: "center", justifyContent: "center", marginBottom: 28
    },
    title: { fontSize: 24, fontWeight: "800", color: C.white, marginBottom: 10, letterSpacing: -0.3 },
    subtitle: { fontSize: 14, color: C.dim, marginBottom: 6, textAlign: "center" },
    email: { fontSize: 14, fontWeight: "700", color: C.green, marginBottom: 36 },

    otpRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
    otpBox: {
        width: 48, height: 60, borderRadius: 14, backgroundColor: C.card,
        borderWidth: 1.5, borderColor: C.border2,
        alignItems: "center", justifyContent: "center"
    },
    otpFilled: { backgroundColor: C.item, borderColor: C.green },
    otpActive: { borderColor: C.green, borderWidth: 2 },
    otpInput: {
        position: "absolute", width: "100%", height: "100%",
        textAlign: "center", fontSize: 24, fontWeight: "800",
        color: C.green, opacity: 1
    },
    cursor: { width: 2, height: 26, backgroundColor: C.green, borderRadius: 2 },

    timerRow: { flexDirection: "row", alignItems: "center", marginBottom: 32, marginTop: 4 },
    timerTxt: { fontSize: 13, color: C.dim },
    timerVal: { fontSize: 13, fontWeight: "700", color: C.green },
    resend: { fontSize: 13, fontWeight: "700", color: C.green, textDecorationLine: "underline" },

    btn: {
        width: "100%", padding: 16, borderRadius: 16,
        backgroundColor: C.green, alignItems: "center", marginBottom: 20
    },
    btnDisabled: { backgroundColor: C.item, borderWidth: 1.5, borderColor: C.border2 },
    btnText: { fontSize: 16, fontWeight: "800", color: C.bg },
    btnTextDim: { color: C.border2 },

    secureRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    secureTxt: { fontSize: 12, color: C.border2 },
});