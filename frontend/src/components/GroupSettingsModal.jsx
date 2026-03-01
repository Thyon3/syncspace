import React, { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { userAuthStore } from "../store/userAuthStore";
import {
    X,
    Camera,
    UserPlus,
    Trash2,
    Shield,
    ShieldCheck,
    ShieldOff,
    Link,
    LogOut,
    Users,
    Info,
    Search
} from "lucide-react";
import toast from "react-hot-toast";

function GroupSettingsModal({ onClose }) {
    const {
        selectedChat,
        updateGroup,
        deleteGroup,
        removeMember,
        promoteModerator,
        demoteModerator,
        generateInviteCode
    } = useChatStore();
    const { authUser } = userAuthStore();

    const [name, setName] = useState(selectedChat?.groupName || "");
    const [description, setDescription] = useState(selectedChat?.groupDescription || "");
    const [isPublic, setIsPublic] = useState(selectedChat?.isPublic || false);
    const [loading, setLoading] = useState(false);
    const [inviteCode, setInviteCode] = useState(selectedChat?.inviteCode || "");
    const [activeTab, setActiveTab] = useState("info"); // info, members, settings
    const [memberSearch, setMemberSearch] = useState("");

    const isAdmin = selectedChat?.admin?._id === authUser?._id || selectedChat?.admin === authUser?._id;
    const isModerator = selectedChat?.moderators?.some(m => m === authUser?._id || m._id === authUser?._id);
    const canManage = isAdmin || isModerator;

    const handleUpdate = async () => {
        setLoading(true);
        await updateGroup({
            chatId: selectedChat._id,
            groupName: name,
            groupDescription: description,
            isPublic
        });
        setLoading(false);
    };

    const handleGenerateLink = async () => {
        const code = await generateInviteCode(selectedChat._id);
        if (code) setInviteCode(code);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
            await deleteGroup(selectedChat._id);
            onClose();
        }
    };

    const filteredMembers = selectedChat?.members?.filter(m =>
        m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email?.toLowerCase().includes(memberSearch.toLowerCase())
    );

    const copyInviteLink = () => {
        const url = `${window.location.origin}/join/${inviteCode}`;
        navigator.clipboard.writeText(url);
        toast.success("Invite link copied to clipboard");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-telegram-sidebar w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-telegram-blue" />
                        Group Settings
                    </h2>
                    <button onClick={onClose} className="telegram-icon-button hover:bg-slate-700 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab("info")}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-telegram-blue border-b-2 border-telegram-blue' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Info
                    </button>
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'members' ? 'text-telegram-blue border-b-2 border-telegram-blue' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Members ({selectedChat?.members?.length || 0})
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'settings' ? 'text-telegram-blue border-b-2 border-telegram-blue' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Manage
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {activeTab === "info" && (
                        <div className="space-y-6 animate-in slide-in-from-right-2 duration-200">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-slate-700 overflow-hidden shadow-xl">
                                        {selectedChat?.groupImage ? (
                                            <img src={selectedChat.groupImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{selectedChat?.groupName?.charAt(0)?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    {canManage && (
                                        <button className="absolute bottom-0 right-0 p-2 bg-telegram-blue text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-telegram-blue uppercase tracking-wider mb-2 block px-1">Group Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={!canManage}
                                        className="telegram-input w-full bg-slate-800/50 border-slate-700"
                                        placeholder="Enter group name..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-telegram-blue uppercase tracking-wider mb-2 block px-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={!canManage}
                                        className="telegram-input w-full h-24 resize-none bg-slate-800/50 border-slate-700"
                                        placeholder="What is this group about?"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            {canManage && (
                                <button
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="telegram-button w-full flex items-center justify-center gap-2 py-3 font-bold shadow-lg shadow-blue-500/20"
                                >
                                    {loading ? "Updating..." : "Save Changes"}
                                </button>
                            )}
                        </div>
                    )}

                    {activeTab === "members" && (
                        <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    className="telegram-input w-full pl-10"
                                />
                            </div>

                            <div className="space-y-2">
                                {filteredMembers?.map(member => {
                                    const isMemberAdmin = selectedChat?.admin?._id === member._id || selectedChat?.admin === member._id;
                                    const isMemberMod = selectedChat?.moderators?.some(modId => modId === member._id || modId._id === member._id);

                                    return (
                                        <div key={member._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-700/50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold overflow-hidden border border-slate-500">
                                                    {member.profilePic ? (
                                                        <img src={member.profilePic} alt="" className="w-full h-full object-cover" />
                                                    ) : member.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-sm font-semibold text-slate-100 truncate">{member.name}</p>
                                                        {isMemberAdmin && <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" title="Admin" />}
                                                        {isMemberMod && <Shield className="w-3.5 h-3.5 text-blue-400" title="Moderator" />}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 truncate">{member.email}</p>
                                                </div>
                                            </div>

                                            {isAdmin && !isMemberAdmin && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!isMemberMod ? (
                                                        <button
                                                            onClick={() => promoteModerator(selectedChat._id, member._id)}
                                                            className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                            title="Promote to Moderator"
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => demoteModerator(selectedChat._id, member._id)}
                                                            className="p-1.5 text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors"
                                                            title="Demote to Member"
                                                        >
                                                            <ShieldOff className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => removeMember(selectedChat._id, member._id)}
                                                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                        title="Remove from group"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && isAdmin && (
                        <div className="space-y-6 animate-in slide-in-from-right-2 duration-200">
                            {/* Invite Link */}
                            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                                        <Link className="w-4 h-4 text-telegram-blue" />
                                        Invite Link
                                    </h4>
                                    <button
                                        onClick={handleGenerateLink}
                                        className="text-xs text-telegram-blue hover:underline font-medium"
                                    >
                                        Regenerate
                                    </button>
                                </div>
                                {inviteCode ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-900/50 p-2.5 rounded-xl text-xs font-mono text-slate-300 truncate border border-slate-800">
                                            {window.location.origin}/join/{inviteCode}
                                        </div>
                                        <button
                                            onClick={copyInviteLink}
                                            className="p-2.5 bg-telegram-blue text-white rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                                        >
                                            <Link className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleGenerateLink}
                                        className="w-full py-2.5 border-2 border-dashed border-slate-700 rounded-xl text-sm text-slate-400 hover:border-telegram-blue hover:text-telegram-blue transition-all"
                                    >
                                        Enable Invite Link
                                    </button>
                                )}
                            </div>

                            {/* Privacy */}
                            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-100">Public Group</h4>
                                        <p className="text-xs text-slate-500">Anyone can find and join</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isPublic}
                                            onChange={(e) => setIsPublic(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-telegram-blue"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Destructive Actions */}
                            <div className="pt-4 border-t border-slate-700">
                                <button
                                    onClick={handleDelete}
                                    className="w-full flex items-center justify-center gap-2 p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors font-bold group"
                                >
                                    <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Delete Group
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Tip */}
                <div className="p-4 bg-slate-800/30 text-center border-t border-slate-700">
                    <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <Info className="w-3 h-3" />
                        Tip: Only admins can manage group settings and members.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default GroupSettingsModal;
