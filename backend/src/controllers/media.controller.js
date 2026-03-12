import Media from '../model/media.model.js';
import cloudinary from '../config/cloudinary.js';
import sharp from 'sharp';

export const uploadMedia = async (req, res) => {
    try {
        const { chatId, messageId } = req.body;
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.file;
        let uploadResult;
        let thumbnailUrl = null;
        let dimensions = null;
        let duration = null;

        // Determine media type
        const mediaType = file.mimetype.startsWith('image/') ? 'image' :
                         file.mimetype.startsWith('video/') ? 'video' :
                         file.mimetype.startsWith('audio/') ? 'audio' :
                         'document';

        // Process image
        if (mediaType === 'image') {
            const metadata = await sharp(file.buffer).metadata();
            dimensions = { width: metadata.width, height: metadata.height };

            // Create thumbnail for large images
            if (metadata.width > 800 || metadata.height > 600) {
                const thumbnailBuffer = await sharp(file.buffer)
                    .resize(400, 300, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toBuffer();

                const thumbnailUpload = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "thumbnails", resource_type: "image" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(thumbnailBuffer);
                });
                thumbnailUrl = thumbnailUpload.secure_url;
            }
        }

        // Upload to Cloudinary
        uploadResult = await new Promise((resolve, reject) => {
            const resourceType = mediaType === 'video' ? 'video' : 
                               mediaType === 'audio' ? 'video' : 'auto';
            
            const stream = cloudinary.uploader.upload_stream(
                { 
                    folder: `media/${mediaType}s`,
                    resource_type: resourceType,
                    ...(mediaType === 'video' && { 
                        eager: [{ width: 400, height: 300, crop: "pad", format: "jpg" }]
                    })
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(file.buffer);
        });

        // Extract video thumbnail and duration
        if (mediaType === 'video' && uploadResult.eager && uploadResult.eager[0]) {
            thumbnailUrl = uploadResult.eager[0].secure_url;
            duration = uploadResult.duration;
        }

        // Create media record
        const media = new Media({
            messageId,
            chatId,
            uploaderId: userId,
            type: mediaType,
            originalName: file.originalname,
            fileName: uploadResult.public_id,
            fileSize: file.size,
            mimeType: file.mimetype,
            url: uploadResult.secure_url,
            thumbnailUrl,
            duration,
            dimensions
        });

        await media.save();

        res.status(201).json(media);
    } catch (error) {
        console.error('Error in uploadMedia:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getMediaGallery = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { type, page = 1, limit = 20 } = req.query;
        const userId = req.user._id;

        // Verify user is member of chat
        const Chat = (await import('../model/chat.model.js')).default;
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.members.includes(userId)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const query = { chatId };
        if (type) query.type = type;

        const media = await Media.find(query)
            .populate('uploaderId', 'name profilePic')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const totalCount = await Media.countDocuments(query);

        res.json({
            media,
            totalCount,
            hasMore: (page * limit) < totalCount
        });
    } catch (error) {
        console.error('Error in getMediaGallery:', error);
        res.status(500).json({ message: error.message });
    }
};

export const downloadMedia = async (req, res) => {
    try {
        const { mediaId } = req.params;
        const userId = req.user._id;

        const media = await Media.findById(mediaId);
        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }

        // Verify user has access to this media
        const Chat = (await import('../model/chat.model.js')).default;
        const chat = await Chat.findById(media.chatId);
        if (!chat || !chat.members.includes(userId)) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Increment download count
        media.downloadCount += 1;
        await media.save();

        // Return download URL (Cloudinary URL is already public)
        res.json({ downloadUrl: media.url, fileName: media.originalName });
    } catch (error) {
        console.error('Error in downloadMedia:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteMedia = async (req, res) => {
    try {
        const { mediaId } = req.params;
        const userId = req.user._id;

        const media = await Media.findById(mediaId);
        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }

        // Only uploader or chat admin can delete
        const Chat = (await import('../model/chat.model.js')).default;
        const chat = await Chat.findById(media.chatId);
        const isUploader = media.uploaderId.toString() === userId.toString();
        const isAdmin = chat && chat.admin && chat.admin.toString() === userId.toString();

        if (!isUploader && !isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(media.fileName);
            if (media.thumbnailUrl) {
                const thumbnailId = media.thumbnailUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`thumbnails/${thumbnailId}`);
            }
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
        }

        await Media.findByIdAndDelete(mediaId);

        res.json({ message: "Media deleted successfully" });
    } catch (error) {
        console.error('Error in deleteMedia:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getMediaStats = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        // Verify access
        const Chat = (await import('../model/chat.model.js')).default;
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.members.includes(userId)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const stats = await Media.aggregate([
            { $match: { chatId: chatId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalSize: { $sum: '$fileSize' }
                }
            }
        ]);

        const totalStats = await Media.aggregate([
            { $match: { chatId: chatId } },
            {
                $group: {
                    _id: null,
                    totalFiles: { $sum: 1 },
                    totalSize: { $sum: '$fileSize' }
                }
            }
        ]);

        res.json({
            byType: stats,
            total: totalStats[0] || { totalFiles: 0, totalSize: 0 }
        });
    } catch (error) {
        console.error('Error in getMediaStats:', error);
        res.status(500).json({ message: error.message });
    }
};