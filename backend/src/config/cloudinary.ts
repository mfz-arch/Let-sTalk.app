import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBase64: string, folder = 'letstalk'): Promise<string> => {
  try {
    const response = await cloudinary.uploader.upload(fileBase64, {
      folder,
      resource_type: 'auto',
    });
    return response.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Media upload failed');
  }
};

export default cloudinary;
