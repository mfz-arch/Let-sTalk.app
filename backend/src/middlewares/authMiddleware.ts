import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  params: any;
  query: any;
  body: any;
  headers: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'letstalk_super_secret_jwt_key_2026';
      const decoded: any = jwt.verify(token, secret);

      const foundUser = await User.findById(decoded.id).select('-password');
      if (!foundUser) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      req.user = foundUser;
      next();
      return;
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }
};
