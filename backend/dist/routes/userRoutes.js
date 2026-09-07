"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/search', authMiddleware_1.protect, userController_1.searchUsers);
router.put('/profile', authMiddleware_1.protect, userController_1.updateProfile);
exports.default = router;
