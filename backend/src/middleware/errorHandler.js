function errorHandler(err, req, res, next) {

    console.error(err);

    if (err.isOperational) {

        return res
            .status(err.statusCode)
            .json({
                code: err.code,
                message: err.message
            });
    }

    return res
        .status(500)
        .json({
            code: "INTERNAL_ERROR",
            message: err.message
        });
}

module.exports = errorHandler;


//something to implement later 


// (err, req, res, next) => {
//   // eslint-disable-next-line no-console
//   console.error('API Error:', err);

//   if (err instanceof multer.MulterError) {
//     return res.status(400).json({ message: err.message });
//   }

//   // FileFilter/file validation errors typically come as plain Error objects.
//   if (err?.message && err.message.toLowerCase().includes('invalid')) {
//     return res.status(400).json({ message: err.message });
//   }

//   return res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
// } 