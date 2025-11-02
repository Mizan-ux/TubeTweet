import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Credentials");
    }

    const exixtance = await Subscription.find({ channel: channelId });

    if (!exixtance) {
        throw new ApiError(400, "Invalid ChannalId");
    }
    //for subscriber get current userId who is going to subscribe a channel that is provided by params
    //delete the document that user unsubscribed
    //now in both case we are getting channelId now we have to toggle if user and channel in one doc then delete and if it's not then create it
    try {

        const toggle = await Subscription.findOne({
            subscriber: req.user._id,
            channel: channelId
        });

        if (toggle) {
            await Subscription.deleteOne({
                subscriber: req.user,
                channel: channelId
            })
            return res.status(200).json(
                new ApiResponse(200, toggle, "Unsusbscribed Successfully")
            )
        } else {
            const newUser = await Subscription.create({
                subscriber: req.user._id,
                channel: channelId
            })
            return res.status(201).json(
                new ApiResponse(201, newUser, "Subscribed Successfully")
            )
        }
    } catch (error) {
        throw new ApiError(
            500,
            "Error while toggling subscription",
            [],
            error?.stack
        );
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}