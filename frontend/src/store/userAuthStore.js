
import { create } from "zustand";
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import axios from "axios";

export const userAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,

    signUp: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signUp", data);
            set({ authUser: res.data });
            toast.success('Account created Succesfully');
        } catch (error) {
            toast.error(error.response.data.message);
        }
        finally {
            set({ isSigningUp: false });
        }
    },
    logout: async () => {
        try {
            const res = await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("logged out successfully");
        } catch (error) {
            console.error(error);
            toast.error('failed to logou');
        }
    }

    ,
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success('Logged in Succesfully');
        } catch (error) {
            toast.error(error.response.data.message);
        }
        finally {
            set({ isLoggingIn: false });
        }
    },
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("auth/check");
            set({
                authUser: res.data
            });
            // show a toast for the user 
            toast.success('account created succssfully');

        } catch (error) {
            console.log('Error in authCkeck ', error);
            set({
                authUser: null
            })
        } finally {
            set({
                isCheckingAuth: false
            })
        }
    }
})); 