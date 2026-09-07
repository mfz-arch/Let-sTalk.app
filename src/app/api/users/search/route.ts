import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const currentUserId = searchParams.get('currentUserId');

    const filter: any = {};
    if (currentUserId) {
      filter._id = { $ne: currentUserId };
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { phoneNumber: { $regex: q, $options: 'i' } },
        { countryCode: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).limit(30);

    const formatted = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      username: u.username,
      phoneNumber: u.phoneNumber,
      countryCode: u.countryCode,
      avatar: u.avatar,
      bio: u.bio,
      onlineStatus: u.onlineStatus,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: formatted });
  } catch (error: any) {
    console.error('User Search API Error:', error);
    return NextResponse.json({ message: error.message || 'Search failed' }, { status: 500 });
  }
}
