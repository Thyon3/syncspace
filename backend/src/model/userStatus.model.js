import mongoose from 'mongoose';

const userStatusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['online', 'away', 'busy', 'dnd', 'offline'],
        default: 'offline',
    },
    customMessage: {
        type: String,
        maxlength: 100,
    },
    autoAwayEnabled: {
        type: Boolean,
        default: true,
    },
    autoAwayTime: {
        type: Number, // minutes of inactivity
        default: 5,
    },
    lastActivity: {
        type: Date,
        default: Date.now,
    },
    statusExpiresAt: {
        type: Date, // for temporary status like "busy for 1 hour"
    }
}, { timestamps: true });

const UserStatus = mongoose.model('UserStatus', userStatusSchema);

export default UserStatus;