import { Router } from "express";
import * as friendController from "../controllers/friend.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  sendFriendRequestSchema,
  friendshipIdParamSchema,
  friendStatusParamSchema,
} from "../validators/friend.validator";

const router = Router();
router.use(requireAuth);

router.get("/", friendController.listFriends);
router.get("/requests", friendController.listFriendRequests);
router.get("/search", friendController.searchUsers);
router.get("/status/:username", validate(friendStatusParamSchema), friendController.getFriendStatus);
router.post("/request", validate(sendFriendRequestSchema), friendController.sendFriendRequest);
router.post("/:friendshipId/accept", validate(friendshipIdParamSchema), friendController.acceptFriendRequest);
router.post("/:friendshipId/decline", validate(friendshipIdParamSchema), friendController.declineFriendRequest);
router.delete("/:friendshipId", validate(friendshipIdParamSchema), friendController.removeFriendship);

export default router;
