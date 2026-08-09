const createFeeSchema = {
    type: "object",
    required: ["amount", "month", "year"],
    additionalProperties: false,

    properties: {
        userId: {
            type: "string",
            minLength: 1
        },

        amount: {
            type: "integer",
            minimum: 0
        },

        month: {
            type: "string",
            enum: [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ]
        },

        year: {
            type: "integer",
            minimum: 2026,
        },

        screenshot: {
            type: "string"
        },

        status: {
            type: "string",
            enum: [
                "PENDING",
                "APPROVED",
                "REJECT",
                "REJECTED"
            ]
        }
    }
};

module.exports = createFeeSchema;
