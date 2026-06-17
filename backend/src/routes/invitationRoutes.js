"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invitationController_1 = require("../controllers/invitationController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const invitationRouter = express_1.default.Router();
invitationRouter.route('/me').get(authMiddleware_1.default, invitationController_1.getMyInvitations);
invitationRouter
    .route('/:invitationId/accept')
    .patch(authMiddleware_1.default, invitationController_1.acceptInvitation);
invitationRouter
    .route('/:invitationId/decline')
    .patch(authMiddleware_1.default, invitationController_1.declineInvitation);
exports.default = invitationRouter;
