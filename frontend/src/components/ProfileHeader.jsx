import React, { useState, useRef } from 'react';
import { LogOutIcon, Volume1Icon, VolumeOffIcon } from 'lucide-react';
import { userAuthStore } from '../store/userAuthStore';
import { useChatStore } from '../store/useChatStore';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

function ProfileHeader() {
    const { logout, authUser, } = userAuthStore();
    const { isSoundEnabled, toggleSound, updateProfile } = useChatStore();
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);



        const formData = new FormData();
        formData.append("profilePic", file);

        try {
            const res = await axiosInstance.put("/user/updateProfile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success('profile updated successfully!');
        } catch (error) {
            toast.error(error.reponse.data.message);
        }

    };

    return (
        <div className="p-4 border-b bg-slate-500/10">
            <div className="flex items-center justify-between">
                {/* LEFT SIDE - PROFILE INFO */}
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative group">
                        <button
                            className="size-14 rounded-full overflow-hidden border-2 border-slate-300 hover:opacity-90"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <img
                                src={selectedImage || authUser?.profilePic || '/vite.svg'}
                                alt="user profile"
                                className="w-full h-full object-cover"
                            />
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        {/* Green online dot */}
                        <span className="absolute bottom-1 right-1 size-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    {/* Name and status */}
                    <div className="flex flex-col">
                        <h3 className="text-slate-100 text-base font-medium max-w-[160px] truncate">
                            {authUser?.name || 'User Name'}
                        </h3>
                        <p className="text-slate-400 text-sm">Online</p>
                    </div>
                </div>

                {/* RIGHT SIDE - ACTIONS */}
                <div className="flex items-center gap-3">
                    {/* Sound toggle */}
                    <button
                        onClick={toggleSound}
                        title={isSoundEnabled ? 'Mute notifications' : 'Enable notifications'}
                        className="p-2 hover:bg-slate-600 rounded-full transition"
                    >
                        {isSoundEnabled ? (
                            <Volume1Icon className="size-5 text-blue-400" />
                        ) : (
                            <VolumeOffIcon className="size-5 text-slate-400" />
                        )}
                    </button>

                    {/* Logout button */}
                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-2 hover:bg-red-600 rounded-full transition"
                    >
                        <LogOutIcon className="size-5 text-red-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileHeader;
