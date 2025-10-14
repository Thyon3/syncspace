import express, { Router } from 'express';
import { login, logout, signUp } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtectRoute } from '../middleware/arcjet.middleware.js';
import { updateProfile } from '../controllers/user.controller.js';
const router = express.Router();

router.post('/signUp', arcjetProtectRoute, signUp);
router.post('/login', login);
router.post('/logout', logout);

// update profile for users 

router.post('/updateProfile', updateProfile)

export default router; 