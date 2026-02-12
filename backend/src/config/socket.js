import { Server } from 'socket.io';

let io;
const userSocketMap = new Map(); // Map userId to socketId

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // Get userId from handshake query
        const userId = socket.handshake.query.userId;

        if (userId && userId !== 'undefined') {
            userSocketMap.set(userId, socket.id);
            console.log(`👤 User ${userId} mapped to socket ${socket.id}`);

            // Broadcast online status to all connected clients
            io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
        }

        // Handle typing events
        socket.on('typing', ({ receiverId, isTyping }) => {
            const receiverSocketId = userSocketMap.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('userTyping', {
                    userId,
                    isTyping,
                });
            }
        });

        // Handle message read receipts
        socket.on('messageRead', ({ senderId, messageIds }) => {
            const senderSocketId = userSocketMap.get(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit('messagesRead', {
                    messageIds,
                    readBy: userId,
                });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('🔌 User disconnected:', socket.id);

            if (userId && userId !== 'undefined') {
                userSocketMap.delete(userId);
                // Broadcast offline status
                io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap.get(receiverId);
};

export { userSocketMap };
