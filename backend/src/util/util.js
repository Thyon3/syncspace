
import jwt from 'jsonwebtoken';
import { ENV } from './env.js';
import Session from '../model/session.model.js';

export const generateToken = async function (userId, res, req) {
    const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
        expiresIn: "7d"
    });

    console.log('token generated for user', userId);

    // Save session to database
    try {
        await Session.create({
            userId,
            token,
            userAgent: req?.headers['user-agent'] || 'Unknown',
            ip: req?.ip || req?.headers['x-forwarded-for'] || 'Unknown',
            lastActive: new Date()
        });
    } catch (error) {
        console.error("Failed to save session:", error);
    }

    res.cookie('userJwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
        secure: ENV.NODE_ENV === 'production' // only true in production
    });
    return token;
}
