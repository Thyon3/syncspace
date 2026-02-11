import React, { useEffect, useRef } from "react";
import MessagesLoadingSkeleton from "../components/messagesLoadingSkeleton";
import { useChatStore } from "../store/useChatStore";
import { userAuthStore } from "../store/userAuthStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceHolder";
import MessageInput from "./MessageInput";
import { Check, CheckCheck } from "lucide-react";

function ChatContainer() {
    const { selectedUser, isMessageLoading, getMessagesById, messages } = useChatStore();
    const { authUser } = userAuthStore();

    const messageEndRef = useRef(null);

    useEffect(() => {
        if (selectedUser?._id) {
            getMessagesById(selectedUser._id);
        }
    }, [selectedUser, getMessagesById]);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isMessageLoading) return <MessagesLoadingSkeleton />;

    const formatMessageTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const MessageBubble = ({ message, isMe }) => {
        return (
            <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4 fade-in`}>
                {!isMe && (
                    <div className="flex-shrink-0 mr-3">
                        <img
                            src={selectedUser?.profilePic || "/vite.svg"}
                            alt={selectedUser?.name}
                            className="w-8 h-8 rounded-full border border-slate-600"
                        />
                    </div>
                )}

                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isMe ? "order-2" : "order-1"}`}>
                    <div
                        className={`relative px-4 py-2.5 rounded-2xl ${isMe
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-sm"
                                : "glass text-slate-200 rounded-bl-sm border border-slate-700/30"
                            } shadow-lg hover:shadow-xl transition-all duration-200`}
                    >
                        {message.image && (
                            <img
                                src={message.image}
                                alt="shared image"
                                className="object-cover rounded-lg mb-2 max-w-full h-48"
                            />
                        )}
                        {message.text && (
                            <p className="text-sm leading-relaxed break-words">
                                {message.text}
                            </p>
                        )}

                        {/* Message timestamp and read status */}
                        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${isMe ? "text-white/70" : "text-slate-400"
                            }`}>
                            <span>{formatMessageTime(message.createdAt)}</span>
                            {isMe && (
                                message.isRead ? (
                                    <CheckCheck className="w-3 h-3" />
                                ) : (
                                    <Check className="w-3 h-3" />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/20 w-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 glass-dark border-b border-slate-700/30">
                <ChatHeader />
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin scrollbar-thumb-slate-700/30 scrollbar-track-transparent">
                {selectedUser ? (
                    messages && messages.length > 0 ? (
                        <div className="flex flex-col justify-start w-full max-w-4xl mx-auto">
                            {messages.map((message) => (
                                <MessageBubble
                                    key={message._id}
                                    message={message}
                                    isMe={message.senderId === authUser?._id}
                                />
                            ))}
                            <div ref={messageEndRef} />
                        </div>
                    ) : (
                        <NoChatHistoryPlaceholder name={selectedUser.name ?? "User"} />
                    )
                ) : (
                    <NoChatHistoryPlaceholder name="Select a user to start chatting" />
                )}
            </div>

            {/* Sticky Message Input */}
            {selectedUser && (
                <div className="sticky bottom-0 z-10 glass-dark border-t border-slate-700/30 px-4 sm:px-6 py-4">
                    <MessageInput />
                </div>
            )}
        </div>
    );
}

export default ChatContainer;
