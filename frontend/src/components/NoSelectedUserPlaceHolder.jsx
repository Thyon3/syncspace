import React from 'react';
import { MessageCircle, Users, ArrowLeft, Sparkles } from 'lucide-react';

function NoSelectedUserPlaceHolder() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center text-center px-6 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-md">
                {/* Icon with glow effect */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative glass-dark rounded-3xl p-6 border border-slate-700/30">
                        <MessageCircle className="w-16 h-16 text-gradient mx-auto" />
                    </div>
                </div>

                {/* Title and description */}
                <h2 className="text-3xl font-bold text-gradient mb-3">
                    Welcome to SyncSpace
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Select a conversation from the sidebar to start messaging.
                    Connect with friends, share moments, and stay in touch with your loved ones.
                </p>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="glass rounded-xl p-4 border border-slate-700/30">
                        <MessageCircle className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-300 font-medium">Real-time Chat</p>
                    </div>
                    <div className="glass rounded-xl p-4 border border-slate-700/30">
                        <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-300 font-medium">Connect</p>
                    </div>
                    <div className="glass rounded-xl p-4 border border-slate-700/30">
                        <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-300 font-medium">Modern UI</p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="glass rounded-xl p-4 border border-slate-700/30 text-left">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Getting Started
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-400">
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>Click on any chat or contact from the left sidebar</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>Drag the sidebar border to adjust its width</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>Switch between Chats and Contacts using the tabs</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default NoSelectedUserPlaceHolder;
