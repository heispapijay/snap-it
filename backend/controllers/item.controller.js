import cloudinary from '../lib/cloudinary.js';
import Item from '../models/item.model.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: File type not supported');
        }
    }
}).single('image');

export const getFeedItems = async (req, res) => {
    try {
        const items = await Item.find({ status: 'available' })
            .sort({ createdAt: -1 })
            .select('image caption price location category')
            .populate('owner', 'email profilePic');

        if (items.length === 0) {
            return res.status(404).json({ message: 'No items found' });
        }

        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getFeedItems controller:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createItem = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        try {
            const { caption, price, category, location, contactInfo } = req.body;
            const { file } = req;

            if (!file || !caption || !price || !category || !location || !contactInfo) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'your_folder_name',
                allowed_formats: ['jpg', 'png', 'webp'],  
                format: 'webp',                           
                quality: 'auto:eco',                      
            });

            //  new item and set the owner
            const newItem = new Item({
                image: result.secure_url,
                caption,
                price,
                category,
                location,
                contactInfo,
                owner: req.user.id,
            });

            const savedItem = await newItem.save();
            res.status(201).json({ message: "Item created successfully", item: savedItem });
        } catch (error) {
            console.error("Error in createItem controller:", error.message);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    });
};

export const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID parameter is required' });
        }
        const item = await Item.findById(id)
            .populate('owner', 'email profilePic location contactInfo');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error('Error in getItemById controller:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user._id;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

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
};

export const updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user._id;
        const { caption, price, category, location, contactInfo, status } = req.body;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized update' });
        }

        // update other fields
        if (caption) item.caption = caption;
        if (price !== undefined) item.price = price;
        if (category) item.category = category;
        if (location) item.location = location;
        if (contactInfo) item.contactInfo = contactInfo;
        if (status) item.status = status;

        await item.save();
        res.status(200).json(item);
    } catch (error) {
        console.error('Error in updateItem controller:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getUserItems = async (req, res) => {
    try {
        const items = await Item.find({ owner: req.user._id })
            .sort({ createdAt: -1 })
            .select('image caption price category location status')
            .populate('owner', 'email profilePic');

        if (items.length === 0) {
            return res.status(404).json({ message: 'No items found for this user' });
        }

        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getUserItems controller:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
