import Call from '../model/call.model.js';
import { getIO, getReceiverSocketId } from '../config/socket.js';
import { createNotification } from './notification.controller.js';

export const initiateCall = async (req, res) => {
    try {
        const { receiverId, type, chatId } = req.body;
        const callerId = req.user._id;

        if (callerId.toString() === receiverId.toString()) {
            return res.status(400).json({ message: "Cannot call yourself" });
        }

        const call = new Call({
            callerId,
            receiverId,
            chatId,
            type,
            status: 'initiated'
        });

        await call.save();

        // Notify receiver via socket
        const io = getIO();
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('incomingCall', {
                callId: call._id,
                caller: req.user,
                type,
                chatId
            });
        }

        // Create notification
        await createNotification(
            receiverId,
            'call',
            `${type === 'video' ? 'Video' : 'Voice'} call`,
            `${req.user.name} is calling you`,
            { callId: call._id, senderId: callerId }
        );

        res.status(201).json(call);
    } catch (error) {
        console.error('Error in initiateCall:', error);
        res.status(500).json({ message: error.message });
    }
};

export const answerCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user._id;

        const call = await Call.findById(callId);
        if (!call) {
            return res.status(404).json({ message: "Call not found" });
        }

        if (call.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        call.status = 'answered';
        call.startTime = new Date();
        await call.save();

        // Notify caller
        const io = getIO();
        const callerSocketId = getReceiverSocketId(call.callerId.toString());
        if (callerSocketId) {
            io.to(callerSocketId).emit('callAnswered', { callId });
        }

        res.json(call);
    } catch (error) {
        console.error('Error in answerCall:', error);
        res.status(500).json({ message: error.message });
    }
};

export const endCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const { endReason = 'normal', quality } = req.body;
        const userId = req.user._id;

        const call = await Call.findById(callId);
        if (!call) {
            return res.status(404).json({ message: "Call not found" });
        }

        const isParticipant = call.callerId.toString() === userId.toString() || 
                             call.receiverId.toString() === userId.toString();

        if (!isParticipant) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        call.status = 'ended';
        call.endTime = new Date();
        call.endReason = endReason;
        if (quality) call.quality = quality;

        if (call.startTime && call.status === 'answered') {
            call.duration = Math.floor((call.endTime - call.startTime) / 1000);
        }

        await call.save();

        // Notify other participant
        const io = getIO();
        const otherUserId = call.callerId.toString() === userId.toString() ? 
                           call.receiverId.toString() : call.callerId.toString();
        const otherSocketId = getReceiverSocketId(otherUserId);
        if (otherSocketId) {
            io.to(otherSocketId).emit('callEnded', { callId, endReason });
        }

        res.json(call);
    } catch (error) {
        console.error('Error in endCall:', error);
        res.status(500).json({ message: error.message });
    }
};

export const declineCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user._id;

        const call = await Call.findById(callId);
        if (!call) {
            return res.status(404).json({ message: "Call not found" });
        }

        if (call.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        call.status = 'declined';
        call.endTime = new Date();
        call.endReason = 'declined';
        await call.save();

        // Notify caller
        const io = getIO();
        const callerSocketId = getReceiverSocketId(call.callerId.toString());
        if (callerSocketId) {
            io.to(callerSocketId).emit('callDeclined', { callId });
        }

        res.json(call);
    } catch (error) {
        console.error('Error in declineCall:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getCallHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

        const calls = await Call.find({
            $or: [{ callerId: userId }, { receiverId: userId }]
        })
        .populate('callerId', 'name profilePic')
        .populate('receiverId', 'name profilePic')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        res.json(calls);
    } catch (error) {
        console.error('Error in getCallHistory:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getCallStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await Call.aggregate([
            {
                $match: {
                    $or: [{ callerId: userId }, { receiverId: userId }],
                    status: 'ended'
                }
            },
            {
                $group: {
                    _id: null,
                    totalCalls: { $sum: 1 },
                    totalDuration: { $sum: '$duration' },
                    voiceCalls: { $sum: { $cond: [{ $eq: ['$type', 'voice'] }, 1, 0] } },
                    videoCalls: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } },
                    avgDuration: { $avg: '$duration' }
                }
            }
        ]);

        res.json(stats[0] || {
            totalCalls: 0,
            totalDuration: 0,
            voiceCalls: 0,
            videoCalls: 0,
            avgDuration: 0
        });
    } catch (error) {
        console.error('Error in getCallStats:', error);
        res.status(500).json({ message: error.message });
    }
};