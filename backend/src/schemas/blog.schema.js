const createBlogSchema = {
    type: "object",
    required: ["title", "content", "userId"],
    additionalProperties: false,

    properties: {
        title: {
            type: "string",
            minLength: 1,
            maxLength: 255
        },

        content: {
            type: "string",
            minLength: 1
        },

        userId: {
            type: "integer",
            minimum: 1
        }
    }
};

module.exports = createBlogSchema;