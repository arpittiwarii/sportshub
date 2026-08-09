const { Queue } = require('bullmq');
const { config } = require('../env');

const emailQueue = new Queue('email-queue', {
    connection: config.redis.url
        ? { connectionString: config.redis.url }
        : {
            host: config.redis.host,
            port: config.redis.port,
        },
});

module.exports = { emailQueue }