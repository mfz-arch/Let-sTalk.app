"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'letstalk_super_secret_jwt_key_2026';
    return jsonwebtoken_1.default.sign({ id: userId }, secret, {
        expiresIn: '30d',
    });
};
exports.generateToken = generateToken;
