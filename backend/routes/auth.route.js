import express from 'express';
import { login, logout, signup, getCurrentlyLoggedInUser } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.get('/me', protectRoute, getCurrentlyLoggedInUser);

export default router;