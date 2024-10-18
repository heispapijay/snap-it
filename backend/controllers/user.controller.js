import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";


export const getPublicProfile = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username }).select("-password");

		if (!user) {
			return res.status(404).json({ message: "Public - User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error("Error in getPublicProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateProfile = async (req, res) => {
    try {
        const allowedUpdates = [
            "fullname",
            "profilePic",
            "contactInfo",
            "location",
        ];

        const updatedFields = {};

        for (const field of allowedUpdates) {
            if (req.body[field]) {
                updatedFields[field] = req.body[field];
            }
        }

        if (req.body.profilePic) {
            const result = await cloudinary.uploader.upload(req.body.profilePic)
            updatedFields.profilePic = result.secure_url;            
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updatedFields },
            { new: true }
        ).select("-password");

        res.json(user);
    } catch (error) {
        console.error("Error in updateProfile controller:", error);
        res.status(500).json({ message: "Server error" });
    }
}