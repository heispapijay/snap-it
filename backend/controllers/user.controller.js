import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("profilePic");

export const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select("-password"); // Updated to search by email

        if (!user) {
            return res.status(404).json({ message: "Public - User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error in getPublicProfile controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password"); // Fetch user by ID and exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error in getUserById controller:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const updateProfile = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        try {
            const allowedUpdates = ["fullname", "profilePic", "contactInfo", "location"];
            const updatedFields = {};

            // Collect fields from req.body
            for (const field of allowedUpdates) {
                if (req.body[field]) {
                    updatedFields[field] = req.body[field];
                }
            }

            // Handle image upload to Cloudinary
            if (req.file) {
                // Wrap Cloudinary upload in a promise
                const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { resource_type: "image" },
                        (error, result) => {
                            if (error) {
                                console.error("Error uploading to Cloudinary:", error);
                                reject({ message: "Cloudinary upload failed", error });
                            }
                            resolve(result);
                        }
                    ).end(req.file.buffer);
                });

                // Set the profilePic URL from Cloudinary response
                updatedFields.profilePic = uploadResult.secure_url;
            }

            // Update the user in the database
            const user = await User.findByIdAndUpdate(
                req.user._id,
                { $set: updatedFields },
                { new: true }
            ).select("-password");

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(user);
        } catch (error) {
            console.error("Error in updateProfile controller:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    });
};


