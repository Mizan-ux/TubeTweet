import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Get absolute path to project root's public/temp directory
        const uploadDir = path.join(process.cwd(), "..", "public", "temp");
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Add file extension to maintain file type
        const uniqueSuffix = Date.now();
        cb(null, file.originalname + '-' + uniqueSuffix);
    }
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});