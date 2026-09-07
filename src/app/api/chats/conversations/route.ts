import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Conversation } from '@/models/Conversation';
import { User } from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ conversations: [] });
    }

    const conversations = await Conversation.find({ participantIds: userId })
      .populate('participantIds', 'name username phoneNumber countryCode avatar onlineStatus')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    const formatted = conversations.map((c: any) => ({
      id: c._id.toString(),
      participantIds: c.participantIds.map((p: any) => p._id.toString()),
      participants: c.participantIds.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        username: p.username,
        phoneNumber: p.phoneNumber,
        countryCode: p.countryCode,
        avatar: p.avatar,
        onlineStatus: p.onlineStatus,
      })),
      unreadCount: 0,
      updatedAt: c.updatedAt,
      lastMessage: c.lastMessage
        ? {
            id: c.lastMessage._id.toString(),
            conversationId: c._id.toString(),
            senderId: c.lastMessage.senderId.toString(),
            receiverId: c.lastMessage.receiverId.toString(),
            content: c.lastMessage.content,
            type: c.lastMessage.type,
            createdAt: c.lastMessage.createdAt,
            status: c.lastMessage.status,
          }
        : undefined,
    }));

    return NextResponse.json({ conversations: formatted });
  } catch (error: any) {
    console.error('Conversations API Error:', error);
    return NextResponse.json({ message: error.message || 'Error fetching conversations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { currentUserId, targetUserId } = await request.json();

    if (!currentUserId || !targetUserId) {
      return NextResponse.json({ message: 'User IDs required' }, { status: 400 });
    }

    let conversation = await Conversation.findOne({
      participantIds: { $all: [currentUserId, targetUserId] },
    }).populate('participantIds', 'name username phoneNumber countryCode avatar onlineStatus');

    if (!conversation) {
      conversation = await Conversation.create({
        participantIds: [currentUserId, targetUserId],
      });
      conversation = await conversation.populate(
        'participantIds',
        'name username phoneNumber countryCode avatar onlineStatus'
      );
    }

    const formatted = {
      id: conversation._id.toString(),
      participantIds: (conversation.participantIds as any).map((p: any) => p._id.toString()),
      participants: (conversation.participantIds as any).map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        username: p.username,
        phoneNumber: p.phoneNumber,
        countryCode: p.countryCode,
        avatar: p.avatar,
        onlineStatus: p.onlineStatus,
      })),
      unreadCount: 0,
      updatedAt: conversation.updatedAt,
    };

    return NextResponse.json({ conversation: formatted });
  } catch (error: any) {
    console.error('Create Conversation API Error:', error);
    return NextResponse.json({ message: error.message || 'Error creating conversation' }, { status: 500 });
  }
}
