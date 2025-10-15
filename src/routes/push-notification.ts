import express from "express";
import {
  registerPushToken,
  unregisterPushToken,
  sendTestNotification,
  sendNotificationWithSecret,
  getActiveTokens,
  cleanupInactiveTokens,
  getDevices,
} from "../controller/push-notification";
import { checkToken, isAdmin } from "../middlewares/checkAuth";

const router = express.Router();

router.get("/notifications/device", getDevices);
// Public routes (không cần auth)
router.post("/push-token/register", registerPushToken);
router.post("/push-token/unregister", unregisterPushToken);

// 🔥 GỬI NOTIFICATION KHÔNG CẦN LOGIN - Chỉ cần SECRET_KEY
router.post("/notification/send", sendNotificationWithSecret);

// Protected routes (cần admin)
router.post(
  "/push-notification/test",
  [checkToken, isAdmin],
  sendTestNotification
);

router.get(
  "/push-tokens",
  [checkToken, isAdmin],
  getActiveTokens
);

router.delete(
  "/push-tokens/cleanup",
  [checkToken, isAdmin],
  cleanupInactiveTokens
);

export default router;

