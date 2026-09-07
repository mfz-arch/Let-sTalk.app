"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storyController_1 = require("../controllers/storyController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.protect, storyController_1.getStories);
router.post('/', authMiddleware_1.protect, storyController_1.createStory);
exports.default = router;
