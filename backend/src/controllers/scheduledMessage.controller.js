import ScheduledMessage from '../model/scheduledMessage.model.js';
import Message from '../model/message.model.js';
import Chat from '../model/chat.model.js';
import { getIO, getReceiverSocketId } from '../config/socket.js';

export const scheduleMessage = async (req, res) => {
    try {
        const { chatId, text, image, fileUrl, fileType, fileName, fileSize, scheduledTime, timezone } = req.body;
        const senderId = req.user._id;

        if (!scheduledTime || new Date(scheduledTime) <= new Date()) {
            return res.status(400).json({ message: "Scheduled time must be in the future" });
        }

        if (!text && !image && !fileUrl) {
            return res.status(400).json({ message: "Message content cannot be empty" });
        }

        // Verify user is member of chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.members.includes(senderId)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const scheduledMessage = new ScheduledMessage({
            senderId,
            chatId,
            text,
            image,
            fileUrl,
            fileType,
            fileName,
            fileSize,
            scheduledTime: new Date(scheduledTime),
            timezone: timezone || 'UTC'
        });

        await scheduledMessage.save();

        res.status(201).json(scheduledMessage);
    } catch (error) {
        console.error('Error in scheduleMessage:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getScheduledMessages = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { status = 'pending' } = req.query;

        const messages = await ScheduledMessage.find({ senderId, status })
            .populate('chatId', 'groupName type members')
            .sort({ scheduledTime: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error in getScheduledMessages:', error);
        res.status(500).json({ message: error.message });
    }
};

export const cancelScheduledMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const senderId = req.user._id;

        const scheduledMessage = await ScheduledMessage.findOne({ _id: messageId, senderId });
        
        if (!scheduledMessage) {
            return res.status(404).json({ message: "Scheduled message not found" });
        }

        if (scheduledMessage.status !== 'pending') {
            return res.status(400).json({ message: "Cannot cancel message that is not pending" });
        }

        scheduledMessage.status = 'cancelled';
        await scheduledMessage.save();

        res.json({ message: "Scheduled message cancelled" });
    } catch (error) {
        console.error('Error in cancelScheduledMessage:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateScheduledMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text, image, scheduledTime } = req.body;
        const senderId = req.user._id;

        const scheduledMessage = await ScheduledMessage.findOne({ _id: messageId, senderId });
        
        if (!scheduledMessage) {
            return res.status(404).json({ message: "Scheduled message not found" });
        }

        if (scheduledMessage.status !== 'pending') {
            return res.status(400).json({ message: "Cannot update message that is not pending" });
        }

        if (scheduledTime && new Date(scheduledTime) <= new Date()) {
            return res.status(400).json({ message: "Scheduled time must be in the future" });
        }

        if (text !== undefined) scheduledMessage.text = text;
        if (image !== undefined) scheduledMessage.image = image;
        if (scheduledTime) scheduledMessage.scheduledTime = new Date(scheduledTime);

        await scheduledMessage.save();

        res.json(scheduledMessage);
    } catch (error) {
        console.error('Error in updateScheduledMessage:', error);
        res.status(500).json({ message: error.message });
    }
};

// Background job to process scheduled messages
export const processScheduledMessages = async () => {
    try {
        const now = new Date();
        const pendingMessages = await ScheduledMessage.find({
            status: 'pending',
            scheduledTime: { $lte: now }
        }).populate('chatId');

        for (const scheduledMsg of pendingMessages) {
            try {
                // Create the actual message
                const message = new Message({
                    senderId: scheduledMsg.senderId,
                    chatId: scheduledMsg.chatId._id,
                    text: scheduledMsg.text,
                    image: scheduledMsg.image,
                    fileUrl: scheduledMsg.fileUrl,
                    fileType: scheduledMsg.fileType,
                    fileName: scheduledMsg.fileName,
                    fileSize: scheduledMsg.fileSize
                });

                await message.save();

                // Update chat's last message
                await Chat.findByIdAndUpdate(scheduledMsg.chatId._id, { lastMessage: message._id });

                // Emit to chat members
                const io = getIO();
                scheduledMsg.chatId.members.forEach(memberId => {
                    if (memberId.toString() === scheduledMsg.senderId.toString()) return;
                    const socketId = getReceiverSocketId(memberId.toString());
                    if (socketId) {
                        io.to(socketId).emit('newMessage', message);
                    }
                });

                // Update scheduled message status
                scheduledMsg.status = 'sent';
                scheduledMsg.sentAt = new Date();
                await scheduledMsg.save();

            } catch (error) {
                console.error('Error sending scheduled message:', error);
                scheduledMsg.status = 'failed';
                scheduledMsg.failureReason = error.message;
                await scheduledMsg.save();
            }
        }
    } catch (error) {
        console.error('Error in processScheduledMessages:', error);
    }
};

export const getScheduledMessageStats = async (req, res) => {
    try {
        const senderId = req.user._id;

        const stats = await ScheduledMessage.aggregate([
            { $match: { senderId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            pending: 0,
            sent: 0,
            failed: 0,
            cancelled: 0
        };

        stats.forEach(stat => {
            result[stat._id] = stat.count;
        });

        res.json(result);
    } catch (error) {
        console.error('Error in getScheduledMessageStats:', error);
        res.status(500).json({ message: error.message });
    }
};