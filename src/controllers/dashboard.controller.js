import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    try {
        // 1. Get all your video IDs
        const videoIds = await Video.find({ owner: req.user._id }).distinct("_id");

        // 2. Get total video views and total videos
        const stats = await Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(req.user._id) } },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views" },
                    totalVideos: { $sum: 1 }
                }
            }
        ]);
        const { totalViews = 0, totalVideos = 0 } = stats[0] || {};

        // 3. Get total subscribers
        const totalSubscribers = await Subscription.countDocuments({ channel: req.user._id });

        // 4. Get total likes on all your videos
        const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

        return res.status(200).json(
            new ApiResponse(200, {
                totalViews,
                totalVideos,
                totalLikes,
                totalSubscribers
            }, "Channel stats fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch channel stats", [], error?.stack);
    }
}) //tested

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const data = await Video.find({ owner: req.user._id });

    if (!data) {
        throw new ApiError(400, "can't fetch the video");
    }

    return res.status(200).json(
        new ApiResponse(200, data, "Videos Fetched Successfully")
    )
}) //tested

export {
    getChannelStats,
    getChannelVideos
}