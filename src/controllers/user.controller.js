import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import {asyncHandler} from "../utlits/asyncHandler.js"
export async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    const isUserExists = await User.findOne({email}).select("-password");
    if (isUserExists) {
      return res.status(400).json({
        message: "user already exists",
      });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    return res.status(200).json({
      message: "user registered successfully",
      user
    });
  } catch (err) {
    console.error(err?.message);
    return res.status(500).json({
      message: "internal server error",
    });
  }
}

export async function loginUser(req, res){
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
}

export async function logoutUser(req, res){
    try {
        return res.status(200).json({
            message: "user logged out successfully",
        });
    } catch (err) {
        console.error(err?.message);
        return res.status(500).json({
            message: "internal server error",
        });
    }}

export const getUserProfile = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "user profile fetched successfully",
        user: req.user,
    });
})