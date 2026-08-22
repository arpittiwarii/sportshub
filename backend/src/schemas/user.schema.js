// Password policy mirrors validatePasswordStrength() in register.service.js:
// at least 8 characters, containing both a letter and a digit.
const passwordRule = {
    type: "string",
    minLength: 8,
    pattern: "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
};

const registerSchema = {
    type: "object",

    required: [
        "name",
        "email",
        "password",
        "age",
        "sports",
        "contact",
        "aadhar"
    ],

    properties: {
        name: {
            type: "string",
            minLength: 2
        },

        email: {
            type: "string",
            format: "email"
        },

        password: passwordRule,

        role: {
            type: "string",
            enum: ["ATHLETE", "ADMIN", "COACH"]
        },

        age: {
            type: "integer",
            minimum: 1
        },

        sports: {
            type: "string"
        },

        contact: {
            type: "string",
            pattern: "^[0-9]{10}$"
        },

        afiId: {
            type: "string"
        },

        aadhar: {
            type: "string"
        },

        school: {
            type: "string"
        },
    },

    additionalProperties: false
};


const loginSchema = {
    type: "object",

    required: ["email", "password"],

    properties: {
        email: {
            type: "string",
            format: "email"
        },

        password: {
            type: "string",
            minLength: 1
        }
    },

    additionalProperties: false
};

// Self-service profile update (PUT /athlete/:id). Only the fields the athlete
// service actually persists are accepted; role/email/password/status are
// deliberately excluded so a user can never escalate or hijack their account
// through this endpoint.
const updateSchema = {
    type: "object",
    additionalProperties: false,
    minProperties: 1,
    properties: {
        name: {
            type: "string",
            minLength: 2
        },

        age: {
            type: "integer",
            minimum: 1
        },

        sports: {
            type: "string"
        },

        contact: {
            type: "string",
            pattern: "^[0-9]{10}$"
        },

        afiId: {
            type: "string"
        },

        school: {
            type: "string"
        }
    }
}

module.exports = { loginSchema, registerSchema, updateSchema }
