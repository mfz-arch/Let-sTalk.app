import { Router } from 'express';
import { getConversations, getMessages, sendMessage, getOrCreateConversation } from '../controllers/chatController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, getOrCreateConversation);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);

export default router;
