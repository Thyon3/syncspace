import { MessageCircleIcon, Users, Search } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
    const { setActiveTab } = useChatStore();

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            {/* Icon with glow effect */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative glass-dark rounded-3xl p-6 border border-slate-700/30">
                    <MessageCircleIcon className="w-12 h-12 text-gradient" />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-sm space-y-4">
                <h4 className="text-xl font-bold text-gradient">No conversations yet</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Start connecting with others by finding contacts and initiating your first conversation.
                </p>

                {/* Action buttons */}
                <div className="space-y-3 pt-4">
                    <button
                        onClick={() => setActiveTab("contacts")}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        <Users className="w-4 h-4" />
                        Find Contacts
                    </button>

                    <button className="w-full btn-secondary flex items-center justify-center gap-2">
                        <Search className="w-4 h-4" />
                        Search Users
                    </button>
                </div>

                {/* Tips */}
                <div className="glass rounded-xl p-4 border border-slate-700/30 text-left mt-6">
                    <h5 className="text-sm font-semibold text-slate-300 mb-2">💡 Tips</h5>
                    <ul className="space-y-1 text-xs text-slate-400">
                        <li>• Switch to Contacts tab to find people</li>
                        <li>• Click on any contact to start chatting</li>
                        <li>• Your conversations will appear here</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default NoChatsFound;