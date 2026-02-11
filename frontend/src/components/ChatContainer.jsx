import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { userAuthStore } from "../store/userAuthStore";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import NoSelectedUserPlaceHolder from "./NoSelectedUserPlaceHolder";
import NoChatHistoryPlaceHolder from "./NoChatHistoryPlaceHolder";
import MessagesLoadingSkeleton from "./messagesLoadingSkeleton";
import { Check, CheckCheck } from "lucide-react";

function ChatContainer() {
    const {
        selectedUser,
        messages,
        isMessagesLoading,
        getMessages,
        subscribeToMessages,
        unsubscribeFromMessages,
    } = useChatStore();

    const { authUser } = userAuthStore();
    const messageEndRef = useRef(null);

    useEffect(() => {
        if (selectedUser?._id) {
            getMessages(selectedUser._id);
            subscribeToMessages();
        }

        return () => unsubscribeFromMessages();
    }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

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
                                            className={`flex ${isMe ? "justify-end" : "justify-start"} px-4 py-1`}
                                        >
                                            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isMe ? "order-2" : "order-1"}`}>
                                                <div className="flex items-end gap-1">
                                                    {/* Time display for consecutive messages */}
                                                    {showTime && (
                                                        <span className={`text-caption text-slate-500 mb-1 ${isMe ? "order-2 mr-2" : "order-1 ml-2"
                                                            }`}>
                                                            {formatMessageTime(message.createdAt)}
                                                        </span>
                                                    )}

                                                    {/* Message bubble */}
                                                    <div
                                                        className={`${isMe
                                                                ? "telegram-message-bubble-sent"
                                                                : "telegram-message-bubble-received"
                                                            } ${showTime ? "" : (isMe ? "mr-8" : "ml-8")}`}
                                                    >
                                                        {/* Message text */}
                                                        {message.text && (
                                                            <p className="text-message break-words">
                                                                {message.text}
                                                            </p>
                                                        )}

                                                        {/* Message image */}
                                                        {message.image && (
                                                            <img
                                                                src={message.image}
                                                                alt="Message image"
                                                                className="rounded-lg max-w-full h-auto mb-1"
                                                                loading="lazy"
                                                            />
                                                        )}

                                                        {/* Message status and time for sent messages */}
                                                        {isMe && (
                                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                                <span className="text-xs text-white/70">
                                                                    {formatMessageTime(message.createdAt)}
                                                                </span>
                                                                {message.isRead ? (
                                                                    <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                                                                ) : (
                                                                    <Check className="w-3.5 h-3.5 text-white/70" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
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

            {/* Message Input */}
            <MessageInput />
        </div>
    );
}

export default ChatContainer;
