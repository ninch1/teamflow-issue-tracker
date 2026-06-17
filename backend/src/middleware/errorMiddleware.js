"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorMiddleware;
const ErrorResponse_1 = __importDefault(require("../errors/ErrorResponse"));
const client_1 = require("../generated/prisma/client");
// Middleware for errors.
// If you pass an error or custom ErrorResponse object into next(),
// this middleware catches it and sends the response.
function errorMiddleware(err, _req, res, _next) {
    // Malformed JSON request body
    if (err instanceof SyntaxError &&
        "status" in err &&
        err.status === 400 &&
        "body" in err) {
        return res.status(400).json({ error: "Invalid JSON in request body" });
    }
    // Custom app errors
    if (err instanceof ErrorResponse_1.default) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    // Invalid JWT
    if (err instanceof Error && err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Unauthorized access' });
    }
    // Expired JWT
    if (err instanceof Error && err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
    }
    // Prisma duplicate unique field error
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002') {
        return res
            .status(409)
            .json({ error: 'Duplicate email, please choose a new email.' });
    }
    // Unexpected errors are logged for debugging.
    if (err instanceof Error) {
        console.error(err);
    }
    return res.status(500).json({ error: 'Something went wrong' });
}
