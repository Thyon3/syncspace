
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();
export const generateToken = async function (userId, res) {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    console.log('token generated ', token);
    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === 'production' ? false : true
    });
}