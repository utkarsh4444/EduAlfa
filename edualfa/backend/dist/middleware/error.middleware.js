"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    console.error(err);
    if (err instanceof Error) {
        return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Unexpected server error' });
}
