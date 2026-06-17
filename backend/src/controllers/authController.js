"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.updateMe = exports.me = exports.refreshAccessToken = exports.logout = exports.login = exports.register = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const ErrorResponse_1 = __importDefault(require("../errors/ErrorResponse"));
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const tokens_1 = require("../utils/tokens");
const saltRounds = 10;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function getNameValidationError(rawName) {
    const trimmedName = rawName.trim();
    if (!trimmedName) {
        return 'Name is required';
    }
    const nameParts = trimmedName.split(/\s+/);
    if (nameParts.length < 2) {
        return 'Name must include first and last name';
    }
    if (nameParts.length > 3) {
        return 'Name can include at most first, middle, and last name';
    }
    for (const part of nameParts) {
        if (!/^[A-Za-z]+$/.test(part)) {
            return 'Name can only contain letters';
        }
        if (part.length < 2) {
            return 'Each name must be at least 2 characters';
        }
        if (part.length > 30) {
            return 'Each name must be 30 characters or less';
        }
    }
    return null;
}
function normalizeUserName(rawName) {
    return rawName.trim().split(/\s+/).join(' ');
}
// Register User controller. creates user. Required parameters: name, email, password.
exports.register = (0, asyncHandler_1.default)(async (req, res, next) => {
    const userInfo = req.body;
    // checks types of user info
    if (typeof userInfo.name !== 'string' ||
        typeof userInfo.email !== 'string' ||
        typeof userInfo.password !== 'string') {
        return next(new ErrorResponse_1.default('Name, email, and password are required', 400));
    }
    // validates email
    const email = userInfo.email.trim().toLowerCase();
    if (!emailRegex.test(email)) {
        return next(new ErrorResponse_1.default('Invalid email', 400));
    }
    // validates name
    const nameError = getNameValidationError(userInfo.name);
    if (nameError) {
        return next(new ErrorResponse_1.default(nameError, 400));
    }
    const name = normalizeUserName(userInfo.name);
    // validates and encrypts password
    const password = userInfo.password;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;
    if (!passwordRegex.test(password)) {
        return next(new ErrorResponse_1.default('Please create a stronger password', 400));
    }
    const passwordHash = await bcrypt_1.default.hash(password, saltRounds);
    // Creates user
    const user = await prisma_1.default.user.create({
        data: {
            email,
            name,
            passwordHash,
        },
    });
    const token = (0, tokens_1.createAccessToken)(user.id);
    const refreshToken = (0, tokens_1.createRefreshToken)();
    await prisma_1.default.refreshToken.create({
        data: {
            tokenHash: (0, tokens_1.hashRefreshToken)(refreshToken),
            userId: user.id,
            expiresAt: (0, tokens_1.getRefreshTokenExpiresAt)(),
        },
    });
    return res.status(201).json({
        message: 'User registered successfully',
        token,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    });
});
// Login User controller. logs in user. Required parameters: email, password.
exports.login = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    // check if email and password are strings before processing them
    if (typeof email !== 'string' || typeof password !== 'string') {
        return next(new ErrorResponse_1.default('Valid email and password are required', 400));
    }
    const trimmedEmail = email.trim().toLowerCase();
    // checks if email is valid
    if (!emailRegex.test(trimmedEmail) || password.length < 1) {
        return next(new ErrorResponse_1.default('Valid email and password are required', 400));
    }
    // finds user
    const user = await prisma_1.default.user.findUnique({
        where: {
            email: trimmedEmail,
        },
    });
    // if user does not exist
    if (!user) {
        return next(new ErrorResponse_1.default('Invalid email or password', 401));
    }
    // check password
    const isPasswordCorrect = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
        return next(new ErrorResponse_1.default('Invalid email or password', 401));
    }
    const token = (0, tokens_1.createAccessToken)(user.id);
    const refreshToken = (0, tokens_1.createRefreshToken)();
    await prisma_1.default.refreshToken.create({
        data: {
            tokenHash: (0, tokens_1.hashRefreshToken)(refreshToken),
            userId: user.id,
            expiresAt: (0, tokens_1.getRefreshTokenExpiresAt)(),
        },
    });
    // login and return tokens
    return res.status(200).json({
        message: 'Logged in successfully',
        token,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    });
});
exports.logout = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { refreshToken } = req.body;
    if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
        return next(new ErrorResponse_1.default('Refresh token is required', 400));
    }
    const tokenHash = (0, tokens_1.hashRefreshToken)(refreshToken);
    await prisma_1.default.refreshToken.updateMany({
        where: {
            tokenHash,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
    return res.status(200).json({
        message: 'Logged out successfully',
    });
});
exports.refreshAccessToken = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { refreshToken } = req.body;
    if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
        return next(new ErrorResponse_1.default('Refresh token is required', 400));
    }
    const tokenHash = (0, tokens_1.hashRefreshToken)(refreshToken);
    const storedToken = await prisma_1.default.refreshToken.findUnique({
        where: {
            tokenHash,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    if (!storedToken) {
        return next(new ErrorResponse_1.default('Invalid refresh token', 401));
    }
    if (storedToken.revokedAt) {
        return next(new ErrorResponse_1.default('Refresh token has been revoked', 401));
    }
    if (storedToken.expiresAt < new Date()) {
        return next(new ErrorResponse_1.default('Refresh token has expired', 401));
    }
    const token = (0, tokens_1.createAccessToken)(storedToken.userId);
    return res.status(200).json({
        message: 'Access token refreshed successfully',
        token,
        user: storedToken.user,
    });
});
// Protected controller. gets user info.
exports.me = (0, asyncHandler_1.default)(async (req, res, next) => {
    // gets user from authMiddleware
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default('Unauthorized access', 401));
    }
    // returns user data
    return res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    });
});
exports.updateMe = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default('Unauthorized access', 401));
    }
    const { name, email } = req.body;
    const updateData = {};
    if (name !== undefined) {
        if (typeof name !== 'string') {
            return next(new ErrorResponse_1.default('Name is required', 400));
        }
        const nameError = getNameValidationError(name);
        if (nameError) {
            return next(new ErrorResponse_1.default(nameError, 400));
        }
        updateData.name = normalizeUserName(name);
    }
    if (email !== undefined) {
        if (typeof email !== 'string' || email.trim().length === 0) {
            return next(new ErrorResponse_1.default('Email is required', 400));
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (!emailRegex.test(normalizedEmail)) {
            return next(new ErrorResponse_1.default('Invalid email', 400));
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existingUser && existingUser.id !== user.id) {
            return next(new ErrorResponse_1.default('Email is already in use', 409));
        }
        updateData.email = normalizedEmail;
    }
    if (!updateData.name && !updateData.email) {
        return next(new ErrorResponse_1.default('No profile changes provided', 400));
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: user.id },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
    return res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser,
    });
});
exports.updatePassword = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default('Unauthorized access', 401));
    }
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== 'string' ||
        currentPassword.trim().length === 0) {
        return next(new ErrorResponse_1.default('Current password is required', 400));
    }
    if (typeof newPassword !== 'string') {
        return next(new ErrorResponse_1.default('New password is required', 400));
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;
    if (!passwordRegex.test(newPassword)) {
        return next(new ErrorResponse_1.default('Please create a stronger password', 400));
    }
    const existingUser = await prisma_1.default.user.findUnique({
        where: { id: user.id },
    });
    if (!existingUser) {
        return next(new ErrorResponse_1.default('User not found', 404));
    }
    const isPasswordValid = await bcrypt_1.default.compare(currentPassword, existingUser.passwordHash);
    if (!isPasswordValid) {
        return next(new ErrorResponse_1.default('Current password is incorrect', 400));
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
    await prisma_1.default.$transaction([
        prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
            },
        }),
        prisma_1.default.refreshToken.updateMany({
            where: {
                userId: user.id,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        }),
    ]);
    return res.status(200).json({
        message: 'Password updated successfully',
    });
});
