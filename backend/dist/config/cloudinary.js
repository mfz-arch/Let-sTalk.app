"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadToCloudinary = async (fileBase64, folder = 'letstalk') => {
    try {
        const response = await cloudinary_1.v2.uploader.upload(fileBase64, {
            folder,
            resource_type: 'auto',
        });
        return response.secure_url;
    }
    catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new Error('Media upload failed');
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
exports.default = cloudinary_1.v2;
