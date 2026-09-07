"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const secret = process.env.JWT_SECRET || 'letstalk_super_secret_jwt_key_2026';
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            const foundUser = await User_1.User.findById(decoded.id).select('-password');
            if (!foundUser) {
                res.status(401).json({ message: 'User not found' });
                return;
            }
            req.user = foundUser;
            next();
            return;
        }
        catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
            return;
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
        return;
    }
};
exports.protect = protect;
