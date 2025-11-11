import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if the user already liked this video
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(
            new ApiResponse(200, null, "Unliked successfully")
        );
    } else {
        const newLike = await Like.create({
            likedBy: req.user._id,
            video: videoId
        });
        return res.status(201).json(
            new ApiResponse(201, newLike, "Liked successfully")
        );
    }
}) //tested

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(
            new ApiResponse(200, null, "Unliked successfully")
        );
    } else {
        const newLike = await Like.create({
            likedBy: req.user._id,
            comment: commentId
        });
        return res.status(201).json(
            new ApiResponse(201, newLike, "Liked successfully")
        );
    }
}); //tested

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(
            new ApiResponse(200, null, "Unliked successfully")
        );
    } else {
        const newLike = await Like.create({
            likedBy: req.user._id,
            tweet: tweetId
        });
        return res.status(201).json(
            new ApiResponse(201, newLike, "Liked successfully")
        );
    }
}); //tested

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    try {
        const data = await Like.find(
            {
                likedBy: req.user._id,
                video: { $ne: null }
            }).populate("video");
        if (!data || data.length === 0) {
            throw new ApiError(400, "You have no liked videos or provide valid id");
        }

        return res.status(200).json(
            new ApiResponse(200, data, "all videos Fetched Successfully")
        )
    } catch (error) {
        throw new ApiError(
            500,
            "Error while Searching for Videos",
            [],
            error?.stack
        );
    }
}) //tested

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}