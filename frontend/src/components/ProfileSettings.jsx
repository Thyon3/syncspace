import React, { useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { userAuthStore } from '../store/userAuthStore';
import { Camera, User, Info, Loader2 } from 'lucide-react';

const ProfileSettings = () => {
    const { authUser, updateProfile, isUpdatingProfile } = userAuthStore();
    const [name, setName] = useState(authUser?.name || "");
    const [bio, setBio] = useState(authUser?.bio || "");
    const [selectedImg, setSelectedImg] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64Image = reader.result;
            setSelectedImg(base64Image);
        };
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const data = {
            name,
            bio,
            profilePic: fileInputRef.current?.files[0]
        };
        await updateProfile(data);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                    <img
                        src={selectedImg || authUser?.profilePic || "/avatar.png"}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-telegram-sidebar"
                    />
                    <label
                        htmlFor="avatar-upload"
                        className={`
                            absolute bottom-0 right-0 
                            bg-telegram-blue hover:bg-telegram-blue-hover 
                            p-2 rounded-full cursor-pointer 
                            transition-all duration-200
                            ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                        `}
                    >
                        <Camera className="w-5 h-5 text-white" />
                        <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            disabled={isUpdatingProfile}
                        />
                    </label>
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white">{authUser?.name}</h2>
                    <p className="text-sm text-slate-400">{authUser?.email}</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <User className="w-4 h-4" /> Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="telegram-input w-full"
                        maxLength={30}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Bio
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="A bit about yourself..."
                        className="telegram-input w-full min-h-[100px] resize-none"
                        maxLength={70}
                    />
                    <p className="text-[10px] text-right text-slate-500">
                        {bio.length}/70
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="telegram-button w-full mt-2 flex items-center justify-center gap-2"
                >
                    {isUpdatingProfile ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        "Save Profile"
                    )}
                </button>
            </form>
        </div>
    );
};

export default ProfileSettings;
