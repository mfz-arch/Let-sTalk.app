"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateConversation = exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
const getConversations = async (req, res) => {
    try {
        const userId = req.user?._id;
        const conversations = await Conversation_1.Conversation.find({ participantIds: userId })
            .populate('participantIds', 'name username phoneNumber countryCode avatar onlineStatus lastSeen')
            .populate({
            path: 'lastMessage',
            populate: { path: 'senderId receiverId', select: 'name username avatar' },
        })
            .sort({ updatedAt: -1 });
        res.json({ conversations });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching conversations' });
    }
};
exports.getConversations = getConversations;
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message_1.Message.find({ conversationId }).sort({ createdAt: 1 });
        res.json({ messages });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching messages' });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    try {
        const { conversationId, receiverId, content, type = 'text', mediaUrl, storyContext } = req.body;
        const senderId = req.user?._id;
        if (!conversationId || !receiverId) {
            res.status(400).json({ message: 'Conversation and Receiver ID required' });
            return;
        }
        const message = await Message_1.Message.create({
            conversationId,
            senderId,
            receiverId,
            content,
            type,
            mediaUrl,
            storyContext,
            status: 'sent',
        });
        await Conversation_1.Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: new Date(),
        });
        res.status(201).json({ message });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error sending message' });
    }
};
exports.sendMessage = sendMessage;
const getOrCreateConversation = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user?._id;
        let conversation = await Conversation_1.Conversation.findOne({
            participantIds: { $all: [currentUserId, targetUserId] },
        }).populate('participantIds', 'name username phoneNumber countryCode avatar onlineStatus lastSeen');
        if (!conversation) {
            conversation = await Conversation_1.Conversation.create({
                participantIds: [currentUserId, targetUserId],
            });
            conversation = await conversation.populate('participantIds', 'name username phoneNumber countryCode avatar onlineStatus lastSeen');
        }
        res.json({ conversation });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error creating conversation' });
    }
};
exports.getOrCreateConversation = getOrCreateConversation;
