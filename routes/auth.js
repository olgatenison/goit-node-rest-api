import express from "express";
import ctrl from "../controllers/auth.js";
import { validateBody } from "../helpers/validateBody.js";
import { loginSchema, registerSchema, emailSchema } from "../db/user.js";
import { authenticate } from "../helpers/authenticate.js";
import upload from "../helpers/upload.js";

const router = express.Router();

// singup
router.post("/register", validateBody(registerSchema), ctrl.register);

// verifyEmail
router.get("/verify/:verificationToken", ctrl.verifyEmail);
router.post("/verify", validateBody(emailSchema), ctrl.resendVerifyEmail);

// signin
router.post("/login", validateBody(loginSchema), ctrl.login);

// current
router.get("/current", authenticate, ctrl.getCurrent);

//logout
router.post("/logout", authenticate, ctrl.logout);

// change avatar
router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrl.updateAvatar
);

export default router;
