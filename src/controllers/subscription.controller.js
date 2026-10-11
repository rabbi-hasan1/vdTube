import Subscription from "../models/subsciption.model.js";
import { ApiError } from "../utlits/ApiErrors.js";
import { ApiResponse } from "../utlits/ApiResponse.js";
import { asyncHandler } from "../utlits/asyncHandler.js";

export const subscribeChannel = asyncHandler(async (req, res) => {
  const { chanel } = req.body;
  const subscriber = req.user?.id;
  if (!chanel) {
    return res.status(400).json(new ApiError(400, " channel name is required"));
  }

  const existingSubscription = await Subscription.findOne({
    subscriber,
    chanel,
  });

  if (existingSubscription) {
    return res
      .status(400)
      .json(new ApiError(400, " already subscribed this chanel"));
  }

  await Subscription.create({
    subscriber,
    chanel,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Subscribed successfully"));
});

export const unSubscribeChanel = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { chanelId } = req.body;

  if (!userId) {
    return res
      .status(401)
      .json(new ApiError(401, "Unauthorized"));
  }

  if (!chanelId) {
    return res
      .status(400)
      .json(new ApiError(400, "Channel ID is required"));
  }

  const subscription = await Subscription.findOneAndDelete({
    subscriber: userId,
    chanel: chanelId,
  });

  if (!subscription) {
    return res
      .status(404)
      .json(new ApiError(404, "You are not subscribed to this channel"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Unsubscribed successfully")
    );
});