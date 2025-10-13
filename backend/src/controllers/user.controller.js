import cloudinary from "../config/cloudinary.js";
import User from "../model/user.model.js";

export const updateProfile = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: user not found in request." });
        }

        const { profilePic } = req.body;
        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture is required." });
        }

        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Delete old picture if exists
        if (user.profilePicPublicId) {
            await cloudinary.uploader.destroy(user.profilePicPublicId);
        }

        // Upload new picture
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            folder: "user_profiles",
            transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
        });

        // Update user document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                profilePic: uploadResponse.secure_url,
                profilePicPublicId: uploadResponse.public_id,
            },
            { new: true }
        ).select("-password"); // exclude password

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            type: error.name,
        });
    }
};
