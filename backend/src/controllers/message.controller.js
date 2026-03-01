// const userModel = require("../model/user.model");
// const messageModel = require("../model/message.model");
// const cloudinary = require("../config/cloudinary");


import messageModel from '../model/message.model.js';
import userModel from '../model/user.model.js';
import Chat from '../model/chat.model.js'; // Import Chat model
import cloudinary from '../config/cloudinary.js';
import { getIO, getReceiverSocketId } from '../config/socket.js';

export const searchMessages = async (req, res) => {
    try {
        const { query, chatId } = req.query;
        const userId = req.user._id;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchQuery = {
            text: { $regex: query, $options: 'i' }
        };

        // If searching within a specific chat
        if (chatId) {
            searchQuery.chatId = chatId;
        } else {
            // searching globally, only show messages from chats the user is a member of
            const userChats = await Chat.find({ members: userId }).select('_id');
            const chatIds = userChats.map(c => c._id);
            searchQuery.chatId = { $in: chatIds };
        }

        const messages = await messageModel.find(searchQuery)
            .populate('senderId', 'name profilePic')
            .populate('chatId', 'groupName type')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in searchMessages controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        const message = await messageModel.findById(id);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Only sender can edit
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to edit this message" });
        }

        message.text = text;
        message.isEdited = true;
        await message.save();

        const populatedMessage = await messageModel.findById(id)
            .populate('senderId', 'name profilePic')
            .populate('chatId')
            .populate({
                path: 'replyTo',
                populate: { path: 'senderId', select: 'name profilePic' }
            });

        // Emit socket event
        const io = getIO();
        const chat = await Chat.findById(message.chatId);
        if (chat) {
            chat.members.forEach(memberId => {
                const receiverSocketId = getReceiverSocketId(memberId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('messageEdited', populatedMessage);
                }
            });
        }

        res.status(200).json(populatedMessage);
    } catch (error) {
        console.error("Error in editMessage controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const message = await messageModel.findById(id);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Only sender can delete (could add admin logic later)
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this message" });
        }

        message.isDeleted = true;
        message.text = "Message deleted";
        message.image = null;
        message.fileUrl = null;
        await message.save();

        // Emit socket event
        const io = getIO();
        const chat = await Chat.findById(message.chatId);
        if (chat) {
            chat.members.forEach(memberId => {
                const receiverSocketId = getReceiverSocketId(memberId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('messageDeleted', { messageId: id, chatId: message.chatId });
                }
            });
        }

        res.status(200).json({ message: "Message deleted successfully", messageId: id });
    } catch (error) {
        console.error("Error in deleteMessage controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllContacts = async function (req, res) {
    try {
        // get all users except the one who is logged in
        const loggedInUserId = req.user._id;
        const allContacts = await userModel
            .find({ _id: { $ne: loggedInUserId } })
            .select("-password");
        if (!allContacts) {
            return res.status(404).json({
                message: "could not found ur contacts",
            });
        }
        return res.json(allContacts);
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            type: error.name,
        });
    }
};
export const getChatPartners = async function (req, res) {
    try {
        const currentUserId = req.user._id;

        // Find all messages involving the current user
        const messages = await messageModel.find({
            $or: [{ senderId: currentUserId }, { recieverId: currentUserId }],
        });

        if (messages.length === 0) {
            return res.status(404).json({
                message: "there are not messages",
            });
        }

        // Extract unique partner IDs
        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) =>
                    msg.senderId.toString() === currentUserId.toString()
                        ? msg.recieverId.toString()
                        : msg.senderId.toString()
                )
            ),
        ];

        // Retrieve user documents for the chat partners
        const chats = await userModel
            .find({ _id: { $in: chatPartnerIds } })
            .select("-password"); // exclude password

        return res.json(chats);
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            type: error.name,
        });
    }
};

export const sendMessage = async function (req, res) {
    try {
        const senderId = req.user._id;
        // recieverId might come from params (1:1) or body (potentially)
        // chatId comes from body for groups
        const { text, image, fileUrl, fileType, fileName, fileSize, chatId, replyTo, isSilent } = req.body;
        const recieverId = req.params.userId; // Optional if chatId is provided

        let targetChatId = chatId;
        let targetRecieverId = recieverId;

        // 1. Handle 1:1 Chat (if recieverId provided but no chatId)
        if (!targetChatId && targetRecieverId) {
            // Check for self-message
            if (senderId.toString() === targetRecieverId.toString()) {
                return res.status(400).json({ message: "You cannot send a message to yourself" });
            }

            // Find or Create Direct Chat
            let chat = await Chat.findOne({
                type: 'direct',
                members: { $all: [senderId, targetRecieverId] }
            });

            if (!chat) {
                chat = await Chat.create({
                    type: 'direct',
                    members: [senderId, targetRecieverId]
                });
            }
            targetChatId = chat._id;
        }

        // 2. Validate Target
        if (!targetChatId && !targetRecieverId) {
            return res.status(400).json({ message: "Chat ID or Receiver ID is required" });
        }

        if (!text && !image && !fileUrl) {
            return res.status(400).json({
                message: "Message content cannot be empty",
            });
        }

        let finalImageUrl = image;

        // Handle Image Upload (Base64)
        if (image && !image.startsWith('http')) {
            const imageUploader = await cloudinary.uploader.upload(image);
            finalImageUrl = imageUploader.secure_url;
        }

        const newMessage = new messageModel({
            senderId,
            recieverId: targetRecieverId, // Keep for backward compatibility (1:1)
            chatId: targetChatId,
            text,
            image: finalImageUrl,
            fileUrl,
            fileType: fileType || (finalImageUrl ? 'image' : 'text'),
            fileName,
            fileSize,
            replyTo: replyTo || null,
            isSilent: isSilent === 'true' || isSilent === true,
        });

        await newMessage.save();

        // Update Chat lastMessage
        if (targetChatId) {
            await Chat.findByIdAndUpdate(targetChatId, { lastMessage: newMessage._id });
        }

        // Emit real-time event
        const io = getIO();

        if (targetChatId) {
            // Get all members of the chat to emit to
            const chat = await Chat.findById(targetChatId);
            if (chat) {
                chat.members.forEach(memberId => {
                    if (memberId.toString() === senderId.toString()) return; // Don't emit to sender? (Frontend handles optimistic)

                    const socketId = getReceiverSocketId(memberId.toString());
                    if (socketId) {
                        io.to(socketId).emit('newMessage', newMessage);
                    }
                });
            }
        } else if (targetRecieverId) {
            // Fallback for purely legacy (should be covered above by auto-creation)
            const receiverSocketId = getReceiverSocketId(targetRecieverId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newMessage', newMessage);
            }
        }

        return res.json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        return res.status(500).json({
            message: error.message,
            type: error.name,
        });
    }
};

export const getMessagesByChatId = async function (req, res) {
    try {
        const { chatId } = req.params;
        const currentUserId = req.user._id;

        // Verify user is member of chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (!chat.members.includes(currentUserId)) {
            return res.status(403).json({ message: "You are not a member of this chat" });
        }

        const messages = await messageModel.find({ chatId })
            .populate('senderId', 'name profilePic')
            .populate({
                path: 'replyTo',
                populate: { path: 'senderId', select: 'name profilePic' }
            })
            .sort({ createdAt: 1 });
        return res.json(messages);

    } catch (error) {
        console.error("Error in getMessagesByChatId:", error);
        return res.status(500).json({ message: error.message });
    }
};
export const messages = async function (req, res) {
    try {
        const messages = await messageModel.find();
        return res.json(messages);
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            type: error.name
        })
    }
}

export const getMessagesById = async function (req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const id = req.user._id;
        const chatPartnerId = req.params.userId;

        const messages = await messageModel.find({
            $or: [
                { recieverId: id, senderId: chatPartnerId },
                { senderId: id, recieverId: chatPartnerId },
            ],
        }).sort({ createdAt: 1 });

        // return empty array instead of 404
        return res.json(messages);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
            type: error.name,
        });
    }
};

export const markMessageAsRead = async function (req, res) {
    try {
        const { messageIds } = req.body;
        const userId = req.user._id;

        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({ message: "Invalid message IDs" });
        }

        await messageModel.updateMany(
            { _id: { $in: messageIds }, recieverId: userId },
            { $set: { isRead: true, readAt: new Date() } }
        );

        // Notify sender via Socket.IO
        // Find one message to get the sender
        const message = await messageModel.findOne({ _id: messageIds[0] });
        if (message) {
            const io = getIO();
            const senderSocketId = getReceiverSocketId(message.senderId.toString());
            if (senderSocketId) {
                io.to(senderSocketId).emit('messagesRead', {
                    messageIds,
                    readBy: userId
                });
            }
        }

        return res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
            type: error.name,
        });
    }
};


export const forwardMessage = async (req, res) => {
    try {
        const { messageId, targetChatIds } = req.body;
        const userId = req.user._id;

        if (!messageId || !targetChatIds || !Array.isArray(targetChatIds)) {
            return res.status(400).json({ message: "Message ID and target chat IDs are required" });
        }

        const originalMessage = await messageModel.findById(messageId);
        if (!originalMessage) {
            return res.status(404).json({ message: "Message not found" });
        }

        const forwardedMessages = [];
        const io = getIO();

        for (const chatId of targetChatIds) {
            const chat = await Chat.findById(chatId);
            if (!chat || !chat.members.includes(userId)) {
                continue;
            }

            const newMessage = new messageModel({
                senderId: userId,
                chatId: chatId,
                text: originalMessage.text,
                image: originalMessage.image,
                fileUrl: originalMessage.fileUrl,
                fileType: originalMessage.fileType,
                fileName: originalMessage.fileName,
                fileSize: originalMessage.fileSize,
            });

            await newMessage.save();
            await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

            forwardedMessages.push(newMessage);

            chat.members.forEach(memberId => {
                if (memberId.toString() === userId.toString()) return;
                const socketId = getReceiverSocketId(memberId.toString());
                if (socketId) {
                    io.to(socketId).emit('newMessage', newMessage);
                }
            });
        }

        res.status(200).json({ message: "Message forwarded successfully", forwardedMessages });
    } catch (error) {
        console.error("Error in forwardMessage:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;

        const count = await messageModel.countDocuments({
            chatId,
            recieverId: userId,
            isRead: false
        });

        res.status(200).json({ count });
    } catch (error) {
        console.error("Error in getUnreadCount:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const scheduleMessage = async (req, res) => {
    try {
        const { chatId, text, image, scheduledTime } = req.body;
        const userId = req.user._id;

        if (!scheduledTime || new Date(scheduledTime) <= new Date()) {
            return res.status(400).json({ message: "Invalid scheduled time" });
        }

        res.status(200).json({ message: "Message scheduled successfully" });
    } catch (error) {
        console.error("Error in scheduleMessage:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
export const toggleReaction = async (req, res) => {
    try {
        const { messageId, emoji } = req.body;
        const userId = req.user._id;

        const message = await messageModel.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        const existingReactionIndex = message.reactions.findIndex(
            r => r.userId.toString() === userId.toString() && r.emoji === emoji
        );

        if (existingReactionIndex > -1) {
            // Remove reaction if already exists
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            // Add new reaction
            message.reactions.push({ userId, emoji });
        }

        await message.save();

        const updatedMessage = await messageModel.findById(messageId)
            .populate('senderId', 'name profilePic')
            .populate({
                path: 'replyTo',
                populate: { path: 'senderId', select: 'name profilePic' }
            });

        // Emit socket event to chat members 
        const io = getIO();
        const chat = await Chat.findById(message.chatId);
        if (chat) {
            chat.members.forEach(memberId => {
                const socketId = getReceiverSocketId(memberId.toString());
                if (socketId) {
                    io.to(socketId).emit('messageReaction', {
                        messageId,
                        reactions: updatedMessage.reactions,
                        chatId: message.chatId
                    });
                }
            });
        }

        res.status(200).json(updatedMessage);
    } catch (error) {
        console.error("Error in toggleReaction:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
