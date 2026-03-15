import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import google from '../assets/images/google.png';
import logo from '../assets/images/logo.png';

const OnBoarding = () => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>

                <View style={{ justifyContent: 'space-between' }}>
                    <View>
                        <View style={styles.box}>
                            <Image source={logo} />
                            <Text style={{ color: 'white', fontSize: 68, marginHorizontal: 10, marginVertical: 10 }}>
                                Connect friends <Text style={{ fontWeight: 'bold' }}>easily & quickly</Text>
                            </Text>
                            <Text style={{ color: 'white', marginHorizontal: 10 }}>
                                Our chat app is the perfect way to stay connected with friends and family.
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
                                    <FontAwesome5 name="apple" size={24} color="white" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 30,
                            }}
                        >
                            <View style={styles.line}></View>

                            <Text style={{ color: 'white' }}>OR</Text>

                            <View style={styles.line}></View>
                        </View>
                    </View>

                    <View>
                        <View style={[styles.flex_box, { marginVertical: 8 }]}>
                            <TouchableOpacity
                                style={styles.btn}
                                onPress={() => router.push('/signup')}
                            >
                                <Text style={{ textAlign: 'center' }}>Đăng ký với gmail</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.flex_box}>
                            <Text style={{ color: '#B9C1BE' }}>Đã có tài khoản?</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/login')}
                            >
                                <Text style={{ color: 'white', marginLeft: 4 }}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },

    box: {
        alignItems: 'center',
    },

    social_box: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50,
        marginVertical: 30,
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
        borderRadius: 21,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderWidth: 1,
        borderColor: 'white'
    },

    line: {
        borderWidth: 0.5,
        flex: 1,
        height: 0,
        borderColor: '#CDD1D0',
        marginHorizontal: 8
    },

    btn: {
        padding: 8,
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 15
    },

    flex_box: {
        flexDirection: 'row',
        justifyContent: 'center',

    },

    link: { color: 'white', marginLeft: 4 }
})

export default OnBoarding;