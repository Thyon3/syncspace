import User from '../model/user.model.js';
import { getIO, getReceiverSocketId } from '../config/socket.js';

export const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        if (userId === currentUserId.toString()) {
            return res.status(400).json({ message: "Cannot block yourself" });
        }

        const user = await User.findById(currentUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.blockedUsers.includes(userId)) {
            return res.status(400).json({ message: "User already blocked" });
        }

        user.blockedUsers.push(userId);
        await user.save();

        const io = getIO();
        const receiverSocketId = getReceiverSocketId(userId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('userBlocked', { blockedBy: currentUserId });
        }

        res.status(200).json({ message: "User blocked successfully", blockedUsers: user.blockedUsers });
    } catch (error) {
        console.error("Error in blockUser:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const user = await User.findById(currentUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
        await user.save();

        const io = getIO();
        const receiverSocketId = getReceiverSocketId(userId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('userUnblocked', { unblockedBy: currentUserId });
        }

        res.status(200).json({ message: "User unblocked successfully", blockedUsers: user.blockedUsers });
    } catch (error) {
        console.error("Error in unblockUser:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getBlockedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate('blockedUsers', 'name profilePic email');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.blockedUsers);
    } catch (error) {
        console.error("Error in getBlockedUsers:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
