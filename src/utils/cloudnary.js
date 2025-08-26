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


        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            quality: "auto",
            fetch_format: "auto",
        });


        // Delete local file only if it exists and hasn't been deleted
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("Local file deleted:", localFilePath);
        }

        // global.isUploading = false;
        return response;

    } catch (error) {
        console.error("Upload failed with error:", error.message);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        // global.isUploading = false;
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