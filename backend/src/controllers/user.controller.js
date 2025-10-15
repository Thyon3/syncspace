import cloudinary from "../config/cloudinary.js";
import User from "../model/user.model.js";


export const updateProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "unauthorized" });
        if (!req.file) return res.status(400).json({ message: "Profile picture is required" });

        // Upload buffer directly to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload_stream(
            { folder: "user_profiles", transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }] },
            async (error, result) => {
                if (error) return res.status(500).json({ message: error.message });

                const updatedUser = await User.findByIdAndUpdate(
                    req.user._id,
                    { profilePic: result.secure_url, profilePicPublicId: result.public_id },
                    { new: true }
                ).select("-password");
                console.log('proeile updated successfully', updatedUser);
                res.status(200).json({ success: true, user: updatedUser });
            }
        );

        // pipe buffer to upload_stream
        uploadResponse.end(req.file.buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
