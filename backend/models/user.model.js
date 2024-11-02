import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    profilePic: {
        type: String,
        default: "",
    },
    contactInfo: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "Earth",
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
