
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        required: true,
        type: mongoose.Types.ObjectId,
        ref: 'User',

    }, recieverId: {
        required: true,
        type: mongoose.Types.ObjectId,
        ref: 'User',

    }, text: {
        maxlength: 2000,
        trim: true,
        type: String,

    }, image: {

        type: String
    }
}, { timestamps: true });

const User = mongoose.model('Message', messageSchema);

export default User; 