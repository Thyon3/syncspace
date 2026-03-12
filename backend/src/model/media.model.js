import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: true,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    uploaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['image', 'video', 'audio', 'document', 'voice'],
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number, // in bytes
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    thumbnailUrl: {
        type: String, // for videos and images
    },
    duration: {
        type: Number, // for audio/video in seconds
    },
    dimensions: {
        width: Number,
        height: Number,
    },
    isCompressed: {
        type: Boolean,
        default: false,
    },
    downloadCount: {
        type: Number,
        default: 0,
    },
    expiresAt: {
        type: Date, // for self-destructing media
    }
}, { timestamps: true });

// Index for efficient media queries
mediaSchema.index({ chatId: 1, type: 1, createdAt: -1 });
mediaSchema.index({ uploaderId: 1, createdAt: -1 });

const Media = mongoose.model('Media', mediaSchema);

export default Media;