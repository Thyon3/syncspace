import React, { useState } from 'react';
import { userAuthStore } from '../store/userAuthStore';
import { Eye, Shield, User, Info, Check } from 'lucide-react';

const PrivacySettings = () => {
    const { authUser, updatePrivacySettings } = userAuthStore();
    const [settings, setSettings] = useState(authUser?.privacySettings || {
        lastSeen: 'everyone',
        profilePic: 'everyone',
        about: 'everyone'
    });

    const options = [
        { id: 'everyone', label: 'Everyone' },
        { id: 'contacts', label: 'My Contacts' },
        { id: 'nobody', label: 'Nobody' }
    ];

    const handleUpdate = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await updatePrivacySettings(newSettings);
    };

    const PrivacyOption = ({ title, icon: Icon, settingKey, currentValue }) => (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-white font-bold opacity-90">
                <Icon className="w-4 h-4 text-telegram-blue" />
                <h4 className="text-sm uppercase tracking-wider">{title}</h4>
            </div>
            <div className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/50">
                {options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleUpdate(settingKey, option.id)}
                        className="flex items-center justify-between w-full p-3.5 hover:bg-slate-700/50 transition-colors border-b last:border-b-0 border-slate-700/30"
                    >
                        <span className={`text-sm ${currentValue === option.id ? 'text-telegram-blue font-bold' : 'text-slate-300'}`}>
                            {option.label}
                        </span>
                        {currentValue === option.id && (
                            <Check className="w-4 h-4 text-telegram-blue" />
                        )}
                    </button>
                ))}
            </div>
            <p className="text-[11px] text-slate-500 px-1">
                Control who can see your {title.toLowerCase()}.
            </p>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <PrivacyOption
                title="Last Seen & Online"
                icon={Eye}
                settingKey="lastSeen"
                currentValue={settings.lastSeen}
            />

            <PrivacyOption
                title="Profile Photo"
                icon={User}
                settingKey="profilePic"
                currentValue={settings.profilePic}
            />

            <PrivacyOption
                title="Bio"
                icon={Info}
                settingKey="about"
                currentValue={settings.about}
            />

            <div className="mt-4 p-4 bg-telegram-blue/5 border border-telegram-blue/20 rounded-xl flex gap-3">
                <Shield className="w-5 h-5 text-telegram-blue shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">
                    Telegram value your privacy. Note that if you hide your 'Last Seen' time from others, you won't be able to see their 'Last Seen' time either.
                </p>
            </div>
        </div>
    );
};

export default PrivacySettings;
