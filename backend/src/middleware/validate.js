const Ajv = require("ajv");
const { success } = require("../utils/apiResponse");
const addFormats = require('ajv-formats');
const ajv = new Ajv()

const validate = (Schema) => {
    const validator = ajv.compile(Schema);

    return (req, res, next) => {
        const valid = validator(req.body)
        if (!valid) {
            return res.status(400).json({
                success: false,
                errors: validator.errors
            })
        }
        next();
    }
}
addFormats(ajv);
module.exports = { validate }