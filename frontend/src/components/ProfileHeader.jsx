import React, { useState, useRef } from 'react';
import { LogOutIcon, Volume1Icon, VolumeOffIcon, Settings, Camera } from 'lucide-react';
import { userAuthStore } from '../store/userAuthStore';
import { useChatStore } from '../store/useChatStore';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

function ProfileHeader() {
    const { logout, authUser } = userAuthStore();
    const { isSoundEnabled, toggleSound, updateProfile } = useChatStore();
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('Image size should be less than 5MB');
            return;
        }

        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        setIsUploading(true);

        const formData = new FormData();
        formData.append("profilePic", file);

        try {
            const res = await axiosInstance.put("/user/updateProfile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success('Profile updated successfully!');
            updateProfile(res.data.user);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
            setSelectedImage(null);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-4 glass-dark border-b border-slate-700/30">
            <div className="flex items-center justify-between">
                {/* LEFT SIDE - PROFILE INFO */}
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative group">
                        <button
                            className="size-14 rounded-full overflow-hidden border-2 border-cyan-500/50 hover:border-cyan-400 transition-all duration-200 hover:scale-105 relative"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            <img
                                src={selectedImage || authUser?.profilePic || '/vite.svg'}
                                alt="user profile"
                                className="w-full h-full object-cover"
                            />
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            {/* Camera overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-4 h-4 text-white" />
                            </div>
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        {/* Green online dot with pulse */}
                        <span className="absolute bottom-1 right-1 size-3 bg-green-500 border-2 border-slate-900 rounded-full">
                            <span className="absolute inset-0 bg-green-500 rounded-full animate-ping"></span>
                        </span>
                    </div>

                    {/* Name and status */}
                    <div className="flex flex-col">
                        <h3 className="text-slate-100 text-base font-semibold max-w-[160px] truncate">
                            {authUser?.name || 'User Name'}
                        </h3>
                        <div className="flex items-center gap-1">
                            <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-slate-400 text-sm">Active now</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - ACTIONS */}
                <div className="flex items-center gap-2">
                    {/* Sound toggle */}
                    <button
                        onClick={toggleSound}
                        title={isSoundEnabled ? 'Mute notifications' : 'Enable notifications'}
                        className="p-2.5 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group"
                    >
                        {isSoundEnabled ? (
                            <Volume1Icon className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
                        ) : (
                            <VolumeOffIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                        )}
                    </button>

                    {/* Settings button */}
                    <button
                        title="Settings"
                        className="p-2.5 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group"
                    >
                        <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                    </button>

                    {/* Logout button */}
                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-2.5 rounded-xl hover:bg-red-500/20 transition-all duration-200 group"
                    >
                        <LogOutIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileHeader;
