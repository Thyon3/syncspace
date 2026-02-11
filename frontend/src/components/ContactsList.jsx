import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "../components/usersLoadinSkeleton";
import NoChatsFound from "../components/noChatsFound";
import { XIcon, MessageCircleIcon, Circle } from "lucide-react";

function ContactsList({ onSelectChat, onCloseMobile }) {
    const { isContactLoading, allContacts, getAllContacts, setSelectedUser } = useChatStore();

    useEffect(() => {
        getAllContacts();
    }, [getAllContacts]);

    if (isContactLoading) return <UsersLoadingSkeleton />;
    if (!allContacts || allContacts.length === 0) return <NoChatsFound />;

    const handleContactSelect = (contact) => {
        setSelectedUser(contact);
        if (onSelectChat) onSelectChat();
        if (onCloseMobile) onCloseMobile();
    };

    const formatLastActive = (lastActive) => {
        if (!lastActive) return "";
        const date = new Date(lastActive);
        const now = new Date();
        const diffInMinutes = (now - date) / (1000 * 60);

        if (diffInMinutes < 1) return "Active now";
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/20">
            {/* Mobile header */}
            {onCloseMobile && (
                <div className="md:hidden glass-dark border-b border-slate-700/30 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-slate-200 font-semibold text-lg">Contacts</h2>
                        <button
                            onClick={onCloseMobile}
                            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                            <XIcon className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>
            )}

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {allContacts.map((contact) => (
                    <div
                        key={contact._id}
                        onClick={() => handleContactSelect(contact)}
                        className="group relative flex items-center gap-3 p-3 rounded-xl glass hover:glass-dark transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-slate-700/30 hover:border-cyan-500/30"
                    >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="relative">
                                <img
                                    src={contact.profilePic || "/vite.svg"}
                                    alt={contact.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 group-hover:border-cyan-400 transition-all duration-200"
                                />
                                {contact.isOnline ? (
                                    <>
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                                    </>
                                ) : (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-500 border-2 border-slate-900 rounded-full"></span>
                                )}
                            </div>
                        </div>

                        {/* Contact info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="text-slate-100 font-semibold truncate text-sm">
                                    {contact.name}
                                </h4>
                                <span className="text-slate-500 text-xs flex-shrink-0">
                                    {formatLastActive(contact.lastActive)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 min-w-0">
                                    <Circle className={`w-1.5 h-1.5 flex-shrink-0 ${contact.isOnline ? 'text-green-400 fill-green-400' : 'text-slate-500 fill-slate-500'
                                        }`} />
                                    <p className="text-slate-400 text-sm truncate">
                                        {contact.isOnline ? 'Active now' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Message button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleContactSelect(contact);
                            }}
                            className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                            <MessageCircleIcon className="w-4 h-4" />
                        </button>

                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ContactsList;
