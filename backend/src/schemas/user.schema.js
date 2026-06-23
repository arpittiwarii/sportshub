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

        password: {
            type: "string",
            minLength: 6
        },

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
            minLength: 6
        }
    },

    additionalProperties: false
};

module.exports = { loginSchema, registerSchema }