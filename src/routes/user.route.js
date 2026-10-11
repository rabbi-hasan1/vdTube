import { Router } from "express";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  refreshToken,
  changePassword,
  updateUserName,
  updateUserProfile,
} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { checkAuth } from "../middleware/auth.middleware.js";
const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  [
    body("username")
      .notEmpty()
      .withMessage("username is required")
      .isLength({ min: 3 })
      .withMessage("username must be at least 3 characters long")
      .isLength({ max: 20 })
      .withMessage("username must be at most 20 characters long"),

    body("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is not valid")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters long"),
  ],
  registerUser
);
router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is not valid")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("password is required"),
  ],
  loginUser
);

router.get("/logout", checkAuth, logoutUser);
router.get("/refreshToken", checkAuth, refreshToken)
router.get("/profile", checkAuth, getUserProfile);
router.patch("/change-password", checkAuth,[
  body("oldPassword")
    .notEmpty()
    .withMessage("old password is required")
    .isLength({ min: 6 })
    .withMessage("old password must be at least 6 characters long"),
  body("newPassword")
    .notEmpty()
    .withMessage("new password is required")
    .isLength({ min: 6 })
    .withMessage("new password must be at least 6 characters long"),
], changePassword);

router.patch("/update-profile", checkAuth, upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverPhoto", maxCount: 1 },
]), updateUserProfile);


router.patch("/update-username", checkAuth,[
  body("username")
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3 })
    .withMessage("username must be at least 3 characters long")
    .isLength({ max: 20 })
    .withMessage("username must be at most 20 characters long"),
], updateUserName);

export default router;
