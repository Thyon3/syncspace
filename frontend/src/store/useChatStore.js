import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { userAuthStore } from './userAuthStore';
import { getSocket } from '../hooks/useSocket';

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
    isTyping: false,
    typingUser: null,


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
            selectedUser,
            // Reset typing state when switching users
            isTyping: false,
            typingUser: null
        })
    },

    // Socket.IO methods
    subscribeToMessages: () => {
        const socket = getSocket();
        if (!socket) return;

        const { selectedUser } = get();
        if (!selectedUser) return;

        // Listen for new messages
        socket.on('newMessage', (newMessage) => {
            const { selectedUser, messages } = get();

            // Only add message if it's from the currently selected user
            if (newMessage.senderId === selectedUser._id || newMessage.recieverId === selectedUser._id) {
                set({
                    messages: [...messages, newMessage],
                    // Stop typing indicator when message received
                    isTyping: false,
                    typingUser: null
                });

                // Play sound if enabled
                if (get().isSoundEnabled) {
                    const audio = new Audio('/notification.mp3');
                    audio.play().catch(err => console.log('Audio play failed:', err));
                }
            }
        });

        console.log('📨 Subscribed to messages');

        // Listen for read receipts
        socket.on('messagesRead', ({ messageIds, readBy }) => {
            const { messages, selectedUser } = get();

            // Update messages status
            set({
                messages: messages.map(msg =>
                    messageIds.includes(msg._id)
                        ? { ...msg, isRead: true, readAt: new Date() }
                        : msg
                )
            });
            console.log('✅ Messages marked as read by', readBy);
        });
    },

    unsubscribeFromMessages: () => {
        const socket = getSocket();
        if (!socket) return;

        socket.off('newMessage');
        socket.off('messagesRead');
        console.log('📭 Unsubscribed from messages');
    },

    listenForTyping: () => {
        const socket = getSocket();
        if (!socket) return;

        const { selectedUser } = get();
        if (!selectedUser) return;

        socket.on('userTyping', ({ userId, isTyping }) => {
            // Only show typing if it's from the currently selected user
            if (userId === selectedUser._id) {
                set({
                    isTyping,
                    typingUser: isTyping ? selectedUser : null
                });
            }
        });

        console.log('👀 Listening for typing');
    },

    stopListeningForTyping: () => {
        const socket = getSocket();
        if (!socket) return;

        socket.off('userTyping');
        console.log('🙈 Stopped listening for typing');
    },

    emitTyping: (isTyping) => {
        const socket = getSocket();
        const { selectedUser } = get();

        if (!socket || !selectedUser) return;

        socket.emit('typing', {
            receiverId: selectedUser._id,
            isTyping
        });
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

    , markMessagesAsRead: async (messageIds) => {
        try {
            await axiosInstance.post('/messages/read', { messageIds });

            // Update local state immediately
            const { messages } = get();
            set({
                messages: messages.map(msg =>
                    messageIds.includes(msg._id)
                        ? { ...msg, isRead: true }
                        : msg
                )
            });
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
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
                senderId: authUser._id,
                recieverId: selectedUser._id,
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

            // Replace optimistic message with real one
            set({
                messages: messages.filter(m => m._id !== tempId).concat(result.data),
            });

        } catch (error) {
            console.log(error);
            toast.error(
                error.response?.data?.message ??
                "Something went wrong while sending your message"
            );
            // Remove optimistic message on error
            const { messages } = get();
            set({
                messages: messages.filter(m => !m.isOptimistic)
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