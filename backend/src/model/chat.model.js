import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    type: {
        type: String,
        enum: ['direct', 'group'],
        default: 'direct',
    },
    groupName: {
        type: String,
        trim: true,
    },
    groupImage: {
        type: String, // URL to group image
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    pinnedMessages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    }],
    groupDescription: {
        type: String,
        maxlength: 500,
    },
    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    mutedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        mutedUntil: {
            type: Date,
        }
    }],
    archivedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    draftMessages: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        text: {
            type: String,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        }
    }],
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
