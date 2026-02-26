import messageModel from '../model/message.model.js';
import { getIO, getReceiverSocketId } from '../config/socket.js';
import Chat from '../model/chat.model.js';

export const addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        if (!emoji) {
            return res.status(400).json({ message: "Emoji is required" });
        }

        const message = await messageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        const existingReaction = message.reactions.find(
            r => r.userId.toString() === userId.toString() && r.emoji === emoji
        );

        if (existingReaction) {
            return res.status(400).json({ message: "Already reacted with this emoji" });
        }

        message.reactions.push({ userId, emoji });
        await message.save();

        const populatedMessage = await messageModel.findById(messageId)
            .populate('reactions.userId', 'name profilePic');

        const io = getIO();
        const chat = await Chat.findById(message.chatId);
        if (chat) {
            chat.members.forEach(memberId => {
                const receiverSocketId = getReceiverSocketId(memberId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('reactionAdded', {
                        messageId,
                        reaction: { userId, emoji },
                        reactions: populatedMessage.reactions
                    });
                }
            });
        }

        res.status(200).json(populatedMessage);
    } catch (error) {
        console.error("Error in addReaction:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const removeReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await messageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        message.reactions = message.reactions.filter(
            r => !(r.userId.toString() === userId.toString() && r.emoji === emoji)
        );
        await message.save();

        const populatedMessage = await messageModel.findById(messageId)
            .populate('reactions.userId', 'name profilePic');

        const io = getIO();
        const chat = await Chat.findById(message.chatId);
        if (chat) {
            chat.members.forEach(memberId => {
                const receiverSocketId = getReceiverSocketId(memberId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('reactionRemoved', {
                        messageId,
                        userId,
                        emoji,
                        reactions: populatedMessage.reactions
                    });
                }
            });
        }

        res.status(200).json(populatedMessage);
    } catch (error) {
        console.error("Error in removeReaction:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
