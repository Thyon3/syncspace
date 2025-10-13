import mongoose from 'mongoose';
import { ENV } from '../util/env.js';

const connectDB = async function () {
    try {
        await mongoose.connect(ENV.MONGOOSE_CONNECTION_STRING);
        console.log('mongoDb connected');
    } catch (error) {
        console.log('mongoose connection error ', error);
        process.exit(1);
    }
}

export default connectDB; 