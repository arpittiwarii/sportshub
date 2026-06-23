const { Worker } = require("bullmq");
const { sendWelcomeEmail, sendOtpEmail, sendApprovalConfirmedEmail, sendApprovalRejectedEmail, sendApprovalRequestEmail } = require("../utils/email.service.js");

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
        }
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379
        }
    }
);