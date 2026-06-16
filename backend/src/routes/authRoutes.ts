import express from "express";
import {
  register,
  login,
  me,
  refreshAccessToken,
  logout,
} from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";

const authRouter = express.Router();

// POST request for registering user.
// PARAMS: name, email, password
authRouter.post("/register", register);

// POST request to log in user.
// PARAMS: email, password
authRouter.post("/login", login);

// POST request to refresh access token.
// PARAMS: refresh token
authRouter.post("/refresh", refreshAccessToken);

// POST request to logout user.
// PARAMS: refresh token
authRouter.post("/logout", logout);

// PROTECTED GET request to get user information
// AUTH: Bearer Token
authRouter.route("/me").get(authMiddleware, me);

export default authRouter;
