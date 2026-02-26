import Chat from '../model/chat.model.js';
import messageModel from '../model/message.model.js';
import { getIO, getReceiverSocketId } from '../config/socket.js';

export const pinMessage = async (req, res) => {
    try {
        const { chatId, messageId } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const isAdmin = chat.admin && chat.admin.toString() === userId.toString();
        const isModerator = chat.moderators && chat.moderators.some(m => m.toString() === userId.toString());

        if (chat.type === 'group' && !isAdmin && !isModerator) {
            return res.status(403).json({ message: "Only admins and moderators can pin messages" });
        }

        if (chat.pinnedMessages.includes(messageId)) {
            return res.status(400).json({ message: "Message already pinned" });
        }

        chat.pinnedMessages.push(messageId);
        await chat.save();

        const populatedChat = await Chat.findById(chatId)
            .populate('pinnedMessages');

        const io = getIO();
        chat.members.forEach(memberId => {
            const receiverSocketId = getReceiverSocketId(memberId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('messagePinned', {
                    chatId,
                    messageId,
                    pinnedMessages: populatedChat.pinnedMessages
                });
            }
        });

        res.status(200).json(populatedChat);
    } catch (error) {
        console.error("Error in pinMessage:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const unpinMessage = async (req, res) => {
    try {
        const { chatId, messageId } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const isAdmin = chat.admin && chat.admin.toString() === userId.toString();
        const isModerator = chat.moderators && chat.moderators.some(m => m.toString() === userId.toString());

        if (chat.type === 'group' && !isAdmin && !isModerator) {
            return res.status(403).json({ message: "Only admins and moderators can unpin messages" });
        }

        chat.pinnedMessages = chat.pinnedMessages.filter(id => id.toString() !== messageId);
        await chat.save();

        const io = getIO();
        chat.members.forEach(memberId => {
            const receiverSocketId = getReceiverSocketId(memberId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('messageUnpinned', {
                    chatId,
                    messageId,
                    pinnedMessages: chat.pinnedMessages
                });
            }
        });

        res.status(200).json(chat);
    } catch (error) {
        console.error("Error in unpinMessage:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
