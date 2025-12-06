import axios from "axios";
import { DOMAIN_BE, LOCALSTORAGE_USER } from "./Constants";
import { getLocalStorage } from "./Configs";

export const http = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json', // ✅ Đảm bảo có header này
    },
    timeout: 10000
});

http.interceptors.request.use(config => {
    const user = getLocalStorage(LOCALSTORAGE_USER);
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});