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

        const userId = socket.handshake.query.userId;

        if (userId && userId !== 'undefined') {
            userSocketMap.set(userId, socket.id);
            console.log(`👤 User ${userId} mapped to socket ${socket.id}`);

            import('./model/user.model.js').then(({ default: User }) => {
                User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
            });

            io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
        }

        socket.on('typing', ({ receiverId, isTyping }) => {
            const receiverSocketId = userSocketMap.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('userTyping', {
                    userId,
                    isTyping,
                });
            }
        });

        socket.on('messageRead', ({ senderId, messageIds }) => {
            const senderSocketId = userSocketMap.get(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit('messagesRead', {
                    messageIds,
                    readBy: userId,
                });
            }
        });

        socket.on('callUser', ({ to, offer, from }) => {
            const receiverSocketId = userSocketMap.get(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('incomingCall', { from, offer });
            }
        });

        socket.on('answerCall', ({ to, answer }) => {
            const receiverSocketId = userSocketMap.get(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('callAnswered', { answer });
            }
        });

        socket.on('endCall', ({ to }) => {
            const receiverSocketId = userSocketMap.get(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('callEnded');
            }
        });

        socket.on('disconnect', () => {
            console.log('🔌 User disconnected:', socket.id);

            if (userId && userId !== 'undefined') {
                import('./model/user.model.js').then(({ default: User }) => {
                    User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
                });

                userSocketMap.delete(userId);
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
