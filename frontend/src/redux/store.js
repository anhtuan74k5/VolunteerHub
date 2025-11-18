import { configureStore } from "@reduxjs/toolkit";
import UserReducer from '../redux/reducers/UserReducer';


export const store = configureStore({
    reducer: {
        user: UserReducer,
    },
});

