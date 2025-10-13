import express, { Router } from 'express';
import { login, logout, signUp } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/signUp', signUp);
router.post('/login', login);
router.post('/logout', logout);

// update profile for users 

router.post('/updateProfile',)

export default router; 