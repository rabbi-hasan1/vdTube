import { Router } from "express";
import { checkAuth } from "../middleware/auth.middleware.js";
import { subscribeChannel } from "../controllers/subscription.controller.js";
const subscriptionRoute = Router();
subscriptionRoute.post("/subscribe", checkAuth, subscribeChannel );
export default subscriptionRoute;