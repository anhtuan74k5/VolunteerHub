import { createSlice } from "@reduxjs/toolkit";

const LOCALSTORAGE_USER = "user";

const initialState = {
    user: JSON.parse(localStorage.getItem(LOCALSTORAGE_USER)) || null,
    token: JSON.parse(localStorage.getItem(LOCALSTORAGE_USER))?.accessToken || null,
    isLoggedIn: !!localStorage.getItem(LOCALSTORAGE_USER),
    showLogin: false,
    showRegister: false,
};

const UserReducer = createSlice({
    name: "user",
    initialState,
    reducers: {
        openLogin: (state) => {
            state.showLogin = true;
            state.showRegister = false;
        },
        openRegister: (state) => {
            state.showLogin = false;
            state.showRegister = true;
        },
        closeModal: (state) => {
            state.showLogin = false;
            state.showRegister = false;
        },

        loginSuccess: (state, action) => {
            state.isLoggedIn = true;
            state.user = action.payload.user;
            state.token = action.payload.token || null;
            state.showLogin = false;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
            state.token = null;
        },

        registerSuccess: (state) => {
            state.showRegister = false;
            state.showLogin = true;
        },


        updateProfile: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
    },
});

export const {
    openLogin,
    openRegister,
    closeModal,
    loginSuccess,
    logout,
    registerSuccess,
    updateProfile,
} = UserReducer.actions;

export default UserReducer.reducer;
