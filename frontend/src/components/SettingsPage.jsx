import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { X, User, Shield, Lock, Bell, Moon, Globe } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';
import PrivacySettings from './PrivacySettings';

const SettingsPage = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Moon },
        { id: 'language', label: 'Language', icon: Globe },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />;
            case 'security': return <SecuritySettings />;
            case 'privacy': return <PrivacySettings />;
            default: return (
                <div className="flex flex-col items-center justify-center h-full opacity-50 py-10">
                    <p className="text-sm">This section is coming soon!</p>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="bg-telegram-sidebar w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-700/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 bg-telegram-dark/50 border-r border-slate-700/50 flex flex-col">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-white">Settings</h2>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${activeTab === tab.id
                                        ? "bg-telegram-blue text-white shadow-lg shadow-telegram-blue/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}
                                `}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-telegram-sidebar min-w-0">
                    <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                        <h3 className="font-bold text-white capitalize">{activeTab} Settings</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="max-w-xl mx-auto">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
