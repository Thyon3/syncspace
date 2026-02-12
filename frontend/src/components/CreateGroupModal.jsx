import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { X, Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ onClose }) => {
    const { allContacts, getAllContacts, createGroup } = useChatStore();
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getAllContacts();
    }, [getAllContacts]);

    const filteredContacts = allContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            toast.error("Group name is required");
            return;
        }
        if (selectedUsers.length === 0) {
            toast.error("Select at least one member");
            return;
        }

        setIsLoading(true);
        try {
            await createGroup({
                name: groupName,
                members: selectedUsers
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-telegram-sidebar w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-telegram-hover flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">New Group</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto">
                    {/* Group Name Input */}
                    <div className="mb-6">
                        <label className="block text-sm text-slate-400 mb-2">Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name"
                            className="telegram-input w-full p-3 rounded-lg"
                        />
                    </div>

                    {/* Member Selection */}
                    <div className="mb-2">
                        <label className="block text-sm text-slate-400 mb-2">Add Members</label>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search people..."
                                className="telegram-input w-full pl-9 p-2 rounded-lg text-sm"
                            />
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredContacts.map(contact => (
                                <div
                                    key={contact._id}
                                    onClick={() => toggleUser(contact._id)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedUsers.includes(contact._id)
                                            ? 'bg-telegram-blue/20'
                                            : 'hover:bg-telegram-hover'
                                        }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={contact.profilePic || "/vite.svg"}
                                            alt={contact.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        {selectedUsers.includes(contact._id) && (
                                            <div className="absolute -bottom-1 -right-1 bg-telegram-blue rounded-full p-0.5 border-2 border-telegram-sidebar">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-slate-200 font-medium">{contact.name}</h4>
                                        <p className="text-xs text-slate-400">{contact.email}</p>
                                    </div>
                                </div>
                            ))}
                            {filteredContacts.length === 0 && (
                                <p className="text-center text-slate-500 py-4">No contacts found</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-telegram-hover flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateGroup}
                        disabled={isLoading}
                        className="bg-telegram-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
