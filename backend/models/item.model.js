import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        caption: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            default: 0, // 0 means free
        },
        location: {
            type: String,
            required: true,
        },
        contactInfo: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ['available', 'sold'],
            default: 'available',
        },
    },
    { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
