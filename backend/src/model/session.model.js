import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
        index: true,
    },
    userAgent: {
        type: String,
    },
    ip: {
        type: String,
    },
    deviceType: {
        type: String, // 'Desktop', 'Mobile', 'Tablet', 'Unknown'
    },
    lastActive: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
