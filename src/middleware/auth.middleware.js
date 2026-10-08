import {ApiError} from "../utlits/ApiErrors.js";
import { asyncHandler } from "./../utlits/asyncHandler.js";
import jwt from "jsonwebtoken";
export const checkAuth = asyncHandler((req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;
    if (!token) {
      throw new ApiError(401, "Unauthorized", "No token provided");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(new ApiError(401, "Unauthorized", error.message));
  }
});
