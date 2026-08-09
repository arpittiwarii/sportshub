const { config } = require('../env');

function errorHandler(err, req, res, next) {
    const isProduction = config.nodeEnv === 'production';

    if (err?.name === 'MulterError') {
        return res.status(400).json({
            code: 'UPLOAD_ERROR',
            message: err.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file is too large.' : 'Invalid upload payload.'
        });
    }

    if (err?.isOperational) {
        return res.status(err.statusCode || 400).json({
            code: err.code || 'VALIDATION_ERROR',
            message: err.message
        });
    }

    if (err?.message && /invalid|unsupported|too large|not allowed/i.test(err.message)) {
        return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: err.message
        });
    }

    if (!isProduction) {
        console.error(err);
        return res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: err.message || 'An unexpected error occurred.'
        });
    }

    console.error('Unhandled application error', { path: req.originalUrl, method: req.method });
    return res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.'
    });
}

module.exports = errorHandler;
