import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { userAuthStore } from "../store/userAuthStore";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import NoSelectedUserPlaceHolder from "./NoSelectedUserPlaceHolder";
import NoChatHistoryPlaceHolder from "./NoChatHistoryPlaceHolder";
import MessagesLoadingSkeleton from "./messagesLoadingSkeleton";
import TypingIndicator from "./TypingIndicator";
import { Check, CheckCheck } from "lucide-react";

function ChatContainer() {
    const {
        selectedUser,
        messages,
        isMessagesLoading,
        getMessages,
        subscribeToMessages,
        unsubscribeFromMessages,
        listenForTyping,
        stopListeningForTyping,
        markMessagesAsRead,
    } = useChatStore();

    const { authUser } = userAuthStore();
    const messageEndRef = useRef(null);

    useEffect(() => {
        if (selectedUser?._id) {
            getMessages(selectedUser._id);
            subscribeToMessages();
            listenForTyping();
        }

        return () => {
            unsubscribeFromMessages();
            stopListeningForTyping();
        };
    }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages, listenForTyping, stopListeningForTyping]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }

        // Mark unread messages as read
        if (messages && messages.length > 0 && selectedUser) {
            const unreadMessages = messages.filter(
                msg => msg.senderId === selectedUser._id && !msg.isRead
            );

            if (unreadMessages.length > 0) {
                const messageIds = unreadMessages.map(msg => msg._id);
                markMessagesAsRead(messageIds);
            }
        }
    }, [messages, selectedUser, markMessagesAsRead]);

    if (isMessagesLoading) {
        return <MessagesLoadingSkeleton />;
    }

    const formatMessageTime = (time) => {
        if (!time) return "";
        const date = new Date(time);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (time) => {
        if (!time) return "";
        const date = new Date(time);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
            });
        }
    };

    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach((message) => {
            const date = new Date(message.createdAt).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });
        return groups;
    };

    if (!selectedUser) {
        return <NoSelectedUserPlaceHolder />;
    }

    return (
        <div className="flex flex-col h-full bg-telegram-dark">
            {/* Chat Header */}
            <ChatHeader />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-telegram-dark">
                {messages && messages.length > 0 ? (
                    <div className="flex flex-col">
                        {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                            <div key={date}>
                                {/* Date Separator */}
                                <div className="flex items-center justify-center py-3">
                                    <div className="bg-telegram-active px-3 py-1 rounded-full">
                                        <span className="text-caption text-slate-400">
                                            {formatDate(new Date(date))}
                                        </span>
                                    </div>
                                </div>

                                {/* Messages for this date */}
                                {dateMessages.map((message, index) => {
                                    const isMe = message.senderId === authUser._id;
                                    const showTime = index === 0 ||
                                        new Date(dateMessages[index - 1].createdAt).getHours() !== new Date(message.createdAt).getHours();

                                    return (
                                        <div
                                            key={message._id}
                                            className="px-4 py-1"
                                        >
                                            <div className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-1`}>
                                                {/* Time display for consecutive messages */}
                                                {showTime && (
                                                    <span className={`text-caption text-slate-500 mb-2 ${isMe ? "order-2 mr-2" : "order-1 ml-2"
                                                        }`}>
                                                        {formatMessageTime(message.createdAt)}
                                                    </span>
                                                )}

                                                <div className={`${isMe ? "order-1" : "order-2"} max-w-[85%]`}>
                                                    <MessageBubble
                                                        message={message}
                                                        isOwnMessage={isMe}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        <div ref={messageEndRef} />
                    </div>
                ) : (
                    <NoChatHistoryPlaceHolder name={selectedUser.name} />
                )}
            </div>

            {/* Typing Indicator & Input */}
            <TypingIndicator />
            <MessageInput />
        </div>
    );
}

export default ChatContainer;
