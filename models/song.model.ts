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
    poster_Id: {
        type: String,
        required: true
    },
    audio_url: {
        type: String,
        required: true
    },
    audio_Id: {
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
    verified: {
        type: Boolean,
        default: false
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

export interface ISong {
    _id?: mongoose.Types.ObjectId | string;
    title: string;
    album: string;
    artist: string[];
    poster_url: string;
    poster_Id: string;
    audio_url: string;
    audio_Id: string;
    duration: number;
    genre: string[];
    uploadUser: mongoose.Types.ObjectId | string | { _id: string; username: string; email: string };
    releasedDate: Date;
    plays: number;
    likes: number;
    aiObservation?: Record<string, unknown>;
    verificationStatus: "pending" | "verified" | "rejected";
    verified: boolean;
    verificationDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export const Song = mongoose.models.Song || mongoose.model("Song", songSchema);