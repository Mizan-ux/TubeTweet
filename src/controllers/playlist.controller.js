import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videoId } = req.body
    //TODO: create playlist

    if ([name, description].some((item) => !item?.trim())) {
        throw new ApiError(401, "All fields are required");
    }

    const playlistExixtance = await Playlist.findOne({ name, description, owner: req.user._id });
    if (playlistExixtance) {
        throw new ApiError(400, "the same name playlist is available use Different name");
    }


    const playList = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videoId: videoId || null,
    });

    if (!playList) {
        throw new ApiError(400, "Playlist is not Created");
    }

    return res.status(201).json(
        new ApiResponse(201, playList, "Plalist is created Successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid Credencials");
    }

    const userPlaylist = await Playlist.findOne({ owner: userId });

    if (!userPlaylist) {
        throw new ApiError(400, "PlayList not Found");
    }

    return res.status(200).json(
        new ApiResponse(200, userPlaylist, "PlayList Found Successfully")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Credencials");
    }

    const playlist = await Playlist.findOne({ _id: playlistId });

    if (!playlist) {
        throw new ApiError(400, "PlayList not Found");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "PlayList Found Successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId && videoId)) {
        throw new ApiError(400, "Invalid Credencials");
    }

    const addedVdoPlalist = await Playlist.findByIdAndUpdate(
        { _id: playlistId },
        {
            $set: {
                videoId: videoId
            }
        },
        { new: true }
    )

    if (!addedVdoPlalist) {
        throw new ApiError(400, "PlayList not Found or not updated");
    }

    return res.status(200).json(
        new ApiResponse(200, addVideoToPlaylist, "Video Added to PlayList Successfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId && videoId)) {
        throw new ApiError(400, "Invalid Credencials");
    }

    const removedVdoFPlaylist = await Playlist.findOneAndDelete(
        {
            _id: playlistId,
            videoId: videoId
        }
    );

    if (!removedVdoFPlaylist) {
        throw new ApiError(400, "Not Able to remove video");
    }

    return res.status(200).json(
        new ApiResponse(200, removedVdoFPlaylist, "Video removed Successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Credencials");
    }

    const delPlaylist = await Playlist.findOneAndDelete(
        {
            _id: playlistId,
        }
    );

    if (!delPlaylist) {
        throw new ApiError(400, "Not Able to delete playlist");
    }

    return res.status(200).json(
        new ApiResponse(200, delPlaylist, "playlist deleted Successfully")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Credencials");
    }
    if ([name, description].some((item) => !item?.trim())) {
        throw new ApiError(401, "All fields are required");
    }

    const updPlaylist = await Playlist.findByIdAndUpdate(
        { _id: playlistId },
        {
            $set: {
                name: name,
                description: description
            }
        },
        { new: true }
    )

    if (!updPlaylist) {
        throw new ApiError(400, "Not Able to update playlist");
    }

    return res.status(200).json(
        new ApiResponse(200, updPlaylist, "playlist updated Successfully")
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}