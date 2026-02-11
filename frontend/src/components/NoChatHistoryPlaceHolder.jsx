import { MessageCircleIcon, Send, Sparkles } from "lucide-react";

const NoChatHistoryPlaceholder = ({ name }) => {
    const quickMessages = [
        { text: "Hey! How are you?", emoji: "👋" },
        { text: "What's up?", emoji: "😊" },
        { text: "Long time no see!", emoji: "🎉" },
        { text: "How's your day going?", emoji: "🌟" },
        { text: "Want to catch up soon?", emoji: "📅" },
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-lg w-full">
                {/* Icon with glow */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative glass-dark rounded-3xl p-6 border border-slate-700/30 inline-block">
                        <MessageCircleIcon className="w-12 h-12 text-gradient" />
                    </div>
                </div>

                {/* Welcome message */}
                <h3 className="text-2xl font-bold text-gradient mb-3">
                    Start chatting with {name}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    This is the beginning of your conversation.
                    Break the ice with a message below or type your own!
                </p>

                {/* Quick message suggestions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-slate-300">Quick starters</span>
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quickMessages.map((msg, index) => (
                            <button
                                key={index}
                                className="glass rounded-xl p-3 border border-slate-700/30 hover:border-cyan-500/50 transition-all duration-200 group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{msg.emoji}</span>
                                    <span className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors">
                                        {msg.text}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Call to action */}
                <div className="mt-8 glass rounded-xl p-4 border border-slate-700/30">
                    <div className="flex items-center gap-3 text-cyan-400">
                        <Send className="w-5 h-5" />
                        <p className="text-sm font-medium">
                            Type your message below to get started
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoChatHistoryPlaceholder;