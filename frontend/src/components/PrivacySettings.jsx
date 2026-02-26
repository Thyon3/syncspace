import React, { useState } from 'react';
import { Lock, Eye, Info } from 'lucide-react';

function PrivacySettings({ settings, onUpdate }) {
    const [localSettings, setLocalSettings] = useState(settings || {
        lastSeen: 'everyone',
        profilePic: 'everyone',
        about: 'everyone'
    });

    const options = ['everyone', 'contacts', 'nobody'];

    const handleChange = (field, value) => {
        const updated = { ...localSettings, [field]: value };
        setLocalSettings(updated);
        onUpdate(updated);
    };

    return (
        <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
                <Lock size={24} />
                <h2 className="text-xl font-semibold">Privacy Settings</h2>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                        <Eye size={16} />
                        Last Seen
                    </label>
                    <select
                        value={localSettings.lastSeen}
                        onChange={(e) => handleChange('lastSeen', e.target.value)}
                        className="w-full bg-slate-700 rounded p-2"
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                        <Eye size={16} />
                        Profile Picture
                    </label>
                    <select
                        value={localSettings.profilePic}
                        onChange={(e) => handleChange('profilePic', e.target.value)}
                        className="w-full bg-slate-700 rounded p-2"
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                        <Info size={16} />
                        About
                    </label>
                    <select
                        value={localSettings.about}
                        onChange={(e) => handleChange('about', e.target.value)}
                        className="w-full bg-slate-700 rounded p-2"
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default PrivacySettings;
