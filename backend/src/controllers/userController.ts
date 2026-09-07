import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || '';
    const currentUserId = req.user?._id;

    const filter: any = { _id: { $ne: currentUserId } };
    if (query.trim()) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').limit(20);
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error searching users' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Profile update failed' });
  }
};
