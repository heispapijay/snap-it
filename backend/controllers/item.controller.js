import cloudinary from '../lib/cloudinary.js';
import Item from '../models/item.model.js';

export const getFeedItems = async (req, res) => {
    try {
        const items = await Item.find({ status: 'available' })
            .sort({ createdAt: -1 })
            .select('image caption price location')
            .populate('owner', 'username profilePic');

        // Check if the items array is empty
        if (items.length === 0) {
            return res.status(404).json({ message: 'No items found' });
        }

        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getFeedItems controller:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}

export const createItem = async (req, res) => {
    try {
        const { image, caption, price, location, contactInfo } = req.body;

        const imgResult = await cloudinary.uploader.upload(image);
        const newItem = new Item({
            owner: req.user._id,
            image: imgResult.secure_url,
            caption,
            price,
            location,
            contactInfo,
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error in createItem controller:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}

export const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id)
            .populate('owner', 'username profilePic location contactInfo');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error('Error in getItemById controller:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user._id;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if the user is the owner of the item
        if (item.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized delete' });
        }

        if (item.image) {
            const publicId = item.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await Item.findByIdAndDelete(itemId);

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error in deleteItem controller:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}

export const updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user._id;
        const { image, caption, price, location, contactInfo, status } = req.body;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if the user is the owner of the item
        if (item.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized update' });
        }

        if (image) {
            if (item.image) {
                const publicId = item.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            const imgResult = await cloudinary.uploader.upload(image);
            item.image = imgResult.secure_url;
        } else {
            item.image = item.image;
        }

        // Update fields only if provided; keep existing values if not
        if (caption) item.caption = caption;
        if (price !== undefined) item.price = price; // Allow price to be set to 0
        if (location) item.location = location;
        if (contactInfo) item.contactInfo = contactInfo;
        if (status) item.status = status;

        await item.save();
        res.status(200).json(item);


    } catch (error) {
        console.error('Error in updateItem controller:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}