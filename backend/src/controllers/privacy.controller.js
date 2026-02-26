import User from '../model/user.model.js';

export const updatePrivacySettings = async (req, res) => {
    try {
        const userId = req.user._id;
        const { lastSeen, profilePic, about } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (lastSeen) user.privacySettings.lastSeen = lastSeen;
        if (profilePic) user.privacySettings.profilePic = profilePic;
        if (about) user.privacySettings.about = about;

        await user.save();

        res.status(200).json({ message: "Privacy settings updated", privacySettings: user.privacySettings });
    } catch (error) {
        console.error("Error in updatePrivacySettings:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getPrivacySettings = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('privacySettings');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.privacySettings);
    } catch (error) {
        console.error("Error in getPrivacySettings:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateBio = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bio } = req.body;

        if (bio && bio.length > 150) {
            return res.status(400).json({ message: "Bio must be 150 characters or less" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { bio },
            { new: true }
        ).select('-hashPassword');

        res.status(200).json({ message: "Bio updated", user });
    } catch (error) {
        console.error("Error in updateBio:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const user = await User.findById(userId).select('-hashPassword');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const canViewLastSeen = user.privacySettings.lastSeen === 'everyone' ||
            (user.privacySettings.lastSeen === 'contacts' && currentUserId);

        const canViewProfilePic = user.privacySettings.profilePic === 'everyone' ||
            (user.privacySettings.profilePic === 'contacts' && currentUserId);

        const canViewAbout = user.privacySettings.about === 'everyone' ||
            (user.privacySettings.about === 'contacts' && currentUserId);

        const profile = {
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: canViewProfilePic ? user.profilePic : null,
            bio: canViewAbout ? user.bio : null,
            lastSeen: canViewLastSeen ? user.lastSeen : null,
            isOnline: user.isOnline,
        };

        res.status(200).json(profile);
    } catch (error) {
        console.error("Error in getUserProfile:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
