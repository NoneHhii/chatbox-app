import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { logout } from "@/redux/slices/AuthSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuth = () => {
    const dispatch = useAppDispatch();

    const { user, token, isLoading } = useAppSelector((state) => state.auth);

    const signOut = () => {
        dispatch(logout());
        AsyncStorage.setItem("token", "");
    }

    return { user, token, signOut, isLoading };
}