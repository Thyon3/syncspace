import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { userAuthStore } from '../store/userAuthStore';

const SOCKET_URL = 'http://localhost:3001';

let socket = null;

export const useSocket = () => {
    const socketRef = useRef(null);
    const { authUser } = userAuthStore();

    useEffect(() => {
        if (!authUser?._id) return;

        // Only create socket if it doesn't exist
        if (!socket) {
            socket = io(SOCKET_URL, {
                query: {
                    userId: authUser._id,
                },
                autoConnect: true,
            });

            socket.on('connect', () => {
                console.log('🔌 Connected to Socket.IO server');
            });

            socket.on('disconnect', () => {
                console.log('🔌 Disconnected from Socket.IO server');
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }

        socketRef.current = socket;

        return () => {
            // Don't disconnect on unmount, keep connection alive
            // socket.disconnect();
        };
    }, [authUser?._id]);

    return socketRef.current;
};

export const getSocket = () => socket;
