
import jwt from 'jsonwebtoken';
import { ENV } from './env.js';
export const generateToken = async function (userId, res) {
    const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
        expiresIn: "7d"
    });

    console.log('token generated ', token);
    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: ENV.NODE_ENV === 'production' ? false : true
    });
}