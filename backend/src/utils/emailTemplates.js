const getEmailTemplate = (title, content) => `
<!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="margin:0;padding:0;background:#f4f7fc;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                <td align="center" style="padding:30px;">
                    <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#fff;border-radius:12px;overflow:hidden;">

                        <tr>
                            <td align="center"
                            style="background:#0f172a;color:white;padding:25px;">
                                <h1>🏆 SportsHub</h1>
                                <p>Connect • Compete • Grow</p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:30px;">
                                <h2>${title}</h2>
                                ${content}
                            </td>
                        </tr>

                        <tr>
                            <td align="center"
                            style="background:#f8fafc;padding:20px;color:#64748b;">
                            © ${new Date().getFullYear()} SportsHub
                            </td>
                        </tr>

                    </table>
                </td>
                </tr>
            </table>
        </body>
    </html>
`;

const otpEmailTemplate = (name, otp) =>
    getEmailTemplate(
        "Verify Your Account 🔐",
        `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Please use the OTP below to verify your account.</p>

        <div style="
            background:#eff6ff;
            border:2px dashed #2563eb;
            padding:20px;
            text-align:center;
            margin:20px 0;
            font-size:32px;
            font-weight:bold;
            color:#2563eb;
        ">
            ${otp}
        </div>

        <p>This OTP is valid for 10 minutes.</p>
        `
    );

const welcomeEmailTemplate = (name) =>
    getEmailTemplate(
        "Welcome to SportsHub 🎉",
        `
        <p>Hi <strong>${name}</strong>,</p>

        <p>Your registration has been completed successfully.</p>

        <div style="
            background:#fff7ed;
            border-left:5px solid #f59e0b;
            padding:15px;
            margin:20px 0;
        ">
            <strong>Profile Status:</strong> Under Review ⏳
        </div>

        <p>Our administrators are reviewing your profile.</p>
        <p>You will receive another email once your account has been approved.</p>
        `
    );

const approvalConfirmedTemplate = (name, role) =>
    getEmailTemplate(
        "Application Approved ✅",
        `
        <p>Hi <strong>${name}</strong>,</p>

        <p>Your profile has been approved.</p>

        <div style="
            background:#ecfdf5;
            border-left:5px solid #22c55e;
            padding:15px;
            margin:20px 0;
        ">
            Approved Role: <strong>${role}</strong>
        </div>

        <p>You can now log in and access SportsHub.</p>
        `
    );

const approvalRejectedTemplate = (name, role, reason = "Wrong documentation") =>
    getEmailTemplate(
        "Application Rejected ❌",
        `
        <p>Hi <strong>${name}</strong>,</p>

        <p>Your request for <strong>${role}</strong> could not be approved.</p>

        ${reason
            ? `
                <div style="
                    background:#fef2f2;
                    border-left:5px solid #ef4444;
                    padding:15px;
                    margin:20px 0;
                ">
                    ${reason}
                </div>
                `
            : ""
        }

        <p>You may update your information and apply again.</p>
        `
    );

const approvalRequestTemplate = (name, role) =>
    getEmailTemplate(
        "Approval Request Received ⏳",
        `
        <p>Hi <strong>${name}</strong>,</p>

        <p>We have successfully received your request for the role of <strong>${role}</strong>.</p>

        <div style="
            background:#fff7ed;
            border-left:5px solid #f97316;
            padding:15px;
            margin:20px 0;
        ">
            Your application is currently under review.
        </div>

        <p>Our team will verify the submitted information and notify you once a decision has been made.</p>

        <p>Thank you for your patience.</p>
        `
    );


module.exports = {
    otpEmailTemplate,
    welcomeEmailTemplate,
    approvalConfirmedTemplate,
    approvalRejectedTemplate,
    approvalRequestTemplate
};