const nodemailer = require('nodemailer');
const { config } = require('../env');

const {
    otpEmailTemplate,
    welcomeEmailTemplate,
    approvalConfirmedTemplate,
    approvalRejectedTemplate,
    approvalRequestTemplate,
    paymentReminderTemplate
} = require('./emailTemplates');

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Error:', error);
    } else {
        console.log('SMTP Ready');
    }
});

const sendPaymentReminderEmail = async ({ email, name, amount, duedate }) => {
    await transporter.sendMail({
        from: `"SportsHub" <${config.email.from}>`,
        to: email,
        subject: 'Payment Reminder Email',
        html: `
            ${paymentReminderTemplate(name, email, amount, duedate)}
        `,
    });
    return true;
};

const sendWelcomeEmail = async ({ email, name }) => {
    await transporter.sendMail({
        from: `"SportsHub" <${config.email.from}>`,
        to: email,
        subject: 'Welcome to SportsHub 🎉',
        html: `
            ${welcomeEmailTemplate(name)}
        `,
    });
    return true;
};

const sendOtpEmail = async ({ email, name, otp }) => {
    await transporter.sendMail({
        from: `"SportsHub" <${config.email.from}>`,
        to: email,
        subject: 'OTP verification Email',
        html: `
            ${otpEmailTemplate(name, otp)}
        `,
    });
    return true;
};

const sendApprovalConfirmedEmail = async ({ email, name, role }) => {
    await transporter.sendMail({
        from: `"SportsHub" <${config.email.from}>`,
        to: email,
        subject: 'Account Approval approves by admin 🎉',
        html: `
            ${approvalConfirmedTemplate(name, role)}
        `,
    });
    return true;
};

const sendApprovalRejectedEmail = async ({ email, name, role, reason }) => {
    await transporter.sendMail({
        from: `"SportsHub" <${config.email.from}>`,
        to: email,
        subject: 'Account Approval Rejects by admin because of wrong documentation',
        html: `
            ${approvalRejectedTemplate(name, role, reason)}
        `,
    });
    return true;
};

const sendApprovalRequestEmail = async ({ email, name, role }) => {
    await transporter.sendMail({
        from: `"SportsHub" <${config.email.from}>`,
        to: email,
        subject: 'Account in under Review, wait for admin approval',
        html: `
            ${approvalRequestTemplate(name, role)}
        `,
    });
    return true;
};

module.exports = {
    sendApprovalConfirmedEmail,
    sendApprovalRejectedEmail,
    sendApprovalRequestEmail,
    sendWelcomeEmail,
    sendOtpEmail,
    sendPaymentReminderEmail,
};