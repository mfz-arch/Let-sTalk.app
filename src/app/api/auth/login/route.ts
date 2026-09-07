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

    let user = await User.findOne({ phoneNumber: cleanPhone, countryCode: cleanCode });

    if (!user) {
      // Create user automatically in MongoDB Atlas if logging in for the first time
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const name = `User ${cleanPhone.slice(-4)}`;
      const username = `user_${cleanPhone.slice(-4)}`;
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanPhone)}`;

      user = await User.create({
        name,
        username,
        phoneNumber: cleanPhone,
        countryCode: cleanCode,
        password: hashedPassword,
        avatar,
        bio: "Hey there! I am using Let'sTalk.",
        onlineStatus: 'online',
      });
    } else {
      const isMatch = await bcrypt.compare(password, user.password || '');
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid phone number or password' }, { status: 401 });
      }
      user.onlineStatus = 'online';
      await user.save();
    }

    return NextResponse.json({
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
