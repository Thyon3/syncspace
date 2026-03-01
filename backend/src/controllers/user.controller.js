import User from "../model/user.model.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcrypt";

export const updateProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "unauthorized" });

        const { name, bio } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;

        // If file exists, it's a profile pic update
        if (req.file) {
            const uploadResponse = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "user_profiles", transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }] },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            updateData.profilePic = uploadResponse.secure_url;
            updateData.profilePicPublicId = uploadResponse.public_id;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select("-hashPassword");

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ message: error.message });
    }
}

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.hashPassword);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

        const salt = await bcrypt.genSalt(10);
        user.hashPassword = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        await User.findByIdAndDelete(userId);
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const toggleBlockUser = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const isBlocked = user.blockedUsers.includes(targetUserId);

        if (isBlocked) {
            user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetUserId);
        } else {
            user.blockedUsers.push(targetUserId);
        }

        await user.save();
        res.status(200).json({
            message: isBlocked ? "User unblocked" : "User blocked",
            blockedUsers: user.blockedUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
