import Chat from '../model/chat.model.js';
import User from '../model/user.model.js';
import { getIO } from '../config/socket.js';

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
