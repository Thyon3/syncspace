import jwt from 'jsonwebtoken';
import { ENV } from '../util/env.js';
import User from '../model/user.model.js';
import Session from '../model/session.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        let token;


        if (req.cookies?.userJwt) {
            token = req.cookies.userJwt;
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

        // Verify session still exists in DB
        const session = await Session.findOne({ token, userId: user._id });
        if (!session) {
            return res.status(401).json({ message: 'Session terminated — please login again' });
        }

        // Update lastActive
        session.lastActive = new Date();
        await session.save();

        req.user = user;
        req.session = session; // Attach session to request

        next();
    } catch (error) {
        console.error('ProtectRoute error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};
