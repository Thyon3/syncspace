import express from 'express';
import multer from 'multer';
import { 
    uploadMedia,
    getMediaGallery,
    downloadMedia,
    deleteMedia,
    getMediaStats
} from '../controllers/media.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', protectRoute, upload.single('file'), uploadMedia);
router.get('/gallery/:chatId', protectRoute, getMediaGallery);
router.get('/:mediaId/download', protectRoute, downloadMedia);
router.delete('/:mediaId', protectRoute, deleteMedia);
router.get('/stats/:chatId', protectRoute, getMediaStats);

export default router;