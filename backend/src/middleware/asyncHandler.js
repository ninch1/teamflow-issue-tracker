"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Wraps async route handlers so thrown errors are passed to Express error middleware.
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.default = asyncHandler;
