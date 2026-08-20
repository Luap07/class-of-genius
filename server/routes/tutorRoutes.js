import express from "express";
import { tutor } from "../controllers/tutorController.js";

const router = express.Router();

router.post("/", tutor);

export default router;