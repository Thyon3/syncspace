import Chat from '../model/chat.model.js';
import User from '../model/user.model.js';
import Message from '../model/message.model.js';
import { getIO, getReceiverSocketId } from '../config/socket.js';

export const getChats = async (req, res) => {
    try {
        const userId = req.user._id;

        const chats = await Chat.find({ members: userId })
            .populate({
                path: 'members',
                select: '-password'
            })
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'senderId',
                    select: 'name profilePic email'
                }
            })
            .populate('admin', 'name profilePic')
            .sort({ updatedAt: -1 });

        return res.json(chats);
    } catch (error) {
        console.error("Error in getChats:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const userId = req.user._id;

        if (!name || !members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: "Group name and members are required" });
        }

        // Add creator to members if not present
        if (!members.includes(userId)) {
            members.push(userId);
        }

        const newGroup = await Chat.create({
            type: 'group',
            groupName: name,
            members,
            admin: userId,
        });

        // Create service message
        await Message.create({
            chatId: newGroup._id,
            senderId: userId,
            text: `${req.user.name} created the group "${name}"`,
            isServiceMessage: true,
        });

        const populatedGroup = await Chat.findById(newGroup._id)
            .populate('members', '-password')
            .populate('admin', 'name profilePic');

        return res.status(201).json(populatedGroup);

    } catch (error) {
        console.error("Error in createGroup:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const addMember = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const currentUserId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // Only admin can add members (for now, simpler logic)
        if (chat.admin && chat.admin.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "Only admin can add members" });
        }

        if (chat.members.includes(userId)) {
            return res.status(400).json({ message: "User already in group" });
        }

        chat.members.push(userId);
        await chat.save();

        const newUser = await User.findById(userId);
        await Message.create({
            chatId,
            senderId: currentUserId,
            text: `${currentUserId.toString() === userId.toString() ? 'You' : req.user.name} added ${newUser.name} to the group`,
            isServiceMessage: true,
        });

        const populatedChat = await Chat.findById(chatId)
            .populate('members', '-password')
            .populate('admin', 'name profilePic');

        return res.json(populatedChat);

    } catch (error) {
        console.error("Error in addMember:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const searchUsersAndGroups = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user._id;

        if (!query) return res.status(400).json({ message: "Search query is required" });

        const searchRegex = { $regex: query, $options: 'i' };

        // Search Users
        const users = await User.find({
            $and: [
                { _id: { $ne: userId } },
                {
                    $or: [
                        { name: searchRegex },
                        { email: searchRegex }
                    ]
                }
            ]
        }).select('name profilePic email').limit(10);

        // Search Groups (chats user is a member of)
        const groups = await Chat.find({
            type: 'group',
            members: userId,
            groupName: searchRegex
        }).limit(10);

        return res.json({
            users,
            groups
        });

    } catch (error) {
        console.error("Error in searchUsersAndGroups:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const currentUserId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const isAdmin = chat.admin && chat.admin.toString() === currentUserId.toString();
        const isModerator = chat.moderators && chat.moderators.some(m => m.toString() === currentUserId.toString());

        if (!isAdmin && !isModerator) {
            return res.status(403).json({ message: "Only admins and moderators can remove members" });
        }

        if (chat.admin.toString() === userId) {
            return res.status(400).json({ message: "Cannot remove group admin" });
        }

        chat.members = chat.members.filter(id => id.toString() !== userId);
        await chat.save();

        const removedUser = await User.findById(userId);
        await Message.create({
            chatId,
            senderId: currentUserId,
            text: `${req.user.name} removed ${removedUser.name} from the group`,
            isServiceMessage: true,
        });

        const populatedChat = await Chat.findById(chatId)
            .populate('members', '-password')
            .populate('admin', 'name profilePic');

        return res.json(populatedChat);
    } catch (error) {
        console.error("Error in removeMember:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        if (chat.admin && chat.admin.toString() === userId.toString()) {
            return res.status(400).json({ message: "Admin must transfer ownership before leaving" });
        }

        chat.members = chat.members.filter(id => id.toString() !== userId.toString());
        await chat.save();

        await Message.create({
            chatId,
            senderId: userId,
            text: `${req.user.name} left the group`,
            isServiceMessage: true,
        });

        return res.json({ message: "Left group successfully" });
    } catch (error) {
        console.error("Error in leaveGroup:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const muteChat = async (req, res) => {
    try {
        const { chatId, duration } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const mutedUntil = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : null;

        const existingMute = chat.mutedBy.find(m => m.userId.toString() === userId.toString());
        if (existingMute) {
            existingMute.mutedUntil = mutedUntil;
        } else {
            chat.mutedBy.push({ userId, mutedUntil });
        }

        await chat.save();
        return res.json({ message: "Chat muted successfully", chat });
    } catch (error) {
        console.error("Error in muteChat:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const unmuteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        chat.mutedBy = chat.mutedBy.filter(m => m.userId.toString() !== userId.toString());
        await chat.save();

        return res.json({ message: "Chat unmuted successfully", chat });
    } catch (error) {
        console.error("Error in unmuteChat:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const archiveChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        if (!chat.archivedBy.includes(userId)) {
            chat.archivedBy.push(userId);
            await chat.save();
        }

        return res.json({ message: "Chat archived successfully", chat });
    } catch (error) {
        console.error("Error in archiveChat:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const unarchiveChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        chat.archivedBy = chat.archivedBy.filter(id => id.toString() !== userId.toString());
        await chat.save();

        return res.json({ message: "Chat unarchived successfully", chat });
    } catch (error) {
        console.error("Error in unarchiveChat:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const updateGroupDescription = async (req, res) => {
    try {
        const { chatId, description } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const isAdmin = chat.admin && chat.admin.toString() === userId.toString();
        if (!isAdmin) {
            return res.status(403).json({ message: "Only admin can update description" });
        }

        chat.groupDescription = description;
        await chat.save();

        return res.json(chat);
    } catch (error) {
        console.error("Error in updateGroupDescription:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const promoteModerator = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const currentUserId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        if (chat.admin.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "Only admin can promote moderators" });
        }

        if (!chat.moderators) chat.moderators = [];
        if (chat.moderators.includes(userId)) {
            return res.status(400).json({ message: "User is already a moderator" });
        }

        chat.moderators.push(userId);
        await chat.save();

        const populatedChat = await Chat.findById(chatId)
            .populate('moderators', 'name profilePic');

        return res.json(populatedChat);
    } catch (error) {
        console.error("Error in promoteModerator:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const demoteModerator = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const currentUserId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        if (chat.admin.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "Only admin can demote moderators" });
        }

        chat.moderators = chat.moderators.filter(id => id.toString() !== userId);
        await chat.save();

        return res.json(chat);
    } catch (error) {
        console.error("Error in demoteModerator:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const saveDraft = async (req, res) => {
    try {
        const { chatId, text } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const existingDraft = chat.draftMessages.find(d => d.userId.toString() === userId.toString());
        if (existingDraft) {
            existingDraft.text = text;
            existingDraft.updatedAt = new Date();
        } else {
            chat.draftMessages.push({ userId, text });
        }

        await chat.save();

        // Socket emit to the user's other sessions/sockets for cross-device sync
        const io = getIO();
        const receiverSocketId = getReceiverSocketId(userId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('draftUpdated', { chatId, text });
        }

        return res.json({ message: "Draft saved", chat });
    } catch (error) {
        console.error("Error in saveDraft:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getDraft = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const draft = chat.draftMessages.find(d => d.userId.toString() === userId.toString());
        return res.json(draft || null);
    } catch (error) {
        console.error("Error in getDraft:", error);
        return res.status(500).json({ message: error.message });
    }
};
export const pinMessage = async (req, res) => {
    try {
        const { chatId, messageId } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // Only admin or moderators can pin
        const isAdmin = chat.admin && chat.admin.toString() === userId.toString();
        const isModerator = chat.moderators && chat.moderators.some(m => m.toString() === userId.toString());

        if (!isAdmin && !isModerator) {
            return res.status(403).json({ message: "Only admin and moderators can pin messages" });
        }

        if (chat.pinnedMessages.includes(messageId)) {
            return res.status(400).json({ message: "Message already pinned" });
        }

        chat.pinnedMessages.push(messageId);
        await chat.save();

        const populatedChat = await Chat.findById(chatId)
            .populate('pinnedMessages')
            .populate('members', '-password')
            .populate('admin', 'name profilePic');

        // Socket emit
        const io = getIO();
        chat.members.forEach(memberId => {
            const socketId = getReceiverSocketId(memberId.toString());
            if (socketId) {
                io.to(socketId).emit('chatPinnedUpdated', populatedChat);
            }
        });

        return res.json(populatedChat);

    } catch (error) {
        console.error("Error in pinMessage:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const unpinMessage = async (req, res) => {
    try {
        const { chatId, messageId } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // Only admin or moderators can unpin
        const isAdmin = chat.admin && chat.admin.toString() === userId.toString();
        const isModerator = chat.moderators && chat.moderators.some(m => m.toString() === userId.toString());

        if (!isAdmin && !isModerator) {
            return res.status(403).json({ message: "Only admin and moderators can unpin messages" });
        }

        chat.pinnedMessages = chat.pinnedMessages.filter(id => id.toString() !== messageId.toString());
        await chat.save();

        const populatedChat = await Chat.findById(chatId)
            .populate('pinnedMessages')
            .populate('members', '-password')
            .populate('admin', 'name profilePic');

        // Socket emit
        const io = getIO();
        chat.members.forEach(memberId => {
            const socketId = getReceiverSocketId(memberId.toString());
            if (socketId) {
                io.to(socketId).emit('chatPinnedUpdated', populatedChat);
            }
        });

        return res.json(populatedChat);

    } catch (error) {
        console.error("Error in unpinMessage:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const toggleArchive = async (req, res) => {
    try {
        const { chatId } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const isArchived = chat.archivedBy.includes(userId);
        if (isArchived) {
            chat.archivedBy = chat.archivedBy.filter(id => id.toString() !== userId.toString());
        } else {
            chat.archivedBy.push(userId);
        }

        await chat.save();
        return res.json({ message: isArchived ? "Chat unarchived" : "Chat archived", chat });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const toggleMute = async (req, res) => {
    try {
        const { chatId, muteUntil } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const muteIndex = chat.mutedBy.findIndex(m => m.userId.toString() === userId.toString());

        if (muteIndex !== -1) {
            chat.mutedBy.splice(muteIndex, 1);
        } else {
            chat.mutedBy.push({ userId, mutedUntil: muteUntil || null });
        }

        await chat.save();
        return res.json({ message: muteIndex !== -1 ? "Chat unmuted" : "Chat muted", chat });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        if (chat.type !== 'group') return res.status(400).json({ message: "Not a group chat" });

        if (chat.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can delete the group" });
        }

        await Chat.findByIdAndDelete(chatId);

        // Notify members via socket
        const io = getIO();
        chat.members.forEach(memberId => {
            const socketId = getReceiverSocketId(memberId.toString());
            if (socketId) {
                io.to(socketId).emit('groupDeleted', chatId);
            }
        });

        return res.json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error("Error in deleteGroup:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { chatId, groupName, groupDescription, groupImage, isPublic } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const isAdmin = chat.admin && chat.admin.toString() === userId.toString();
        const isModerator = chat.moderators && chat.moderators.some(m => m.toString() === userId.toString());

        if (!isAdmin && !isModerator) {
            return res.status(403).json({ message: "Only admin and moderators can update group settings" });
        }

        if (groupName) chat.groupName = groupName;
        if (groupDescription !== undefined) chat.groupDescription = groupDescription;
        if (groupImage) chat.groupImage = groupImage;
        if (isPublic !== undefined) chat.isPublic = isPublic;

        await chat.save();

        const populatedChat = await Chat.findById(chatId)
            .populate('members', '-password')
            .populate('admin', 'name profilePic');

        // Notify members
        const io = getIO();
        chat.members.forEach(memberId => {
            const socketId = getReceiverSocketId(memberId.toString());
            if (socketId) {
                io.to(socketId).emit('groupUpdated', populatedChat);
            }
        });

        return res.json(populatedChat);
    } catch (error) {
        console.error("Error in updateGroup:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const generateInviteCode = async (req, res) => {
    try {
        const { chatId } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        if (chat.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can generate invite link" });
        }

        // Simple random code
        const code = Math.random().toString(36).substring(2, 10);
        chat.inviteCode = code;
        await chat.save();

        return res.json({ inviteCode: code });
    } catch (error) {
        console.error("Error in generateInviteCode:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const joinGroupByInvite = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findOne({ inviteCode });
        if (!chat) return res.status(404).json({ message: "Invalid or expired invite link" });

        if (chat.members.includes(userId)) {
            return res.status(400).json({ message: "You are already a member of this group" });
        }

        chat.members.push(userId);
        await chat.save();

        await Message.create({
            chatId: chat.id,
            senderId: userId,
            text: `${req.user.name} joined via invite link`,
            isServiceMessage: true,
        });

        const populatedChat = await Chat.findById(chat.id)
            .populate('members', '-password')
            .populate('admin', 'name profilePic')
            .populate('lastMessage');

        return res.json(populatedChat);
    } catch (error) {
        console.error("Error in joinGroupByInvite:", error);
        return res.status(500).json({ message: error.message });
    }
};
