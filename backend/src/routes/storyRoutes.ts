import { Router } from 'express';
import { getStories, createStory } from '../controllers/storyController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, getStories);
router.post('/', protect, createStory);

export default router;
