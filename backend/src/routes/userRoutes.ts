import { Router } from 'express';
import { searchUsers, updateProfile } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/search', protect, searchUsers);
router.put('/profile', protect, updateProfile);

export default router;
