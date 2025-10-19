import { timeStamp } from "console";
import { Schema, model } from "mongoose";

const likeSchema = Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, { timeStamp: true });

export const Like = model("Like", likeSchema);