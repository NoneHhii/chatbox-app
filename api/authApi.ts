import { User } from "@/types/input";
import axios from "axios";
import axiosClient from "./axiosClient";
import { socket } from "@/socket/config";


const authApi = {
    sendOtp({ username, email, password, avatar }: any) {
        const url = "/api/auth/register-request";
        const payload = {
            username: username,
            email: email,
            avatar: avatar,
            password: password,
        }
        return axiosClient.post(url, payload);
    },

    register({ email, otp }: any) {
        const url = '/api/auth/verify-register';
        const paload = {
            email,
            otp,
        }
        return axiosClient.post(url, paload);
    },

    login(email: string, password: string) {
        const url = '/api/auth/login';
        const payload = {
            email: email,
            password: password
        };
        return axiosClient.post(url, payload);
    },

    findUser(value: string) {
        const url = '/api/auth/find';
        const payload = {
            value: value
        };
        return axiosClient.post(url, payload);
    },

    logout() {
        const url = '/api/auth/logout';
        return axiosClient.post(url, {});
        // socket.disconnect();
    },
}

export default authApi;

// const formData = new FormData();
// formData.append('username', 'Khoa');
// formData.append('avatar', {
//     uri: imageUri, // Link ảnh từ ImagePicker
//     name: 'avatar.jpg',
//     type: 'image/jpeg',
// });
// // Gọi axios với header 'Content-Type': 'multipart/form-data'