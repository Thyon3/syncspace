import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    getChats,
    createGroup,
    addMember,
    searchUsersAndGroups,
    removeMember,
    leaveGroup,
    muteChat,
    unmuteChat,
    archiveChat,
    unarchiveChat,
    updateGroupDescription,
    promoteModerator,
    demoteModerator,
    saveDraft,
    getDraft,
    pinMessage,
    unpinMessage,
    searchChats,
    toggleArchive,
    toggleMute,
    deleteGroup,
    updateGroup,
    generateInviteCode,
    joinGroupByInvite
} from '../controllers/chat.controller.js';

const router = express.Router();

router.get('/', protectRoute, getChats);
router.post('/create-group', protectRoute, createGroup);
router.post('/add-member', protectRoute, addMember);
router.post('/remove-member', protectRoute, removeMember);
router.post('/:chatId/leave', protectRoute, leaveGroup);
router.post('/mute', protectRoute, muteChat);
router.post('/:chatId/unmute', protectRoute, unmuteChat);
router.post('/:chatId/archive', protectRoute, archiveChat);
router.post('/:chatId/unarchive', protectRoute, unarchiveChat);
router.put('/description', protectRoute, updateGroupDescription);
router.post('/promote-moderator', protectRoute, promoteModerator);
router.post('/demote-moderator', protectRoute, demoteModerator);
router.post('/draft', protectRoute, saveDraft);
router.get('/:chatId/draft', protectRoute, getDraft);
router.post('/pin', protectRoute, pinMessage);
router.post("/unpin", protectRoute, unpinMessage);
router.post("/archive", protectRoute, toggleArchive);
router.post("/mute", protectRoute, toggleMute);
router.get('/search', protectRoute, searchUsersAndGroups);
router.delete('/:chatId', protectRoute, deleteGroup);
router.put('/update', protectRoute, updateGroup);
router.post('/invite-code', protectRoute, generateInviteCode);
router.post('/join/:inviteCode', protectRoute, joinGroupByInvite);

export default router;
