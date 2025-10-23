
import { Schema, model } from "mongoose";

const tweetSchema = Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timeStamp: true });


export const Tweet = model("Tweet", tweetSchema);