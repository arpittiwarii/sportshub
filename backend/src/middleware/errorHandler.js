const { config } = require('../env');

function errorHandler(err, req, res, next) {
    const isProduction = config.nodeEnv === 'production';

    if (err?.name === 'MulterError') {
        return res.status(400).json({
            code: 'UPLOAD_ERROR',
            message: err.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file is too large.' : 'Invalid upload payload.'
        });
    }

    // Operational client errors (4xx) are safe to surface verbatim.
    // 5xx errors — including InternalServerError, which is also flagged
    // isOperational — must never expose their underlying message.
    if (err?.isOperational && (err.statusCode || 400) < 500) {
        return res.status(err.statusCode || 400).json({
            code: err.code || 'VALIDATION_ERROR',
            message: err.message
        });
    }

    // Validation-style failures thrown as plain (non-operational) Errors,
    // e.g. multer file-filter rejections and CORS denials.
    if (!err?.isOperational && err?.message && /invalid|unsupported|too large|not allowed/i.test(err.message)) {
        return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: err.message
        });
    }

    // Everything else is a server error: log server-side, return a generic body.
    console.error('Unhandled application error', {
        path: req.originalUrl,
        method: req.method,
        message: err?.message,
        ...(isProduction ? {} : { stack: err?.stack }),
    });

    return res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: isProduction ? 'An unexpected error occurred.' : (err?.message || 'An unexpected error occurred.'),
    });
}

module.exports = errorHandler;
