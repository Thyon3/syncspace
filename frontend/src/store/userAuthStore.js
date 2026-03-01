
import { create } from "zustand";
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import axios from "axios";

export const userAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    signUp: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signUp", data);
            set({ authUser: res.data });
            toast.success('Account created successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || "Sign up failed");
        }
        finally {
            set({ isSigningUp: false });
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
        } catch (error) {
            console.error(error);
            toast.error('Failed to logout');
        }
    },
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success('Logged in successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        }
        finally {
            set({ isLoggingIn: false });
        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            // Use FormData for profile pic
            const formData = new FormData();
            if (data.name) formData.append("name", data.name);
            if (data.bio !== undefined) formData.append("bio", data.bio);
            if (data.profilePic) formData.append("profilePic", data.profilePic);

            const res = await axiosInstance.put("/user/updateProfile", formData);
            if (res.data.success) {
                set({ authUser: res.data.user });
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    changePassword: async (data) => {
        try {
            const res = await axiosInstance.post("/user/change-password", data);
            toast.success(res.data.message);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
            return false;
        }
    },
    deleteAccount: async () => {
        try {
            const res = await axiosInstance.delete("/user/delete-account");
            set({ authUser: null });
            toast.success(res.data.message);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete account");
            return false;
        }
    },
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("auth/check");
            set({
                authUser: res.data.user
            });
        } catch (error) {
            console.log('Error in authCheck ', error);
            set({
                authUser: null
            })
        } finally {
            set({
                isCheckingAuth: false
            })
        }
    },
    getSessions: async () => {
        try {
            const res = await axiosInstance.get("/security/sessions");
            return res.data;
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            return [];
        }
    },
    terminateSession: async (sessionId) => {
        try {
            const res = await axiosInstance.delete(`/security/sessions/${sessionId}`);
            toast.success(res.data.message);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to terminate session");
            return false;
        }
    },
    terminateOtherSessions: async () => {
        try {
            const res = await axiosInstance.delete("/security/sessions/others");
            toast.success(res.data.message);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to terminate other sessions");
            return false;
        }
    },
    updatePrivacySettings: async (settings) => {
        try {
            const res = await axiosInstance.put("/user/privacy-settings", { privacySettings: settings });
            if (res.data.success) {
                set({ authUser: res.data.user });
                toast.success(res.data.message);
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update privacy settings");
            return false;
        }
    }
}));
