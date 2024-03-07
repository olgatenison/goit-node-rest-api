import express from "express";
import ctrl from "../controllers/auth.js";
import { validateBody } from "../helpers/validateBody.js";
import { loginSchema, registerSchema } from "../db/user.js";

import { authenticate } from "../helpers/authenticate.js";

const router = express.Router();

// singup
router.post("/register", validateBody(registerSchema), ctrl.register);

// signin
router.post("/login", validateBody(loginSchema), ctrl.login);

// current
router.get("/current", authenticate, ctrl.getCurrent);

//logout
router.post("/logout", authenticate, ctrl.logout);

export default router;