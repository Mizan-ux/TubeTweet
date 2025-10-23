import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { title, content } = req.body;
    if ([title, content].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const tweet = await Tweet.create({
        title,
        content,
        owner: req.user._id
    })

    if (!tweet) {
        throw new ApiError(400, "Tweet not posted");
    }

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet Posted Successfully")
    );
}) //tested

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Not valid user id");
    }
    let tweets;
    if (userId.toString() === req.user._id.toString()) {
        tweets = await Tweet.find({ owner: userId });
    } else {
        tweets = await Tweet.find({ owner: userId }).populate({
            path: "owner",
            select: "_id username fullname avatar"
        });
    }

    if (!tweets || tweets.length === 0) {
        throw new ApiError(404, "Tweets not found");
    }

    return res.status(200).json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    );
}) //tested

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { title, content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    if ([title, content].some((item) => !item?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user._id
        },
        {
            $set: {
                title,
                content
            }
        },
        { new: true }
    );

    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully"
        )
    );
}) //tested

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const deletedTweet = await Tweet.findOneAndDelete(
        {
            _id: tweetId,
            owner: req.user._id
        }
    )

    if (!deletedTweet) {
        throw new ApiError(400, " Tweet not found or unauthorized")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedTweet,
            "Tweet deleted successfully"
        )
    );

}) //tested

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}