import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://be-chatbox-1.onrender.com/",
    // baseURL: "http://192.168.1.199:5000/",
    // baseURL: "http://10.165.187.222:5000/",
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(async config => {
    const token = await AsyncStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default axiosClient;