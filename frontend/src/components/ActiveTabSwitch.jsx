import React from 'react';
import { MessageCircleIcon, UsersIcon } from 'lucide-react';
import { useChatStore } from '../store/useChatStore.js';

function ActiveTabSwitch() {
    const { activeTab, setActiveTab } = useChatStore();

    const tabs = [
        { id: 'chats', label: 'Chats', icon: MessageCircleIcon },
        { id: 'contacts', label: 'Contacts', icon: UsersIcon },
    ];

    return (
        <div className="p-4">
            <div className="relative flex bg-slate-800/30 rounded-xl p-1 backdrop-blur-sm border border-slate-700/30">
                {/* Sliding indicator */}
                <div
                    className="absolute top-1 left-1 h-[calc(100%-8px)] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg transition-all duration-300 ease-out shadow-lg"
                    style={{
                        width: 'calc(50% - 4px)',
                        transform: activeTab === 'contacts' ? 'translateX(100%)' : 'translateX(0)',
                    }}
                />

                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 z-10 ${isActive
                                    ? 'text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-300'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{tab.label}</span>
                            {isActive && (
                                <div className="absolute inset-0 bg-white/10 rounded-lg animate-pulse"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default ActiveTabSwitch;
