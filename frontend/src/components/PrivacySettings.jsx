import React from 'react';
import { Shield, UserX, ChevronRight, Eye } from 'lucide-react';

const PrivacySettings = () => {
    const privacyOptions = [
        { id: 'lastSeen', label: 'Last Seen & Online', value: 'Everyone', icon: Eye },
        { id: 'profilePic', label: 'Profile Photos', value: 'Everyone', icon: ChevronRight },
        { id: 'bio', label: 'Bio', value: 'Everyone', icon: ChevronRight },
        { id: 'groups', label: 'Groups & Channels', value: 'Everyone', icon: ChevronRight },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Privacy Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white font-bold mb-2">
                    <Shield className="w-5 h-5 text-telegram-blue" />
                    <h3>Privacy</h3>
                </div>

                <div className="flex flex-col bg-slate-800/40 rounded-xl border border-slate-700/30 overflow-hidden">
                    {privacyOptions.map((option, index) => (
                        <button
                            key={option.id}
                            className={`flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors ${index !== privacyOptions.length - 1 ? "border-b border-slate-700/50" : ""}`}
                        >
                            <div className="flex items-center gap-3">
                                <option.icon className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-white font-medium">{option.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-telegram-blue font-semibold">{option.value}</span>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </div>
                        </button>
                    ))}
                </div>
                <p className="text-[11px] text-slate-500 px-2 mt-1 px-4">
                    Change who can see your personal info and when you were last online.
                </p>
            </div>

            {/* Blocked Users Section */}
            <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2 text-white font-bold mb-2">
                    <UserX className="w-5 h-5 text-red-500" />
                    <h3>Blocked Users</h3>
                </div>

                <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <p className="text-sm text-slate-400 text-center py-4 italic">
                        No users currently blocked.
                    </p>
                    <button className="telegram-button w-full text-xs py-2 bg-slate-700 hover:bg-slate-600">
                        Add to Blocked List
                    </button>
                </div>
                <p className="text-[11px] text-slate-500 px-4">
                    Blocked users will not be able to message you or see your online status.
                </p>
            </div>
        </div>
    );
};

export default PrivacySettings;
