import { Router } from "express";
import { checkAuth } from "../middleware/auth.middleware.js";
import {
  subscribeChannel,
  unSubscribeChanel,
} from "../controllers/subscription.controller.js";
const subscriptionRoute = Router();
subscriptionRoute.post("/subscribe", checkAuth, subscribeChannel);
subscriptionRoute.delete("/unsubscribe", checkAuth, unSubscribeChanel);
export default subscriptionRoute;
