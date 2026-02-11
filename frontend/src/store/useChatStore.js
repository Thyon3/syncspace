import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { userAuthStore } from './userAuthStore';
export const useChatStore = create((set, get) => ({

    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    isUserLoading: false,
    isChatLoading: false,
    isMessageLoading: false,
    isSendinMessageLoading: false,
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



    getMessagesById: async (userId) => {
        set({ isMessageLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/user/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message ?? 'something went wrong');
        } finally {
            set({ isMessageLoading: false });
        }
    }


    // send messages to a user 
    , sendMessage: async (messageData) => {
        set({ isSendinMessageLoading: true });
        try {
            const { selectedUser, messages } = get();
            const { authUser } = userAuthStore.getState();

            // If messageData contains image as a file or base64, use FormData
            const formData = new FormData();
            if (messageData.text) formData.append("text", messageData.text);
            if (messageData.image) formData.append("image", messageData.image);

            // optmistic update the ui immediately after the user sends the message 

            const tempId = `${Date.now()}`;
            const mockMessage = {
                _id: tempId,
                senderId: selectedUser._id,
                recieverId: authUser._id,
                text: messageData.text,
                image: messageData.image,
                createdAt: new Date().toISOString(),
                isOptimistic: true
            };
            set({
                messages: [...messages, mockMessage]
            });

            const result = await axiosInstance.post(
                `/messages/user/${selectedUser._id}/send`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Correct variable name and update state
            set({
                messages: [...messages, result.data],
            });

        } catch (error) {
            console.log(error);
            toast.error(
                error.response?.data?.message ??
                "Something went wrong while sending your message"
            );
            set({
                messages: messages
            })
        } finally {
            set({ isSendinMessageLoading: false });
        }
    }


    // ge, t all contacts 
    ,
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