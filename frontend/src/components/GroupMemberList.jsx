import React from 'react';
import { Crown, Shield, MoreVertical, UserMinus } from 'lucide-react';

function GroupMemberList({ members, admin, moderators, currentUserId, onRemove, onPromote, onDemote }) {
    const isAdmin = admin === currentUserId;

    return (
        <div className="space-y-2">
            {members.map((member) => {
                const isGroupAdmin = member._id === admin;
                const isModerator = moderators?.includes(member._id);

                return (
                    <div key={member._id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                            <img
                                src={member.profilePic || '/default-avatar.png'}
                                alt={member.name}
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{member.name}</span>
                                    {isGroupAdmin && <Crown size={16} className="text-yellow-400" />}
                                    {isModerator && !isGroupAdmin && <Shield size={16} className="text-blue-400" />}
                                </div>
                                <span className="text-sm text-slate-400">{member.email}</span>
                            </div>
                        </div>

                        {isAdmin && member._id !== currentUserId && !isGroupAdmin && (
                            <div className="flex items-center gap-2">
                                {isModerator ? (
                                    <button
                                        onClick={() => onDemote(member._id)}
                                        className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm"
                                    >
                                        Demote
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onPromote(member._id)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                                    >
                                        Promote
                                    </button>
                                )}
                                <button
                                    onClick={() => onRemove(member._id)}
                                    className="p-2 hover:bg-red-600 rounded transition"
                                    title="Remove member"
                                >
                                    <UserMinus size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default GroupMemberList;
