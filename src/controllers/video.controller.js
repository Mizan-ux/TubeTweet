import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
// import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"

//TODO: get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    // Convert page and limit to numbers, provide defaults
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // 1. Get the page, limit, query, sortBy, sortType, userId from the request query(frontend) [http://localhost:8000/api/v1/video/all-video?page=1&limit=10&query=hello&sortBy=createdAt&sortType=1&userId=123]
    const { query, sortBy, sortType, userId } = req.query
    // 2. Get all videos based on query, sort, pagination)
    const pipeline = [
        {
            $match: {
                $and: [
                    { isPublished: true },
                    {
                        // 2.1 match the videos based on title and description
                        $or: [
                            { title: { $regex: query, $options: "i" } },  // $regex: is used to search the string in the title "this is first video" => "first"  // i is for case-insensitive
                            { description: { $regex: query, $options: "i" } }
                        ]
                    }, // 2.2 match the videos based on userId=Owner
                    ...(userId ? [{ Owner: new mongoose.Types.ObjectId(userId) }] : []) // if userId is present then match the Owner field of video
                    // new mongoose.Types.ObjectId( userId ) => convert userId to ObjectId
                ]
            }
        },
        // 3. lookup the Owner field of video and get the user details
        {   // from user it match the _id of user with Owner field of video and saved as Owner
            $lookup: {
                from: "users",
                localField: "Owner",
                foreignField: "_id",
                as: "Owner",
                pipeline: [  // project the fields of user in Owner 
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            avatar: "$avatar.url",
                            username: 1,
                        }
                    }
                ]
            }
        },
        {
            // 4. addFields just add the Owner field to the video document 
            $addFields: {
                Owner: {
                    $first: "$Owner",  //$first: is used to get the first element of Owner array
                },
            },
        },
        {
            $sort: {
                [sortBy || "createdAt"]: sortType || -1
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
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body

    if ([title, description].some((field) => field?.trim() === "")) {
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
            title,                              // Removed toLowerCase()
            description,                        // Removed toLowerCase()
            duration: videoFile.duration,
            isPublished: isPublished ?? true,   // Default to true if not provided
            Owner: req.user._id                 // Changed owner to Owner
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
});

export { getAllVideos, publishAVideo };