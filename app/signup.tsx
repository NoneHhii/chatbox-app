import authApi from "@/api/authApi"
import FloatingLabelInput from "@/components/FloatingLabelInput"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const checkRegexAll = (type: string, value: string) => {
        let regex;

        switch (type) {
            case 'name':
                regex = /^[a-zA-ZÀ-ỹ\s]+$/;
                break;
            case 'email':
                regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
                break;
            case 'password':
                regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                break;
            default:
                return "";

        }

        return regex.test(value);
    }

    const checkActive = useMemo(() => {
        if (!name || !email || !password || !confirmPassword) return false;

        const values = [
            { type: 'name', value: name },
            { type: 'email', value: email },
            { type: 'password', value: password },
        ];

        const regexPass = values.every(v => checkRegexAll(v.type, v.value));
        if (!regexPass) return false

        if (password.trim() !== confirmPassword.trim()) return false;
        return true;
    }, [email, name, password, confirmPassword]);

    const handleRegister = async () => {
        setLoading(true);
        try {
            const payload = {
                username: name,
                password: password,
                email: email,
                avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${name}`,
            }
            const data = await authApi.sendOtp(payload);
            if (data) {
                console.log(data);

                router.push({
                    pathname: "/otpVerify", params: {
                        username: name,
                        password: password,
                        email: email,
                        avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${name}`,
                    }
                });
            }

        } catch (error) {
            console.error("Register failure!", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={{ paddingLeft: 8 }}>
                    <Ionicons name="arrow-back-outline" size={20} color="black" onPress={() => router.back()} />
                </View>
                <View style={styles.box}>
                    <Text
                        style={{ fontWeight: 'bold', fontSize: 18 }}
                    >
                        Đăng ký với <Text>Email</Text>
                    </Text>

                    <Text style={{ textAlign: 'center', color: '#797C7B', margin: '5%' }}>
                        Hãy bắt đầu trò chuyện với bạn bè và gia đình ngay hôm nay bằng cách đăng ký ứng dụng trò chuyện của chúng tôi!
                    </Text>
                </View>
                <View style={{ marginTop: 20 }}>
                    <FloatingLabelInput
                        label="Your Name"
                        value={name}
                        onChangText={setName}
                        type="name"
                    />
                    <FloatingLabelInput
                        label="Your Email"
                        value={email}
                        onChangText={setEmail}
                        type="email"
                    />
                    <FloatingLabelInput
                        label="Your Password"
                        value={password}
                        onChangText={setPassword}
                        type="password"
                    />
                    <FloatingLabelInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangText={setConfirmPassword}
                        type="confirmPassword"
                        checkConfirmPass={(val) => val === password}
                    />
                </View>

            </ScrollView>
            <View style={{ marginTop: 30, paddingBottom: 20, alignItems: 'center' }}>
                <TouchableOpacity
                    disabled={!checkActive}
                    style={[
                        styles.btn,
                        checkActive && styles.btn_active
                    ]}
                    onPress={() => handleRegister()}
                >
                    {loading ? (
                        <ActivityIndicator size={24} color={"#fff"} />
                    ) : (
                        <Text
                            style={[
                                styles.text_btn,
                                checkActive && styles.text_btnActive
                            ]}
                        >
                            Tạo tài khoản
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={[styles.flex_box, { marginVertical: 10 }]}>
                    <Text style={{ fontSize: 12 }}>Đã có tài khoản?</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/login')}
                    >
                        <Text style={{ fontSize: 12, marginLeft: 4, fontWeight: 'bold' }}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },

    box: {
        alignItems: 'center',
    },

    input_box: {
        position: 'relative',
        alignItems: 'center',
    },

    input: {
        borderBottomWidth: 1,
        width: '85%',
        borderColor: '#CDD1D0',
        // paddingVertical: 10,
        // fontSize: 16
    },

    input_label: {
        color: '#797C7B',
        position: 'absolute',
        display: 'flex',
        top: '25%',
        left: '10%',
    },

    btn: {
        backgroundColor: '#F3F6F6',
        width: '85%',
        paddingVertical: 8,
        borderRadius: 12,
    },

    btn_active: {
        backgroundColor: '#24786D'
    },

    text_btn: {
        color: '#797C7B',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },

    text_btnActive: {
        color: 'white'
    },

    flex_box: {
        flexDirection: 'row',
        justifyContent: 'center',

    },
})

export default Signup;