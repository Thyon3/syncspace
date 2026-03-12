import express from 'express';
import { 
    initiateCall,
    answerCall,
    endCall,
    declineCall,
    getCallHistory,
    getCallStats
} from '../controllers/call.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/initiate', protectRoute, initiateCall);
router.post('/:callId/answer', protectRoute, answerCall);
router.post('/:callId/end', protectRoute, endCall);
router.post('/:callId/decline', protectRoute, declineCall);
router.get('/history', protectRoute, getCallHistory);
router.get('/stats', protectRoute, getCallStats);

export default router;