import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, phoneNumber, countryCode, password } = await request.json();

    if (!name || !phoneNumber || !countryCode || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const cleanPhone = phoneNumber.trim();
    const cleanCode = countryCode.trim();

    // Check if user exists in MongoDB Atlas
    let existing = await User.findOne({ phoneNumber: cleanPhone, countryCode: cleanCode });
    if (existing) {
      return NextResponse.json({
        user: {
          id: existing._id.toString(),
          name: existing.name,
          username: existing.username,
          phoneNumber: existing.phoneNumber,
          countryCode: existing.countryCode,
          avatar: existing.avatar,
          bio: existing.bio,
          onlineStatus: 'online',
          createdAt: existing.createdAt,
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const username = `${name.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const user = await User.create({
      name: name.trim(),
      username,
      phoneNumber: cleanPhone,
      countryCode: cleanCode,
      password: hashedPassword,
      avatar,
      bio: "Hey there! I am using Let'sTalk.",
      onlineStatus: 'online',
    });

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
    console.error('Registration API Error:', error);
    return NextResponse.json({ message: error.message || 'Registration failed' }, { status: 500 });
  }
}
