"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.searchUsers = void 0;
const User_1 = require("../models/User");
const searchUsers = async (req, res) => {
    try {
        const query = req.query.q || '';
        const currentUserId = req.user?._id;
        const filter = { _id: { $ne: currentUserId } };
        if (query.trim()) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } },
                { phoneNumber: { $regex: query, $options: 'i' } },
            ];
        }
        const users = await User_1.User.find(filter).select('-password').limit(20);
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error searching users' });
    }
};
exports.searchUsers = searchUsers;
const updateProfile = async (req, res) => {
    try {
        const { name, bio, avatar } = req.body;
        const user = await User_1.User.findById(req.user?._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (name)
            user.name = name;
        if (bio !== undefined)
            user.bio = bio;
        if (avatar)
            user.avatar = avatar;
        await user.save();
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Profile update failed' });
    }
};
exports.updateProfile = updateProfile;
