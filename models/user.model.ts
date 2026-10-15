import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "subadmin", "editor"],
        default: "subadmin"
    },
    verified: {
        type: Boolean,
        default: false
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

export interface IUser {
    _id?: mongoose.Types.ObjectId | string;
    username: string;
    email: string;
    role: "admin" | "subadmin" | "editor";
    verified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export const User = mongoose.models.User || mongoose.model("User", userSchema);
