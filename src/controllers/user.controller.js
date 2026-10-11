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

const isUserExists = await User.findOne({
  $or: [
    { email },
    { username },
  ],
}).select("-password");

if (isUserExists) {
  return res.status(409).json(
    new ApiError(409, "User already exists")
  );
}

  if (!avatar || !coverPhoto) {
    return res.status(400).json(new ApiError(400, "avatar and cover photo are required"));
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

  return res.status(200).json(new ApiResponse(200, { user }, "user registered successfully"));
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
      .json(
        new ApiResponse(
          200,
          { accessToken: newAccessToken },
          "token refreshed successfully"
        )
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "internal server error"));
  }
});

export const updateUserName = asyncHandler(async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json(new ApiError(400, "username is required"));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true }
    ).select("-password -refreshToken");
    return res
      .status(200)
      .json(new ApiResponse(200, { user }, "username updated successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "internal server error"));
  }
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ApiError(400, "Validation error", errors.array()));
  }

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Old password and new password are required"
        )
      );
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return res
      .status(404)
      .json(new ApiError(404, "User not found"));
  }

  const isPasswordMatch = await user.comparePassword(oldPassword);

  if (!isPasswordMatch) {
    return res
      .status(401)
      .json(new ApiError(401, "Old password is incorrect"));
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Password changed successfully")
    );
});


export const updateUserProfile = asyncHandler(async (req, res) => {
  try{
    const {username, fullName} = req.body;
    const avatar = req.files?.avatar?.[0];
    const coverPhoto = req.files?.coverPhoto?.[0];
     
    if(!username && !fullName && !avatar && !coverPhoto){
      return res.status(400).json(new ApiError(400, "at least one field is required to update profile"));
    }

    const user = await User.findById(req.user.id);
    if(!user){
      return res.status(404).json(new ApiError(404, "user not found"));
    }

    if(username){
      user.username = username;
    }

    if(fullName){
      user.fullName = fullName;
    }
    if(avatar){
      const profile = await uploadOnCloudinary(avatar);
      user.avatar = profile?.url;
    }
    if(coverPhoto){
      const cover = await uploadOnCloudinary(coverPhoto);
      user.coverPhoto = cover?.url;
    }
    await user.save();

    return res.status(200).json(new ApiResponse(200, {user}, "profile updated successfully"));

  }catch(error){
    return res.status(500).json(new ApiError(500, "internal server error"));
  }
});


