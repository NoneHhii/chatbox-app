import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/redux/hooks";
import { setAuth, setLoading } from "@/redux/slices/AuthSlice";
import { socket } from "@/socket/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import SplashScreen from "./SplashScreen";

const AppContent = () => {
    const { user, isLoading } = useAuth();
    const dispatch = useAppDispatch();
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storageUser = await AsyncStorage.getItem("user");
                const storageToken = await AsyncStorage.getItem("token");

                if (storageUser && storageToken) {
                    const parsedUser = JSON.parse(storageUser);
                    if (parsedUser) {
                        dispatch(setAuth({ user: parsedUser, token: storageToken }));
                    } else {
                        dispatch(setLoading(false));
                    }
                } else {
                    dispatch(setLoading(false));
                }
            } catch (error) {
                dispatch(setLoading(false));
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        if (!user) router.replace("/login");
        else router.replace("/(tabs)");
    }, [user, isLoading]);

    useEffect(() => {
        const connectRealtime = async () => {
            const token = await AsyncStorage.getItem("token");

            if (user?.user_id && token) {
                socket.auth = { token };

                if (!socket.connected) {
                    socket.connect();
                }
            }
        };

        connectRealtime();

        return () => {
            socket.disconnect();
        };
    }, [user]);

    if (isLoading) {
        return (
            <SplashScreen />
        );
    }



    return (
        <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="search-screen" options={{ headerShown: false }} />
            <Stack.Screen name="requests-screen" options={{ headerShown: false }} />
            <Stack.Screen name="chat-room" options={{ headerShown: false }} />
            <Stack.Screen name="otpVerify" options={{ headerShown: false }} />
            <Stack.Screen name="call-screen" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            {isLoading && <SplashScreen />}
        </Stack>
    )
}

export default AppContent;
