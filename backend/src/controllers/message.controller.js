// const userModel = require("../model/user.model");
// const messageModel = require("../model/message.model");
// const cloudinary = require("../config/cloudinary");


import userModel from '../model/user.model.js';
import messageModel from '../model/message.model.js';
import cloudinary from '../config/cloudinary.js';
import { getIO, getReceiverSocketId } from '../config/socket.js';

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
        // get the sender and hte reciever id
        const senderId = req.user._id;
        const recieverId = req.params.userId;

        if (senderId.toString() === recieverId.toString()) {
            return res.status(400).json({
                message: "you can not send message to yourself",
            });
        }

        const reciever = await userModel.findById(recieverId);
        if (!reciever) {
            return res.status(404).json({
                message: "reciever does not found",
            });
        }

        const { text, image } = req.body;
        if (!text && !image) {
            return res.status(400).json({
                message: "message can not be empty",
            });
        }

        let imageUrl;
        // if the image is not null upload the image
        if (image) {
            const imageUploader = await cloudinary.uploader.upload(image);
            imageUrl = imageUploader.secure_url;
        }
        const newMessage = new messageModel({
            senderId,
            recieverId,
            image: imageUrl,
            text,
        });
        await newMessage.save();

        // Emit real-time event to receiver
        const io = getIO();
        const receiverSocketId = getReceiverSocketId(recieverId.toString());

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        return res.json(newMessage);
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            type: error.name,
        });
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

