import jwt from 'jsonwebtoken';
import { ENV } from '../util/env.js';
import User from '../model/user.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        let token;


        if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized — no token provided' });
        }


        let decoded;
        try {
            decoded = jwt.verify(token, ENV.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired — please login again' });
            }
            return res.status(401).json({ message: 'Invalid token — please login again' });
        }


        const user = await User.findById(decoded.userId).select('-password'); // exclude password
        if (!user) {
            return res.status(401).json({ message: 'User not found — please login again' });
        }


        req.user = user;

        next();
    } catch (error) {
        console.error('ProtectRoute error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};
