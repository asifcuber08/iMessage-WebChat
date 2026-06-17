import express from "express";
import {
  deleteMessage,
  getConversationsForSidebar,
  getMessages,
  getUsersForSidebar,
  savePushSubscription,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/users", getUsersForSidebar);
router.get("/conversations", getConversationsForSidebar);
router.post("/push-subscription", savePushSubscription);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("media"), sendMessage);
router.delete("/:id", deleteMessage);

export default router;
