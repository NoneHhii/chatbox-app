import { User } from "@/types/input";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: User | null,
    token: string | null,
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: true
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null
            state.token = null
        }
    }
})

export const { loginSuccess, logout, setAuth, updateUser, setLoading } = authSlice.actions
export default authSlice.reducer