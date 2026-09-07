import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/generateToken';
import { AuthRequest } from '../middlewares/authMiddleware';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phoneNumber, countryCode, password } = req.body;

    if (!name || !phoneNumber || !countryCode || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    const existingUser = await User.findOne({ phoneNumber, countryCode });
    if (existingUser) {
      res.status(400).json({ message: 'User with this phone number already exists' });
      return;
    }

    const username = `${name.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const user = await User.create({
      name,
      username,
      phoneNumber,
      countryCode,
      password,
      avatar,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        avatar: user.avatar,
        bio: user.bio,
        onlineStatus: user.onlineStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, countryCode, password } = req.body;

    if (!phoneNumber || !countryCode || !password) {
      res.status(400).json({ message: 'Please enter phone number and password' });
      return;
    }

    const user = await User.findOne({ phoneNumber, countryCode });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id.toString());

      user.onlineStatus = 'online';
      await user.save();

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          phoneNumber: user.phoneNumber,
          countryCode: user.countryCode,
          avatar: user.avatar,
          bio: user.bio,
          onlineStatus: user.onlineStatus,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }
  res.json({ user: req.user });
};
