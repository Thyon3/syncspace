import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getSessions, terminateSession, terminateOtherSessions } from '../controllers/security.controller.js';

const router = express.Router();

router.get('/sessions', protectRoute, getSessions);
router.delete('/sessions/others', protectRoute, terminateOtherSessions);
router.delete('/sessions/:sessionId', protectRoute, terminateSession);

export default router;
