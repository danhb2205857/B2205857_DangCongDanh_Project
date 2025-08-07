import express from "express";
import AuthController from "../../controllers/AuthController.js";
import { authenticateToken } from "../../middlewares/auth.js";
import {
  validateLogin,
  validateChangePassword,
  validateRegister,
} from "../../middlewares/validation.js";
import { catchAsync } from "../../middlewares/errorHandler.js";

const router = express.Router();

// Public routes with error handling
router.post("/login", validateLogin, catchAsync(AuthController.login));
router.post("/register", validateRegister, catchAsync(AuthController.register));

// Protected routes (require authentication) - COMMENTED FOR TESTING
// router.use(authenticateToken); // Apply auth middleware to all routes below

router.post("/logout", catchAsync(AuthController.logout));
router.get("/profile", catchAsync(AuthController.getProfile));
router.put(
  "/change-password",
  validateChangePassword,
  catchAsync(AuthController.changePassword)
);
router.post("/refresh", catchAsync(AuthController.refreshToken));

export default router;
