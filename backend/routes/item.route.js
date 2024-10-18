import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { createItem, deleteItem, getFeedItems, getItemById, getUserItems, updateItem } from '../controllers/item.controller.js';

const router = express.Router();

router.get('/', protectRoute, getFeedItems);
router.get('/item/:id', protectRoute, getItemById);
router.post('/create', protectRoute, createItem);
router.delete('/delete/:id', protectRoute, deleteItem);
router.put('/update/:id', protectRoute, updateItem);
router.get('/user', protectRoute, getUserItems);

export default router;