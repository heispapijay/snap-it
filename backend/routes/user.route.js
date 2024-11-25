import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserById, getPublicProfile, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/:id", protectRoute, getUserById);

router.get("/:email", protectRoute, getPublicProfile);

router.put("/profile", protectRoute, updateProfile);

export default router;