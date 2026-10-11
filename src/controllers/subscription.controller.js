import Subscription from "../models/subsciption.model.js";
import { ApiError } from "../utlits/ApiErrors.js";
import { ApiResponse } from "../utlits/ApiResponse.js";
import { asyncHandler } from "../utlits/asyncHandler.js";

export const subscribeChannel = asyncHandler(async (req, res) => {
  const { chanel } = req.body;
  const subscriber = req.user?.id;
  console.log(subscriber, chanel);
  if (!chanel) {
    return res.status(400).json(new ApiError(400, " channel name is required"));
  }

  const existingSubscription = await Subscription.findOne({
    subscriber,
    chanel,
  });

  if (existingSubscription) {
    return res.status(400).json(new ApiError(400, " already subscribed this chanel"));
  }

  await Subscription.create({
    subscriber,
    chanel,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Subscribed successfully"));
});
