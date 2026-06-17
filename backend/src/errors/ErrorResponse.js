"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Helper class to send custom error responses with: message, status code
class ErrorResponse extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.default = ErrorResponse;
