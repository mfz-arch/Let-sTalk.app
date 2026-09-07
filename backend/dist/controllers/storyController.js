"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStory = exports.getStories = void 0;
const Story_1 = require("../models/Story");
const cloudinary_1 = require("../config/cloudinary");
const getStories = async (req, res) => {
    try {
        const stories = await Story_1.StoryGroup.find({})
            .populate('userId', 'name username avatar onlineStatus')
            .sort({ updatedAt: -1 });
        res.json({ stories });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching stories' });
    }
};
exports.getStories = getStories;
const createStory = async (req, res) => {
    try {
        const { mediaUrl, caption } = req.body;
        const userId = req.user?._id;
        if (!mediaUrl) {
            res.status(400).json({ message: 'Media URL required' });
            return;
        }
        let finalMediaUrl = mediaUrl;
        if (mediaUrl.startsWith('data:image')) {
            finalMediaUrl = await (0, cloudinary_1.uploadToCloudinary)(mediaUrl, 'letstalk_stories');
        }
        let storyGroup = await Story_1.StoryGroup.findOne({ userId });
        const newSlide = {
            mediaUrl: finalMediaUrl,
            caption,
            viewsCount: 0,
            createdAt: new Date(),
        };
        if (storyGroup) {
            storyGroup.slides.unshift(newSlide);
            storyGroup.updatedAt = new Date();
            await storyGroup.save();
        }
        else {
            storyGroup = await Story_1.StoryGroup.create({
                userId,
                slides: [newSlide],
            });
        }
        await storyGroup.populate('userId', 'name username avatar onlineStatus');
        res.status(201).json({ storyGroup });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error creating story' });
    }
};
exports.createStory = createStory;
