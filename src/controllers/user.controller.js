import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import {asyncHandler} from "../utlits/asyncHandler.js"
import uploadOnCloudinary from "../services/cloudinary.js";
export const registerUser = asyncHandler(async (req, res) => {
  
    const { username, email, password, fullName } = req.body;
    const avatar = req.files?.avatar?.[0];
    const coverPhoto = req.files?.coverPhoto?.[0];
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    const isUserExists = await User.findOne({email}).select("-password");
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

  const profile = await uploadOnCloudinary(avatar)
  const cover = await uploadOnCloudinary(coverPhoto)

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
      user
    });
 
});

export const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        return res.status(200).json({
            message: "user logged in successfully",
        });
    } catch (err) {
        console.error(err?.message);
        return res.status(500).json({
            message: "internal server error",
        });
    }
});

export const logoutUser = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json({
            message: "user logged out successfully",
        });
    } catch (err) {
        console.error(err?.message);
        return res.status(500).json({
            message: "internal server error",
        });
    }});

export const getUserProfile = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "user profile fetched successfully",
        user: req.user,
    });
})