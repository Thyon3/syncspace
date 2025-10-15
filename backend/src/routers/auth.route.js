import express, { Router } from 'express';
import { login, logout, signUp, check } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtectRoute } from '../middleware/arcjet.middleware.js';
import { updateProfile } from '../controllers/user.controller.js';
const router = express.Router();

router.post('/signUp', signUp);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check', check);

// update profile for users 

router.put('/updateProfile', updateProfile)

export default router; 