import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: "Playlist",
    },
    image: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    songs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Song",
        required: true
    },
    totalDuration: {
        type: Number,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

export const Playlist = mongoose.model("Playlist", playlistSchema);
