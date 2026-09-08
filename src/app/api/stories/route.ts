import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Story } from '@/models/Story';
import { User } from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const stories = await Story.find().sort({ createdAt: -1 });

    // Group stories by userId
    const groupMap = new Map<string, any>();

    for (const story of stories) {
      const uId = story.userId.toString();
      if (!groupMap.has(uId)) {
        groupMap.set(uId, {
          userId: uId,
          user: {
            id: uId,
            name: story.userName,
            avatar: story.userAvatar || '',
          },
          hasUnseen: true,
          updatedAt: story.createdAt.toISOString(),
          slides: [],
        });
      }

      const group = groupMap.get(uId);
      group.slides.push({
        id: story._id.toString(),
        mediaUrl: story.mediaUrl,
        caption: story.caption,
        type: story.type,
        createdAt: story.createdAt.toISOString(),
        viewsCount: story.viewers?.length || story.viewsCount || 1,
        likesCount: story.likes?.length || 0,
        likes: story.likes || [],
        viewers: story.viewers || [],
      });
    }

    const storyGroups = Array.from(groupMap.values());
    return NextResponse.json({ stories: storyGroups });
  } catch (error: any) {
    console.error('Fetch Stories API Error:', error);
    return NextResponse.json({ message: error.message || 'Error fetching stories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { action = 'create', userId, mediaUrl, caption, storyId } = body;

    // 1. CREATE NEW STORY
    if (action === 'create') {
      if (!userId || !mediaUrl) {
        return NextResponse.json({ message: 'User ID and Media URL required' }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const newStory = await Story.create({
        userId: user._id,
        userName: user.name,
        userAvatar: user.avatar || '',
        mediaUrl,
        caption,
        type: 'image',
        viewsCount: 1,
        likes: [],
        viewers: [{ userId: user._id.toString(), name: user.name, avatar: user.avatar || '', viewedAt: new Date() }],
      });

      return NextResponse.json({ success: true, story: newStory });
    }

    // 2. LIKE / UNLIKE STORY
    if (action === 'like') {
      if (!storyId || !userId) {
        return NextResponse.json({ message: 'Story ID and User ID required' }, { status: 400 });
      }

      const story = await Story.findById(storyId);
      if (story) {
        const hasLiked = story.likes.includes(userId);
        if (hasLiked) {
          story.likes = story.likes.filter((id: string) => id !== userId);
        } else {
          story.likes.push(userId);
        }
        await story.save();
        return NextResponse.json({ success: true, likes: story.likes, likesCount: story.likes.length });
      }
      return NextResponse.json({ message: 'Story not found' }, { status: 404 });
    }

    // 3. RECORD STORY VIEW
    if (action === 'view') {
      if (!storyId || !userId) {
        return NextResponse.json({ message: 'Story ID and User ID required' }, { status: 400 });
      }

      const story = await Story.findById(storyId);
      if (story) {
        const user = await User.findById(userId);
        const alreadyViewed = story.viewers?.some((v: any) => v.userId === userId);
        if (!alreadyViewed && user) {
          story.viewers.push({
            userId,
            name: user.name,
            avatar: user.avatar || '',
            viewedAt: new Date(),
          });
          story.viewsCount = story.viewers.length;
          await story.save();
        }
        return NextResponse.json({ success: true, viewers: story.viewers, viewsCount: story.viewsCount });
      }
      return NextResponse.json({ message: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Story API Error:', error);
    return NextResponse.json({ message: error.message || 'Error processing story' }, { status: 500 });
  }
}
