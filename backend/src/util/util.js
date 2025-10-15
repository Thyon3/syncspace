
import jwt from 'jsonwebtoken';
import { ENV } from './env.js';
export const generateToken = async function (userId, res) {
    const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
        expiresIn: "7d"
    });

    console.log('token generated', token);

    res.cookie('userJwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
        secure: ENV.NODE_ENV === 'production' // only true in production
    });
}
