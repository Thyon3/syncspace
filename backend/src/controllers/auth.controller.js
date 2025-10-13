
import User from '../model/user.model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../util/util.js'

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

        return res.json(user);


    } catch (error) {
        return res.status(500).json({
            type: error.name,
            message: error.message
        });
    }

}

export const login = async function (req, res) {

}