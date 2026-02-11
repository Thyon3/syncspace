import React, { useEffect, useRef } from "react";
import MessagesLoadingSkeleton from "../components/messagesLoadingSkeleton";
import { useChatStore } from "../store/useChatStore";
import { userAuthStore } from "../store/userAuthStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceHolder";
import MessageInput from "./MessageInput";

function ChatContainer() {
    const { selectedUser, isMessageLoading, getMessagesById, messages } = useChatStore();
    const { authUser } = userAuthStore();

    const messsageEndRef = useRef(null);

    useEffect(() => {
        if (selectedUser?._id) {
            getMessagesById(selectedUser._id);
        }
    }, [selectedUser, getMessagesById]);

    useEffect(() => {
        if (messsageEndRef.current) {
            messsageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isMessageLoading) return <MessagesLoadingSkeleton />;

    return (
        <div className="flex flex-col h-full bg-slate-900 w-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20">
                <ChatHeader />
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {selectedUser ? (
                    messages && messages.length > 0 ? (
                        <div className="flex flex-col justify-start space-y-4 w-full max-w-3xl mx-auto">
                            {messages.map((message) => {
                                const isMe = message.senderId === authUser?._id;
                                return (
                                    <div key={message._id} className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                                        {!isMe && (
                                            <div className="chat-image avatar">
                                                <div className="w-10 rounded-full">
                                                    <img src={selectedUser.profilePic || "/vite.png"} alt={selectedUser.name} />
                                                </div>
                                            </div>
                                        )}

                                        <div className={`chat-bubble ${isMe ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"}`}>
                                            {message.image && (
                                                <img src={message.image} alt="shared" className="object-cover rounded-lg h-48 mb-2" />
                                            )}
                                            {message.text && <p className="text-[15px] leading-relaxed">{message.text}</p>}
                                            {message.createdAt && (
                                                <span className="text-[11px] opacity-60 mt-1 block text-right">
                                                    {new Date(message.createdAt).toISOString().slice(11, 16)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messsageEndRef}></div>
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
                <div className="sticky bottom-0 z-10 bg-slate-900/80 backdrop-blur-md border-t border-slate-700 px-4 sm:px-8 py-3">
                    <MessageInput />
                </div>
            )}
        </div>
    );
}

export default ChatContainer;
