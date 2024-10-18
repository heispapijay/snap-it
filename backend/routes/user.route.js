import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getPublicProfile, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/:username", protectRoute, getPublicProfile);

router.put("/profile", protectRoute, updateProfile);

export default router;