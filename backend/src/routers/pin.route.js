import express from 'express';
import { pinMessage, unpinMessage } from '../controllers/pin.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/pin', protectRoute, pinMessage);
router.post('/unpin', protectRoute, unpinMessage);

export default router;
