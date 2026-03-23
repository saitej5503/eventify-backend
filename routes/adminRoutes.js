import express from "express";
import { adminLogin } from "../controllers/adminController.js";
import { addEvent } from "../controllers/eventController.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/add-event", addEvent);

export default router;
