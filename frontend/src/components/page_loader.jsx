import React from 'react';
import { LoaderIcon, MessageCircle } from 'lucide-react';

function PageLoader() {
    return (
        <div className='flex items-center justify-center h-screen bg-gradient-dark relative overflow-hidden'>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Main loader content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Logo with glow */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
                    <div className="relative glass-dark rounded-3xl p-6 border border-slate-700/30">
                        <MessageCircle className="w-12 h-12 text-gradient" />
                    </div>
                </div>

                {/* Loading spinner */}
                <div className="relative">
                    <LoaderIcon className='w-8 h-8 text-cyan-400 animate-spin' />
                    <div className="absolute inset-0 w-8 h-8 bg-cyan-500/20 rounded-full animate-ping"></div>
                </div>

                {/* Loading text */}
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-gradient">Loading SyncSpace</h2>
                    <p className="text-slate-400 text-sm animate-pulse">
                        Preparing your chat experience...
                    </p>
                </div>

                {/* Loading dots */}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
}

export default PageLoader;
