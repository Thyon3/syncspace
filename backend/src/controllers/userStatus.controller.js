import UserStatus from '../model/userStatus.model.js';
import { getIO } from '../config/socket.js';

export const updateUserStatus = async (req, res) => {
    try {
        const { status, customMessage, autoAwayTime } = req.body;
        const userId = req.user._id;

        let userStatus = await UserStatus.findOne({ userId });
        
        if (!userStatus) {
            userStatus = new UserStatus({ userId });
        }

        if (status) userStatus.status = status;
        if (customMessage !== undefined) userStatus.customMessage = customMessage;
        if (autoAwayTime) userStatus.autoAwayTime = autoAwayTime;
        
        userStatus.lastActivity = new Date();
        
        // Set expiration for temporary status
        if (status === 'busy' || status === 'dnd') {
            const { expiresIn } = req.body; // in minutes
            if (expiresIn) {
                userStatus.statusExpiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
            }
        } else {
            userStatus.statusExpiresAt = null;
        }

        await userStatus.save();

        // Broadcast status change to all connected users
        const io = getIO();
        io.emit('userStatusChanged', {
            userId,
            status: userStatus.status,
            customMessage: userStatus.customMessage,
            lastActivity: userStatus.lastActivity
        });

        res.json(userStatus);
    } catch (error) {
        console.error('Error in updateUserStatus:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const userStatus = await UserStatus.findOne({ userId }).populate('userId', 'name profilePic');
        
        if (!userStatus) {
            return res.json({
                userId,
                status: 'offline',
                customMessage: '',
                lastActivity: null
            });
        }

        // Check if status has expired
        if (userStatus.statusExpiresAt && userStatus.statusExpiresAt < new Date()) {
            userStatus.status = 'online';
            userStatus.statusExpiresAt = null;
            await userStatus.save();
        }

        res.json(userStatus);
    } catch (error) {
        console.error('Error in getUserStatus:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateActivity = async (req, res) => {
    try {
        const userId = req.user._id;

        let userStatus = await UserStatus.findOne({ userId });
        
        if (!userStatus) {
            userStatus = new UserStatus({ userId });
        }

        userStatus.lastActivity = new Date();
        
        // Auto-return from away if user becomes active
        if (userStatus.status === 'away' && userStatus.autoAwayEnabled) {
            userStatus.status = 'online';
        }

        await userStatus.save();

        res.json({ message: 'Activity updated' });
    } catch (error) {
        console.error('Error in updateActivity:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getMultipleUserStatuses = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds)) {
            return res.status(400).json({ message: 'userIds must be an array' });
        }

        const statuses = await UserStatus.find({ userId: { $in: userIds } })
            .populate('userId', 'name profilePic');

        // Create a map for quick lookup
        const statusMap = {};
        statuses.forEach(status => {
            // Check expiration
            if (status.statusExpiresAt && status.statusExpiresAt < new Date()) {
                status.status = 'online';
                status.statusExpiresAt = null;
                status.save();
            }
            statusMap[status.userId._id] = status;
        });

        // Fill in missing users with default status
        const result = userIds.map(userId => {
            return statusMap[userId] || {
                userId,
                status: 'offline',
                customMessage: '',
                lastActivity: null
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error in getMultipleUserStatuses:', error);
        res.status(500).json({ message: error.message });
    }
};

// Background job to auto-set users to away
export const checkAutoAway = async () => {
    try {
        const now = new Date();
        const statuses = await UserStatus.find({
            status: 'online',
            autoAwayEnabled: true,
            lastActivity: {
                $lt: new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago
            }
        });

        const io = getIO();
        
        for (const status of statuses) {
            const awayTime = status.autoAwayTime * 60 * 1000; // convert to milliseconds
            if (now - status.lastActivity >= awayTime) {
                status.status = 'away';
                await status.save();

                // Broadcast status change
                io.emit('userStatusChanged', {
                    userId: status.userId,
                    status: 'away',
                    customMessage: status.customMessage,
                    lastActivity: status.lastActivity
                });
            }
        }
    } catch (error) {
        console.error('Error in checkAutoAway:', error);
    }
};