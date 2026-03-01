import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { userAuthStore } from './userAuthStore';
import { getSocket } from '../hooks/useSocket';

export const useChatStore = create((set, get) => ({

    allContacts: [],
    chats: [],
    messages: [],
    onlineUsers: [],
    activeTab: "chats",
    isUserLoading: false,
    isChatLoading: false,
    isMessageLoading: false,
    isSendinMessageLoading: false,
    isContactLoading: false,
    isSearchLoading: false,
    searchResults: { messages: [], users: [], groups: [] },
    drafts: {}, // { chatId: text }
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",
    selectedUser: null,
    selectedChat: null,
    isTyping: false,
    typingUser: null,
    replyingTo: null,
    editingMessage: null,


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
            selectedChat: null, // Clear selected chat when selecting user (legacy mode or new 1:1)
            // Reset typing state when switching users
            isTyping: false,
            typingUser: null
        })
    },
    setSelectedChat: (selectedChat) => {
        set({
            selectedChat,
            selectedUser: null,
            // Reset typing state
            isTyping: false,
            typingUser: null,
            replyingTo: null,
            editingMessage: null
        })
    },
    setReplyingTo: (message) => set({ replyingTo: message, editingMessage: null }),
    setEditingMessage: (message) => set({ editingMessage: message, replyingTo: null }),

    // Socket.IO methods
    subscribeToMessages: () => {
        const socket = getSocket();
        if (!socket) return;

        const { selectedUser } = get();
        if (!selectedUser) return;

        // Listen for new messages
        socket.on('newMessage', (newMessage) => {
            const { selectedUser, selectedChat, messages } = get();

            // Check if message belongs to current chat context
            const isTargeted = selectedChat
                ? (newMessage.chatId?._id === selectedChat._id || newMessage.chatId === selectedChat._id)
                : (newMessage.senderId === selectedUser?._id || newMessage.recieverId === selectedUser?._id);

            if (isTargeted) {
                set({
                    messages: [...messages, newMessage],
                    isTyping: false,
                    typingUser: null
                });

                if (get().isSoundEnabled) {
                    const audio = new Audio('/notification.mp3');
                    audio.play().catch(err => console.log('Audio play failed:', err));
                }
            }
        });

        // Listen for edited messages
        socket.on('messageEdited', (updatedMessage) => {
            const { messages } = get();
            set({
                messages: messages.map(m => m._id === updatedMessage._id ? updatedMessage : m)
            });
        });

        // Listen for deleted messages
        socket.on('messageDeleted', ({ messageId, chatId }) => {
            const { messages } = get();
            set({
                messages: messages.map(m => m._id === messageId ? { ...m, isDeleted: true, text: "Message deleted", image: null, fileUrl: null } : m)
            });
        });

        // Listen for message reactions
        socket.on('messageReaction', ({ messageId, reactions }) => {
            const { messages } = get();
            set({
                messages: messages.map(m => m._id === messageId ? { ...m, reactions } : m)
            });
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

        // Listen for pinned messages updates
        socket.on('chatPinnedUpdated', (updatedChat) => {
            const { selectedChat, chats } = get();

            // Update the chats list
            set({
                chats: chats.map(c => c._id === updatedChat._id ? updatedChat : c)
            });

            // Update selected chat if it's the one that was updated
            if (selectedChat?._id === updatedChat._id) {
                set({ selectedChat: updatedChat });
            }
        });

        // Listen for online users
        socket.on('getOnlineUsers', (userIds) => {
            set({ onlineUsers: userIds });
        });

        // Listen for draft updates (cross-device sync)
        socket.on('draftUpdated', ({ chatId, text }) => {
            const { drafts } = get();
            set({
                drafts: { ...drafts, [chatId]: text }
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = getSocket();
        if (!socket) return;

        socket.off('newMessage');
        socket.off('messagesRead');
        socket.off('getOnlineUsers');
        socket.off('messageReaction');
        socket.off('messageEdited');
        socket.off('messageDeleted');
        socket.off('chatPinnedUpdated');
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
    },

    getMessagesByChatId: async (chatId) => {
        set({ isMessageLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/chat/${chatId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message ?? 'something went wrong');
        } finally {
            set({ isMessageLoading: false });
        }
    },

    createGroup: async (groupData) => {
        try {
            const res = await axiosInstance.post('/chats/create-group', groupData);
            set((state) => ({
                chats: [res.data, ...state.chats], // Prepend new group
                selectedChat: res.data, // Select it immediately
                selectedUser: null
            }));
            toast.success("Group created successfully");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message ?? "Failed to create group");
            throw error;
        }
    },

    searchMessages: async (query, chatId = null) => {
        set({ isSearchLoading: true });
        try {
            const url = chatId ? `/messages/search?query=${query}&chatId=${chatId}` : `/messages/search?query=${query}`;
            const res = await axiosInstance.get(url);
            set((state) => ({
                searchResults: { ...state.searchResults, messages: res.data }
            }));
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message ?? "Search failed");
        } finally {
            set({ isSearchLoading: false });
        }
    },

    searchContacts: async (query) => {
        set({ isSearchLoading: true });
        try {
            const res = await axiosInstance.get(`/chats/search?query=${query}`);
            set((state) => ({
                searchResults: {
                    ...state.searchResults,
                    users: res.data.users,
                    groups: res.data.groups
                }
            }));
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message ?? "Search failed");
        } finally {
            set({ isSearchLoading: false });
        }
    },

    clearSearchResults: () => {
        set({ searchResults: { messages: [], users: [], groups: [] } });
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
    },

    editMessage: async (messageId, text) => {
        try {
            const res = await axiosInstance.patch(`/messages/${messageId}`, { text });
            const { messages } = get();
            set({
                messages: messages.map(m => m._id === messageId ? res.data : m),
                editingMessage: null
            });
            toast.success("Message updated");
        } catch (error) {
            toast.error(error.response?.data?.message ?? "Failed to edit message");
        }
    },

    deleteMessage: async (messageId) => {
        try {
            await axiosInstance.delete(`/messages/${messageId}`);
            const { messages } = get();
            set({
                messages: messages.map(m => m._id === messageId ? { ...m, isDeleted: true, text: "Message deleted", image: null, fileUrl: null } : m)
            });
            toast.success("Message deleted");
        } catch (error) {
            toast.error(error.response?.data?.message ?? "Failed to delete message");
        }
    },

    toggleReaction: async (messageId, emoji) => {
        try {
            const res = await axiosInstance.post('/messages/reaction', { messageId, emoji });
            const { messages } = get();
            set({
                messages: messages.map(m => m._id === messageId ? res.data : m)
            });
        } catch (error) {
            console.error("Error toggling reaction:", error);
            // No toast for reactions usually, or a subtle one
        }
    },

    pinMessage: async (chatId, messageId) => {
        try {
            const res = await axiosInstance.post('/chats/pin', { chatId, messageId });
            set({ selectedChat: res.data });
            toast.success("Message pinned");
        } catch (error) {
            toast.error(error.response?.data?.message ?? "Failed to pin message");
        }
    },

    unpinMessage: async (chatId, messageId) => {
        try {
            const res = await axiosInstance.post('/chats/unpin', { chatId, messageId });
            set({ selectedChat: res.data });
            toast.success("Message unpinned");
        } catch (error) {
            toast.error(error.response?.data?.message ?? "Failed to unpin message");
        }
    },

    // send messages to a user 
    sendMessage: async (messageData) => {
        set({ isSendinMessageLoading: true });
        try {
            const { selectedUser, selectedChat, messages, replyingTo } = get();
            const { authUser } = userAuthStore.getState();

            // If messageData contains image as a file or base64, use FormData
            const formData = new FormData();
            if (messageData.text) formData.append("text", messageData.text);
            if (messageData.image) formData.append("image", messageData.image);
            if (messageData.fileUrl) formData.append("fileUrl", messageData.fileUrl);
            if (messageData.fileType) formData.append("fileType", messageData.fileType);
            if (messageData.fileName) formData.append("fileName", messageData.fileName);
            if (messageData.fileSize) formData.append("fileSize", messageData.fileSize);
            if (replyingTo) formData.append("replyTo", replyingTo._id);
            if (messageData.isSilent) formData.append("isSilent", messageData.isSilent);

            // Add chatId if selectedChat is present
            if (selectedChat) {
                formData.append("chatId", selectedChat._id);
            }

            // optmistic update the ui immediately after the user sends the message 
            const tempId = `${Date.now()}`;
            const mockMessage = {
                _id: tempId,
                senderId: authUser._id,
                text: messageData.text,
                image: messageData.image,
                fileUrl: messageData.fileUrl,
                fileType: messageData.fileType,
                fileName: messageData.fileName,
                fileSize: messageData.fileSize,
                replyTo: replyingTo,
                isSilent: messageData.isSilent,
                createdAt: new Date().toISOString(),
                isOptimistic: true
            };
            set({
                messages: [...messages, mockMessage],
                replyingTo: null // Clear reply state after sending
            });

            // Determine URL: if selectedChat, use generic send (or we need a new route?)
            // We modified sendMessage controller to handle chatId in body.
            // But we were using `/messages/user/:userId/send`.
            // If group, which userId?
            // "recieverId" is optional in controller if chatId present.
            // But the ROUTE expects `/user/:userId/send`.
            // We need to fix the ROUTE or use a dummy ID for groups?
            // OR preferrably: POST /messages/send (generic)

            // Wait, I didn't create a generic send route.
            // I only modified `sendMessage` controller.
            // But `message.route.js` has: `router.post("/user/:userId/send", ... sendMessage)`
            // I should have created `router.post("/send", ...)` ?
            // I'll assume for now I use a hack or I need to update rout.
            // Hack: use any ID for userId param if selectedChat is present?
            // Or better: Update message.route.js to add `/send` generic endpoint.

            // I will update message.route.js in next step. For now I'll use a standard path and assume I'll fix the route.
            let url;
            if (selectedUser) {
                url = `/messages/user/${selectedUser._id}/send`;
            } else if (selectedChat) {
                // We need a route for this.
                // Let's use a "send" route on the chat or message router.
                // I will add `router.post('/send', ...)` to message.route.js
                url = `/messages/send`;
            }

            const result = await axiosInstance.post(
                url,
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
            // Fetch Chats (Groups + Directs) from new endpoint
            const res = await axiosInstance.get('/chats'); // endpoint from chat.route.js
            const chats = res.data;
            const authUser = userAuthStore.getState().authUser;

            // Populate drafts for the current user
            const drafts = {};
            chats.forEach(chat => {
                const userDraft = chat.draftMessages?.find(d => d.userId === authUser?._id || d.userId?._id === authUser?._id);
                if (userDraft?.text) {
                    drafts[chat._id] = userDraft.text;
                }
            });

            set({
                chats,
                drafts
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
    },

    forwardMessages: async (messageId, targetChatIds, hideSender = false) => {
        try {
            const res = await axiosInstance.post("/messages/forward", { messageId, targetChatIds, hideSender });
            toast.success("Messages forwarded");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to forward messages");
            throw error;
        }
    },

    toggleArchive: async (chatId) => {
        try {
            const res = await axiosInstance.post("/chats/archive", { chatId });
            const { chats, selectedChat } = get();
            const updatedChat = res.data.chat;

            set({
                chats: chats.map(c => c._id === chatId ? updatedChat : c),
                selectedChat: selectedChat?._id === chatId ? updatedChat : selectedChat
            });
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to archive/unarchive chat");
        }
    },

    toggleMute: async (chatId, muteUntil = null) => {
        try {
            const res = await axiosInstance.post("/chats/mute", { chatId, muteUntil });
            const { chats, selectedChat } = get();
            const updatedChat = res.data.chat;

            set({
                chats: chats.map(c => c._id === chatId ? updatedChat : c),
                selectedChat: selectedChat?._id === chatId ? updatedChat : selectedChat
            });
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to mute/unmute chat");
        }
    },

    saveDraft: async (chatId, text) => {
        try {
            // Optimistic update
            const { drafts } = get();
            set({ drafts: { ...drafts, [chatId]: text } });

            await axiosInstance.post("/chats/draft", { chatId, text });
        } catch (error) {
            console.error("Failed to save draft:", error);
        }
    },

})); 