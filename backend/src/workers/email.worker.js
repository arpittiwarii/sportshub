const { Worker } = require("bullmq");
const { config } = require("../env");
const { sendWelcomeEmail, sendOtpEmail, sendApprovalConfirmedEmail, sendApprovalRejectedEmail, sendApprovalRequestEmail, sendPaymentReminderEmail } = require("../utils/email.service.js");

console.log("Worker started...");

new Worker(
    "email-queue",
    async (job) => {
        console.log("Processing job:", job.name);

        switch (job.name) {
            case "welcome-email":
                await sendWelcomeEmail(job.data);
                break;

            case "otp-email":
                const res = await sendOtpEmail(job.data)
                if (res) {
                    console.log('otp gaya')
                }
                break;

            case "approval-confirm-email":
                await sendApprovalConfirmedEmail(job.data)
                break;

            case "approval-reject-email":
                await sendApprovalRejectedEmail(job.data)
                break;

            case "approval-request-email":
                await sendApprovalRequestEmail(job.data)
                break;
            case "payment-reminder-email":
                await sendPaymentReminderEmail(job.data)
                break;
            default:
                console.log("no jobs found")
        }
    },
    {
        connection: config.redis.url
            ? { connectionString: config.redis.url }
            : {
                host: config.redis.host,
                port: config.redis.port,
            },
    }
);