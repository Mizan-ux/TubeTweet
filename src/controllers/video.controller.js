import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudnary.js"

//TODO: get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { query = "", sortBy = "createdAt", userId } = req.query
    // 1. Get the page, limit, query, sortBy, sortType, userId from the request query(frontend) [http://localhost:8000/api/v1/video/all-video?page=1&limit=10&query=hello&sortBy=createdAt&sortType=-1&userId=123]
    const sortType = parseInt(req.query.sortType) || 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Get all videos based on query, sort, pagination)
    const pipeline = [
        {
            $match: {
                $and: [
                    { isPublished: true },
                    ...(query ? [{
                        $or: [
                            { title: { $regex: query, $options: "i" } },
                            { description: { $regex: query, $options: "i" } }
                        ]
                    }] : []),
                    ...(userId ? [{ owner: new mongoose.Types.ObjectId(userId) }] : [])
                ]
            }
        },
        // 3. lookup the Owner field of video and get the user details
        {   // from user it match the _id of user with Owner field of video and saved as Owner
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [  // project the fields of user in Owner 
                    {
                        $project: {
                            _id: 1,
                            fullname: 1,
                            avatar: "$avatar",
                            username: 1,
                        }
                    }
                ]
            }
        },
        {
            // 4. addFields just add the Owner field to the video document 
            $addFields: {
                owner: {
                    $first: "$owner",  //$first: is used to get the first element of Owner array
                },
            },
        },
        {
            $sort: {
                [sortBy]: sortType
            }
        }
    ]
    const videos = await Video.aggregate(pipeline)
        .skip(skip)  // Skip documents based on page
        .limit(limit)

    // Get total count for pagination info
    const totalVideos = await Video.aggregate([
        ...pipeline,
        { $count: "total" }
    ])

    const totalCount = totalVideos[0]?.total || 0
    const totalPages = Math.ceil(totalCount / limit)

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            currentPage: page,
            totalPages,
            totalVideos: totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }, "Videos fetched successfully")
    )
});// in tested

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body

    if ([title, description].some((field) => field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    try {

        if (!req.files?.videoFile?.[0] || !req.files?.thumbnail?.[0]) {
            throw new ApiError(400, "Both video and thumbnail files are required");
        }

        const videoLocalPath = req.files?.videoFile[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

        // Check file sizes
        const videoSize = req.files?.videoFile[0]?.size;
        console.log("Video size:", videoSize / (1024 * 1024), "MB");

        const videoFile = await uploadOnCloudinary(videoLocalPath);
        if (!videoFile?.url) {
            throw new ApiError(400, `Video upload failed: ${videoFile?.error || 'Unknown error'}`);
        }

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail?.url) {
            throw new ApiError(400, "Thumbnail upload failed");
        }

        const video = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration: videoFile.duration,
            isPublished: isPublished ?? true,   // Default to true if not provided
            owner: req.user._id
        });

        const videoUploaded = await Video.findById(video._id);

        return res.status(201).json(
            new ApiResponse(201, videoUploaded, "Video uploaded successfully")
        );

    } catch (error) {
        // Log the full error
        console.error("Video upload error:", {
            message: error.message,
            stack: error.stack,
            details: error
        });

        throw new ApiError(
            500,
            error?.message || "Video upload failed",
            [],
            error?.stack
        );
    }
}); //tested

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
    ).populate({
        path: "owner",
        select: "_id username fullname avatar"
    });

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
}); //tested

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Combined video find and ownership check
    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id
    });

    if (!video) {
        throw new ApiError(404, "Video not found or unauthorized");
    }

    if ([title, description].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const newThumbnail = req.file?.path;
    if (!newThumbnail) {
        throw new ApiError(400, "thumbnail files are required");
    }


    // Store old thumbnail URL
    const oldThumbnailUrl = video.thumbnail;

    // Upload new thumbnail
    const thumbnail = await uploadOnCloudinary(newThumbnail);
    if (!thumbnail?.url) {
        throw new ApiError(400, "Error while uploading thumbnail");
    }

    // Update using updateOne - faster than findByIdAndUpdate
    await Video.updateOne(
        {
            _id: videoId,
            owner: req.user._id
        },
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url
            }
        }
    );

    // Delete old thumbnail after successful update
    if (oldThumbnailUrl) {
        await deleteFromCloudinary(oldThumbnailUrl);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { title, description, thumbnail: thumbnail.url },
            "Video updated successfully"
        )
    );
});//tested

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Combined video find and ownership check
    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id
    });

    if (!video) {
        throw new ApiError(404, "Video not found or unauthorized");
    }

    try {
        // Delete files from cloudinary in parallel and
        // Delete from database
        await Promise.all([
            deleteFromCloudinary(video.videoFile),
            deleteFromCloudinary(video.thumbnail),
            Video.deleteOne({ _id: videoId })
        ]);


        return res.status(200).json(
            new ApiResponse(
                200,
                { videoId },
                "Video deleted successfully"
            )
        );
    } catch (error) {
        throw new ApiError(
            500,
            "Error while deleting video resources",
            [],
            error?.stack
        );
    }
});//tested

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Combined find and update with ownership check
    const updatedVideo = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user._id
        },
        [
            {
                $set: {
                    isPublished: { $not: "$isPublished" }
                }
            }
        ],
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            updatedVideo.isPublished ?
                "Video published successfully" :
                "Video unpublished successfully"
        )
    );
});//tested

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };