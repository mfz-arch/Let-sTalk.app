import { Response } from 'express';
import { StoryGroup } from '../models/Story';
import { AuthRequest } from '../middlewares/authMiddleware';
import { uploadToCloudinary } from '../config/cloudinary';

export const getStories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stories = await StoryGroup.find({})
      .populate('userId', 'name username avatar onlineStatus')
      .sort({ updatedAt: -1 });

    res.json({ stories });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching stories' });
  }
};

export const createStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mediaUrl, caption } = req.body;
    const userId = req.user?._id;

    if (!mediaUrl) {
      res.status(400).json({ message: 'Media URL required' });
      return;
    }

    let finalMediaUrl = mediaUrl;
    if (mediaUrl.startsWith('data:image')) {
      finalMediaUrl = await uploadToCloudinary(mediaUrl, 'letstalk_stories');
    }

    let storyGroup = await StoryGroup.findOne({ userId });

    const newSlide = {
      mediaUrl: finalMediaUrl,
      caption,
      viewsCount: 0,
      createdAt: new Date(),
    };

    if (storyGroup) {
      storyGroup.slides.unshift(newSlide as any);
      storyGroup.updatedAt = new Date();
      await storyGroup.save();
    } else {
      storyGroup = await StoryGroup.create({
        userId,
        slides: [newSlide],
      });
    }

    await storyGroup.populate('userId', 'name username avatar onlineStatus');
    res.status(201).json({ storyGroup });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating story' });
  }
};
