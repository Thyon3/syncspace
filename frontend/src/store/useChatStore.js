import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { userAuthStore } from './userAuthStore';

export const useChatStore = create((set, get) => ({

    allContacts: [],
    chats: [],
    activeTab: "chats",
    isUserLoading: false,
    isChatLoading: false,
    isMessageLoading: false,
    isContactLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",
    selectedUser: null,


    // toggle the sound preference of the user 

    toggleSound: async function () {
        localStorage.setItem('isSoundEnabled', !get().isSoundEnabled);
        set({
            isSoundEnabled: !get().isSoundEnabled
        })
    }
    ,
    // set active tab 

    setActiveTab: (tab) => {
        set({
            activeTab: tab
        })
    },
    setSelectedUser: (selectedUser) => {
        set({
            selectedUser
        })
    },
    // get all contacts 

    getAllContacts: async () => {
        // set the contacts state to loading 
        set({
            isContactLoading: true
        });
        try {
            const contacts = await axiosInstance.get('/messages/contacts');
            set({
                allContacts: contacts.data
            }
            )

        } catch (error) {
            toast.error(error.response?.data?.message ?? 'something went wrong ');
        } finally {
            set({
                isContactLoading: false
            })
        }
    },

    getAllChats: async () => {
        set({
            isChatLoading: true
        })
        try {
            const res = await axiosInstance.get('/messages/chats');
            set({
                chats: res.data
            })
        } catch (error) {
            toast.error(error.response?.data?.message ?? 'something went wrong');
        } finally {
            set({
                isChatLoading: false
            })

        }
    }, updateProfile: async (data) => {
        try {
            const authUser = userAuthStore.getState().authUser;

            console.log("Current authUser:", authUser);

            const res = await axiosInstance.put("/user/updateProfile", data);


            userAuthStore.setState({ authUser: res.data });

            toast.success('Profile updated successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message ?? 'Could not update profile, something went wrong');
        }
    }

})); 