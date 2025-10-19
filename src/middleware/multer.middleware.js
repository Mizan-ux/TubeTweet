import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

const uploadDir = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, file.originalname + '-' + uniqueSuffix);
    }
});

// File type validation
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

    // Check file type based on field name
    if (file.fieldname === 'avatar' || file.fieldname === 'coverImage') {
        if (!imageTypes.includes(file.mimetype)) {
            return cb(new ApiError(400, "Only .jpg, .jpeg, .png, .gif and .webp formats allowed for images"), false);
        }
    }

    if (file.fieldname === 'videoFile') {
        if (!videoTypes.includes(file.mimetype)) {
            return cb(new ApiError(400, "Only .mp4, .webm and .mov formats allowed for videos"), false);
        }
    }

    if (file.fieldname === 'thumbnail') {
        if (!imageTypes.includes(file.mimetype)) {
            return cb(new ApiError(400, "Only image formats allowed for thumbnail"), false);
        }
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: (req, file) => {
            if (file.fieldname === 'videoFile') {
                return 100 * 1024 * 1024 * 1024; // 1000MB for videos
            }
            return 5 * 1024 * 1024; // 5MB for images
        }
    }
});