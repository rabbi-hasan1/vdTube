import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {


    console.log('Uploading file to Cloudinary:', localFilePath);
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath?.path, {
            resource_type: 'auto'
        });

        if (localFilePath) {
            fs.unlinkSync(localFilePath.path);
        }
        return response;
    } catch (error) {
        if (localFilePath) {
            fs.unlinkSync(localFilePath.path);
        }

        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
};

export default uploadOnCloudinary;
