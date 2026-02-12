
import User from '../model/user.model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../util/util.js'
import { sendWelcomeEmail } from '../email/email_handler.js';
import { ENV } from '../util/env.js';
import jwt from 'jsonwebtoken';

export const signUp = async function (req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'please provide all the fields'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: 'password has to be more than 6 characters'
            });
        }
        // check if the the user input a valid email 

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'please enter a valid email'
            });
        }



        const newUser = await User.findOne({ name });

        if (newUser) {
            return res.status(400).json({
                message: 'name is not availabale please pick another one'
            });
        }


        const hashPassword = bcrypt.hashSync(password, 10);

        const user = new User({
            name, hashPassword, email
        });

        if (user) {
            generateToken(user._id, res);

            await user.save();
        } else {
            return res.status(500).json({
                message: 'error in creating user'
            });
        }
        await user.save();

        user.hashPassword = undefined;

        // send the user a welcome email 
        try {
            // TODO  use the users email and also application url as a client url 
            sendWelcomeEmail('asnakemengesha80@gmail.com', 'client', 'client');
        } catch (error) {
            console.log('failed to send email', error);
        }

        return res.json(user);


    } catch (error) {
        return res.status(500).json({
            type: error.name,
            message: error.message
        });
    }

}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.hashPassword);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // generate JWT cookie
        const token = generateToken(user._id, res);

        return res.status(200).json({
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            type: error.name,
            message: error.message,
        });
    }
};



// logout 
export const logout = async function (_, res) {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({
        message: 'logged out successfully'
    });
}

// check if the user is logged or not 
export const check = async function (req, res) {
    try {
        const token = req.cookies.userJwt; // read JWT from cookie
        if (!token) {
            return res.status(401).json({ message: 'No token found' });
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        res.json({ user: decoded });
    } catch (error) {
        console.error('Error in auth/check', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}
