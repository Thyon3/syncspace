import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
    callerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
    },
    type: {
        type: String,
        enum: ['voice', 'video'],
        required: true,
    },
    status: {
        type: String,
        enum: ['initiated', 'ringing', 'answered', 'ended', 'missed', 'declined', 'busy'],
        default: 'initiated',
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: {
        type: Date,
    },
    duration: {
        type: Number, // in seconds
        default: 0,
    },
    quality: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
    },
    endReason: {
        type: String,
        enum: ['normal', 'timeout', 'network_error', 'declined', 'busy'],
    }
}, { timestamps: true });

const Call = mongoose.model('Call', callSchema);

export default Call;