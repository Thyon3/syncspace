import React, { useEffect } from "react";
import MessagesLoadingSkeleton from "../components/messagesLoadingSkeleton";
import { useChatStore } from "../store/useChatStore";
import { userAuthStore } from "../store/userAuthStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceHolder";
import MessageInput from "./MessageInput";

function ChatContainer() {
    const { selectedUser, isMessageLoading, getMessagesById, messages } = useChatStore();
    const { authUser } = userAuthStore();

    useEffect(() => {
        if (selectedUser?._id) {
            getMessagesById(selectedUser._id);
        }
    }, [selectedUser, getMessagesById]);

    if (isMessageLoading) {
        return <MessagesLoadingSkeleton />;
    }

    return (
        <div className="flex flex-col h-full bg-slate-900 w-full">
            {/* --- Sticky Header --- */}
            <div className="sticky top-0 z-20">
                <ChatHeader />
            </div>

            {/* --- Chat Messages Area --- */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {selectedUser ? (
                    messages && messages.length > 0 ? (
                        <div className="max-w-3xl mx-auto w-full flex flex-col space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message._id}
                                    className={`flex ${message.senderId === authUser?._id ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${message.senderId === authUser?._id
                                            ? "bg-cyan-600 text-white rounded-br-none"
                                            : "bg-slate-800 text-slate-200 rounded-bl-none"
                                            }`}
                                    >
                                        {/* Image message */}
                                        {message.image && (
                                            <img
                                                src={message.image}
                                                alt="shared"
                                                className="object-cover rounded-lg h-48 mb-2"
                                            />
                                        )}

                                        {/* Text message */}
                                        {message.text && <p className="text-[15px] leading-relaxed">{message.text}</p>}

                                        {/* Timestamp */}
                                        {message.createdAt && (
                                            <p className="text-[11px] opacity-60 mt-1 text-right">
                                                {new Date(message.createdAt).toISOString().slice(11, 16)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <NoChatHistoryPlaceholder name={selectedUser.name ?? "User"} />
                    )
                ) : (
                    <NoChatHistoryPlaceholder name="Select a user to start chatting" />
                )}
            </div>

            {/* --- Message Input --- */}
            {selectedUser && (
                <div className="sticky bottom-0 z-10 bg-slate-900/80 backdrop-blur-md border-t border-slate-700 px-4 sm:px-8 py-3">
                    <MessageInput />
                </div>
            )}
        </div>
    );
}

export default ChatContainer;
