import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Message } from '@/models/Message';
import { Conversation } from '@/models/Conversation';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    const formatted = messages.map((m) => {
      const isValidReply =
        m.replyTo && (Boolean(m.replyTo.senderName) || Boolean(m.replyTo.content) || Boolean(m.replyTo.id));

      return {
        id: m._id.toString(),
        conversationId: m.conversationId.toString(),
        senderId: m.senderId.toString(),
        receiverId: m.receiverId.toString(),
        content: m.content,
        type: m.type,
        mediaUrl: m.mediaUrl,
        storyContext: m.storyContext,
        replyTo: isValidReply ? m.replyTo : undefined,
        createdAt: m.createdAt,
        status: m.status,
      };
    });

    return NextResponse.json({ messages: formatted });
  } catch (error: any) {
    console.error('Fetch Messages API Error:', error);
    return NextResponse.json({ message: error.message || 'Error fetching messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { conversationId, senderId, receiverId, content, type = 'text', mediaUrl, storyContext, replyTo } = await request.json();

    if (!conversationId || !senderId || !receiverId) {
      return NextResponse.json({ message: 'Conversation and User IDs required' }, { status: 400 });
    }

    const isValidReply =
      replyTo && (Boolean(replyTo.senderName) || Boolean(replyTo.content) || Boolean(replyTo.id));

    const cleanReplyTo = isValidReply ? replyTo : undefined;

    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      content,
      type,
      mediaUrl,
      storyContext,
      replyTo: cleanReplyTo,
      status: 'sent',
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    const formatted = {
      id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      content: message.content,
      type: message.type,
      mediaUrl: message.mediaUrl,
      storyContext: message.storyContext,
      replyTo: message.replyTo,
      createdAt: message.createdAt,
      status: message.status,
    };

    return NextResponse.json({ message: formatted });
  } catch (error: any) {
    console.error('Send Message API Error:', error);
    return NextResponse.json({ message: error.message || 'Error sending message' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { conversationId, userId } = await request.json();

    if (!conversationId || !userId) {
      return NextResponse.json({ message: 'ConversationId and userId required' }, { status: 400 });
    }

    // Mark all unread messages for this recipient as 'read'
    await Message.updateMany(
      { conversationId, receiverId: userId, status: { $ne: 'read' } },
      { $set: { status: 'read' } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mark Read API Error:', error);
    return NextResponse.json({ message: error.message || 'Error marking messages read' }, { status: 500 });
  }
}
