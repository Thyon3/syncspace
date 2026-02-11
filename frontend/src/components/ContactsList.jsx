import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "../components/usersLoadinSkeleton";
import NoChatsFound from "../components/noChatsFound";
import { XIcon } from "lucide-react";

function ContactsList({ onCloseMobile }) {
    const { isContactLoading, allContacts, getAllContacts, setSelectedUser } = useChatStore();

    useEffect(() => {
        getAllContacts();
    }, [getAllContacts]);

    if (isContactLoading) return <UsersLoadingSkeleton />;
    if (!allContacts || allContacts.length === 0) return <NoChatsFound />;

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Mobile header */}
            {onCloseMobile && (
                <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-slate-200 font-semibold">Contacts</h2>
                    <button onClick={onCloseMobile} className="text-slate-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {allContacts.map((contact) => (
                    <div
                        key={contact._id}
                        onClick={() => {
                            setSelectedUser(contact);
                            if (onCloseMobile) onCloseMobile(); // close mobile view after selecting
                        }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-slate-800 hover:bg-slate-700/50 transition-colors cursor-pointer group shadow-sm"
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={contact.profilePic || "/vite.svg"}
                                alt={contact.name}
                                className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-all"
                            />
                            {contact.isOnline && (
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                            )}
                        </div>

                        {/* Contact info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-slate-100 font-semibold truncate">{contact.name}</h4>
                            {contact.lastMessage && (
                                <p className="text-slate-400 text-sm truncate mt-1">{contact.lastMessage}</p>
                            )}
                        </div>

                        {/* Last active */}
                        {contact.lastActive && (
                            <span className="text-slate-500 text-xs">
                                {new Date(contact.lastActive).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ContactsList;
