import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'letstalk_super_secret_jwt_key_2026';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '30d',
  });
};
