import dotenv from "dotenv";
dotenv.config({
    path: "../.env"
});
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;


        // Upload with optimization settings
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            quality: "auto",          // Optimize quality (q_auto)
            fetch_format: "auto",     // Convert to best format (f_auto)
        });

        console.log("File uploaded successfully:", response.url);

        const optimizedUrl = cloudinary.url(response.public_id, {
            quality: "auto",
            fetch_format: "auto",
        });

        console.log("Optimized URL:", optimizedUrl);

        return {
            ...response,
            optimizedUrl
        };

    } catch (error) {
        console.error("Upload failed:", error);
        // Only try to delete if the file exists
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