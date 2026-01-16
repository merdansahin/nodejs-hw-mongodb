import { v2 as cloudinary } from 'cloudinary';
import createHttpError from 'http-errors';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file) {
  if (!file) return null;

  try {
    const b64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${b64}`;

    const res = await cloudinary.uploader.upload(dataUri, {
      folder: 'contacts',
    });

    return res.secure_url;
  } catch {
    throw createHttpError(500, 'Failed to upload image.');
  }
}
