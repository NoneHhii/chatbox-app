import AsyncStorage from "@react-native-async-storage/async-storage";
import { io as ioClient } from "socket.io-client";
const io: typeof ioClient = require("socket.io-client/dist/socket.io.js");

// const SOCKET_URL = "http://10.165.187.222:5000";
// const SOCKET_URL = "http://192.168.1.199:5000";
const SOCKET_URL = "https://be-chatbox-1.onrender.com";

const token = AsyncStorage.getItem('token');

export const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    auth: {
        token: token // Token Khoa lấy từ AsyncStorage hoặc Store
    }
})