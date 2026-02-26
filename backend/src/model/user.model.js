import mongoose, { mongo } from 'mongoose';

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        unique: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    hashPassword: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        required: false,
    },
    profilePicPublicId: {
        type: String, required: false
    },
    bio: {
        type: String,
        maxlength: 150,
        default: '',
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    privacySettings: {
        lastSeen: {
            type: String,
            enum: ['everyone', 'contacts', 'nobody'],
            default: 'everyone',
        },
        profilePic: {
            type: String,
            enum: ['everyone', 'contacts', 'nobody'],
            default: 'everyone',
        },
        about: {
            type: String,
            enum: ['everyone', 'contacts', 'nobody'],
            default: 'everyone',
        },
    }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User; 