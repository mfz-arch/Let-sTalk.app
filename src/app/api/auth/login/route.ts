import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { phoneNumber, countryCode, password } = await request.json();

    if (!phoneNumber || !countryCode || !password) {
      return NextResponse.json({ message: 'Phone number and password required' }, { status: 400 });
    }

    const cleanPhone = phoneNumber.trim();
    const cleanCode = countryCode.trim();

    // Find account in MongoDB Atlas
    const user = await User.findOne({ phoneNumber: cleanPhone, countryCode: cleanCode });

    // If account does not exist, return 404 Account Not Found error
    if (!user) {
      return NextResponse.json(
        { message: 'Account not found. Please create an account.' },
        { status: 404 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid password. Please check your credentials.' },
        { status: 401 }
      );
    }

    user.onlineStatus = 'online';
    await user.save();

    return NextResponse.json({
      message: 'Sign in successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        avatar: user.avatar,
        bio: user.bio,
        onlineStatus: user.onlineStatus,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: error.message || 'Login failed' }, { status: 500 });
  }
}
