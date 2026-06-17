"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const authRouter = express_1.default.Router();
// POST request for registering user.
// PARAMS: name, email, password
authRouter.post('/register', authController_1.register);
// POST request to log in user.
// PARAMS: email, password
authRouter.post('/login', authController_1.login);
// POST request to refresh access token.
// PARAMS: refresh token
authRouter.post('/refresh', authController_1.refreshAccessToken);
// POST request to logout user.
// PARAMS: refresh token
authRouter.post('/logout', authController_1.logout);
// PROTECTED GET request to get user information
// AUTH: Bearer Token
authRouter.route('/me').get(authMiddleware_1.default, authController_1.me).patch(authMiddleware_1.default, authController_1.updateMe);
// PROTECTED PATCH request to update user password
// AUTH: Bearer Token
authRouter.route('/me/password').patch(authMiddleware_1.default, authController_1.updatePassword);
exports.default = authRouter;
