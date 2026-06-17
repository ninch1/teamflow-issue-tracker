"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = __importDefault(require("./asyncHandler"));
const ErrorResponse_1 = __importDefault(require("../errors/ErrorResponse"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to protect routes from unauthorized users
exports.default = (0, asyncHandler_1.default)(async (req, res, next) => {
    // gets authorization headers
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return next(new ErrorResponse_1.default('Not authorized', 401));
    // get token from headers
    let token;
    if (authHeader.startsWith('Bearer '))
        token = authHeader.split(' ')[1];
    if (!token)
        return next(new ErrorResponse_1.default('Not authorized', 401));
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
        return next(new ErrorResponse_1.default('JWT secret is not configured', 500));
    // verify token
    const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
    if (typeof decoded !== 'object' ||
        decoded === null ||
        typeof decoded.userId !== 'string') {
        return next(new ErrorResponse_1.default('Unauthorized access', 401));
    }
    // gets user id
    const userId = decoded.userId;
    // finds user
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user)
        return next(new ErrorResponse_1.default('Unauthorized access', 401));
    // pass user to the protected route using custom req type
    const authReq = req;
    authReq.user = {
        id: user.id,
        name: user.name,
        email: user.email,
    };
    next();
});
