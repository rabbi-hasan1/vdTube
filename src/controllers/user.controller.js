import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import { asyncHandler } from "../utlits/asyncHandler.js";
import uploadOnCloudinary from "../services/cloudinary.js";
import { ApiResponse } from "../utlits/ApiResponse.js";
import { ApiError } from "./../utlits/ApiErrors.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, 
};


export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;
  const avatar = req.files?.avatar?.[0];
  const coverPhoto = req.files?.coverPhoto?.[0];
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const isUserExists = await User.findOne({ email }).select("-password");
  if (isUserExists) {
    return res.status(409).json({
      message: "user already exists",
    });
  }

  if (!avatar || !coverPhoto) {
    return res.status(400).json({
      message: "avatar and cover photo are required",
    });
  }

  const profile = await uploadOnCloudinary(avatar);
  const cover = await uploadOnCloudinary(coverPhoto);

  const user = await User.create({
    username,
    email,
    fullName,
    password,
    avatar: profile?.url,
    coverPhoto: cover?.url,
  });

  return res.status(200).json({
    message: "user registered successfully",
    user,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json(new ApiResponse(404, {}, "user not found"));
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json(new ApiError(401, "invalid credentials"));
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .cookie("accessToken", accessToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              fullName: user.fullName,
              avatar: user.avatar,
              coverPhoto: user.coverPhoto,
            },
          },
          "user logged in successfully"
        )
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "internal server error"));
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $unset: { refreshToken: 1 } }
    );
    return res
      .status(200)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json(new ApiResponse(200, {}, "user logged out successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "internal server error"));
  }
});

export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    return res
      .status(200)
      .json(
        new ApiResponse(200, { user }, "user profile fetched successfully")
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "internal server error"));
  }
});

export const refreshToken = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save();
    return res
      .status(200)
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(new ApiResponse(200, { accessToken: newAccessToken }, "token refreshed successfully"));

  }catch(error){
    return res.status(500).json(new ApiError(500, "internal server error"));
  }
});
