import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    album: {
        type: String,
        required: true
    },
    artist: {
        type: [String],
        required: true
    },
    poster_url: {
        type: String,
        required: true
    },
    audio_url: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    genre: {
        type: [String],
        required: true
    },
    uploadUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    releasedDate: {
        type: Date,
        required: true
    },
    plays: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    aiObservation: {
        type: Object,
        required: true
    },
    verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    verificationDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

});

export const Song = mongoose.model("Song", songSchema);