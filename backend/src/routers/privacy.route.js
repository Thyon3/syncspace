import express from 'express';
import { updatePrivacySettings, getPrivacySettings, updateBio, getUserProfile } from '../controllers/privacy.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.put('/settings', protectRoute, updatePrivacySettings);
router.get('/settings', protectRoute, getPrivacySettings);
router.put('/bio', protectRoute, updateBio);
router.get('/profile/:userId', protectRoute, getUserProfile);

export default router;
