import { Response } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const conversations = await Conversation.find({ participantIds: userId })
      .populate('participantIds', 'name username phoneNumber countryCode avatar onlineStatus lastSeen')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId receiverId', select: 'name username avatar' },
      })
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching conversations' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId, receiverId, content, type = 'text', mediaUrl, storyContext } = req.body;
    const senderId = req.user?._id;

    if (!conversationId || !receiverId) {
      res.status(400).json({ message: 'Conversation and Receiver ID required' });
      return;
    }

    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      content,
      type,
      mediaUrl,
      storyContext,
      status: 'sent',
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error sending message' });
  }
};

export const getOrCreateConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user?._id;

    let conversation = await Conversation.findOne({
      participantIds: { $all: [currentUserId, targetUserId] },
    }).populate('participantIds', 'name username phoneNumber countryCode avatar onlineStatus lastSeen');

    if (!conversation) {
      conversation = await Conversation.create({
        participantIds: [currentUserId, targetUserId],
      });
      conversation = await conversation.populate(
        'participantIds',
        'name username phoneNumber countryCode avatar onlineStatus lastSeen'
      );
    }

    res.json({ conversation });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating conversation' });
  }
};
