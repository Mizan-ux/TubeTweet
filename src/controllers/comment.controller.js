import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit);
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Credencials");
    }

    const allComments = await Comment.find({ video: videoId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);

    if (!allComments || Object.keys(allComments).length === 0) {
        throw new ApiError(400, "Error while fetching Comments");
    }

    return res.status(200).json(
        new ApiResponse(200, allComments, "Comments Fetched Successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Credencials");
    }

    const result = await Video.exists({ video: videoId });

    if (!result) {
        throw new ApiError(400, "Invalid VideoId");
    }

    const commentAdded = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });

    if (!commentAdded) {
        throw new ApiError(400, "Comment is not added");
    }

    return res.status(201).json(
        new ApiResponse(201, commentAdded, "Comment added Successfully")
    );
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Credencials");
    }

    const comment = await Comment.findOne({ _id: commentId, owner: req.user._id });
    if (!comment) {
        throw new ApiError(403, "Unauthorized or comment not found");
    }

    const result = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        { new: true }
    );

    if (!result) {
        throw new ApiError(404, "Comment not found or not updated");
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Comment updated Successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Credencials");
    }

    const comment = await Comment.findOne({ _id: commentId, owner: req.user._id });
    if (!comment) {
        throw new ApiError(403, "Unauthorized or comment not found");
    }

    const deletedOne = await Comment.deleteOne({ _id: commentId });

    if (deletedOne.deletedCount === 0) {
        throw new ApiError(404, "Comment not found or already deleted");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedOne, "Comment deleted Successfully")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}