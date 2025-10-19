import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// Get current file's directory and resolve path to .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});




const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Detect if it's a video file
        const isVideo = localFilePath.match(/\.(mp4|mov|webm)$/i);

        const uploadOptions = {
            resource_type: "auto",
            quality: "auto",
            fetch_format: "auto",
            // Video specific options for compression
            ...(isVideo && {
                chunk_size: 6000000,
                eager: [
                    {
                        width: 720,
                        height: 404,
                        crop: "pad",
                        audio_codec: "aac",
                        video_codec: "h264",
                        bit_rate: "600k",  // Reduce bitrate for smaller file size
                        quality: "auto:low" // Use lower quality
                    }
                ],
                eager_async: true,
                transformation: [
                    {
                        width: 720,
                        quality: "auto:low",
                        format: "mp4"
                    }
                ]
            })
        };

        console.log("Starting upload with options:", uploadOptions);

        const response = await cloudinary.uploader.upload(
            localFilePath,
            uploadOptions
        );

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("Local file deleted:", localFilePath);
        }

        return response;

    } catch (error) {
        console.error("Upload failed:", {
            message: error.message,
            code: error.http_code,
            details: error
        });
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};


const deleteFromCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const publicId = localFilePath.split('/').pop().split('.')[0];

        await cloudinary.uploader.destroy(publicId);


    } catch (error) {
        throw new ApiError(400, error?.message || "not able to delete oldImage");
    }
}


export { uploadOnCloudinary, deleteFromCloudinary };