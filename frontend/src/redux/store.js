import { configureStore } from "@reduxjs/toolkit";
import UserReducer from '../redux/reducers/UserReducer'; // Đảm bảo dùng đúng tên và đường dẫn


export const store = configureStore({
    reducer: {
        user: UserReducer,
    },
});

