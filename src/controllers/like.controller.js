import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const exixtance = await Like.find({ video: videoId });

    if (!exixtance) {
        throw new ApiError(400, "Invalid ChannalId");
    }

    const updatedVideo = await Like.findOne(
        {
            _id: exixtance._id,
            likedBy: req.user._id
        });

    if (updatedVideo) {
        await Like.deleteOne({
            likedBy: req.user._id,
            _id: exixtance._id,
            video: videoId
        })
        return res.status(200).json(
            new ApiResponse(200, updatedVideo, "Unliked Successfully")
        )
    } else {
        const newUser = await Like.create({
            likedBy: req.user._id,
            video: videoId
        })
        return res.status(201).json(
            new ApiResponse(201, newUser, "Subscribed Successfully")
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const exixtance = await Like.find({ comment: commentId });

    if (!exixtance) {
        throw new ApiError(400, "Invalid ChannalId");
    }

    const updatedVideo = await Like.findOne(
        {
            _id: exixtance._id,
            likedBy: req.user._id
        });

    if (updatedVideo) {
        await Like.deleteOne({
            likedBy: req.user._id,
            _id: exixtance._id,
            comment: commentId
        })
        return res.status(200).json(
            new ApiResponse(200, updatedVideo, "Unliked Successfully")
        )
    } else {
        const newUser = await Like.create({
            likedBy: req.user._id,
            comment: commentId
        })
        return res.status(201).json(
            new ApiResponse(201, newUser, "Subscribed Successfully")
        )
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const exixtance = await Like.find({ tweet: tweetId });

    if (!exixtance) {
        throw new ApiError(400, "Invalid ChannalId");
    }

    const updatedVideo = await Like.findOne(
        {
            _id: exixtance._id,
            likedBy: req.user._id
        });

    if (updatedVideo) {
        await Like.deleteOne({
            likedBy: req.user._id,
            _id: exixtance._id,
            tweet: tweetId
        })
        return res.status(200).json(
            new ApiResponse(200, updatedVideo, "Unliked Successfully")
        )
    } else {
        const newUser = await Like.create({
            likedBy: req.user._id,
            tweet: tweetId
        })
        return res.status(201).json(
            new ApiResponse(201, newUser, "Subscribed Successfully")
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}