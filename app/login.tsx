import FloatingLabelInput from "@/components/FloatingLabelInput"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import google from '../assets/images/google.png'

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const checkRegexAll = (type: string, value: string) => {
        let regex;

        switch (type) {
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
        if (!email || !password) return false;

        const values = [
            { type: 'email', value: email },
            { type: 'password', value: password },
        ];

        const regexPass = values.every(v => checkRegexAll(v.type, v.value));
        if (!regexPass) return false
        return true;
    }, [email, password])

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
                        Đăng nhập
                    </Text>

                    <Text style={{ textAlign: 'center', color: '#797C7B', margin: '5%', marginTop: 8 }}>
                        Chào mừng bạn quay lại! Hãy đăng nhập bằng tài khoản mạng xã hội hoặc email của bạn để tiếp tục.
                    </Text>
                </View>

                <View style={styles.social_box}>
                    <TouchableOpacity style={styles.circle_social}>
                        <View style={styles.white_social}>
                            <FontAwesome5 name="facebook-f" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.circle_social}>
                        <Image source={google} style={{ width: 20, height: 21 }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.circle_social}>
                        <View style={{ backgroundColor: 'transparent', width: 24, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesome5 name="apple" size={24} color="black" />
                        </View>
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '5%',
                    }}
                >
                    <View style={styles.line}></View>

                    <Text>OR</Text>

                    <View style={styles.line}></View>
                </View>

                <View style={{ marginTop: 20 }}>
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
                </View>

            </ScrollView>
            <View style={{ paddingBottom: 30, alignItems: 'center' }}>
                <TouchableOpacity
                    disabled={!checkActive}
                    style={[
                        styles.btn,
                        checkActive && styles.btn_active
                    ]}
                    onPress={() => router.push('/(tabs)')}
                >
                    <Text
                        style={[
                            styles.text_btn,
                            checkActive && styles.text_btnActive
                        ]}
                    >
                        Đăng nhập
                    </Text>
                </TouchableOpacity>

                <View style={[styles.flex_box, { marginVertical: 10 }]}>
                    <TouchableOpacity
                        onPress={() => router.push('/signup')}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                marginLeft: 4,
                                fontWeight: 'bold',
                                color: '#797C7B'
                            }}
                        >
                            Quên mật khẩu?
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.flex_box, { marginVertical: 10 }]}>
                    <Text style={{ fontSize: 12 }}>Chưa có tài khoản?</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/signup')}
                    >
                        <Text style={{ fontSize: 12, marginLeft: 4, fontWeight: 'bold' }}>Đăng ký</Text>
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

    social_box: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        marginVertical: 10,
    },

    white_social: {
        backgroundColor: 'blue',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
    },

    circle_social: {
        backgroundColor: 'transparent',
        borderRadius: 24,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderWidth: 1,
        borderColor: 'black',
        zIndex: 10,
    },

    line: {
        borderWidth: 0.5,
        flex: 1,
        height: 0,
        borderColor: '#CDD1D0',
        marginHorizontal: '6%'
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

export default Login;