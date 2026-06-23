const nodemailer = require('nodemailer')
// const config = require('../env');
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});

const {
    otpEmailTemplate,
    welcomeEmailTemplate,
    approvalConfirmedTemplate,
    approvalRejectedTemplate,
    approvalRequestTemplate
} = require("./emailTemplates");


console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS)

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Error:", error);
    } else {
        console.log("SMTP Ready");
    }
});
// 


// welcome email
const sendWelcomeEmail = async ({ email, name }) => {
    console.log(email, name)
    await transporter.sendMail({
        from: `"Library App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Library App 🎉",
        html: `
            ${welcomeEmailTemplate(name)}
        `
    });
    return true
};


//opt sending email
const sendOtpEmail = async ({ email, name, otp }) => {
    console.log(email, name)
    await transporter.sendMail({
        from: `"Library App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Library App 🎉",
        html: `
            ${otpEmailTemplate(name, otp)}
        `
    });
    return true
};


// approval confirm email
const sendApprovalConfirmedEmail = async ({ email, name, role }) => {
    console.log(email, name)
    await transporter.sendMail({
        from: `"Library App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Library App 🎉",
        html: `
            ${approvalConfirmedTemplate(name, role)}
        `
    });
    return true
};


//approval reject email
const sendApprovalRejectedEmail = async ({ email, name, role, reason }) => {
    console.log(email, name)
    await transporter.sendMail({
        from: `"Library App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Library App 🎉",
        html: `
            ${approvalRejectedTemplate(name, role, reason)}
        `
    });
    return true
};


//Approval request email
const sendApprovalRequestEmail = async ({ email, name, role }) => {
    console.log(email, name)
    await transporter.sendMail({
        from: `"Library App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Library App 🎉",
        html: `
            ${approvalRequestTemplate(name, role)}
        `
    });
    return true
};

module.exports = {
    sendApprovalConfirmedEmail,
    sendApprovalRejectedEmail,
    sendApprovalRequestEmail,
    sendWelcomeEmail,
    sendOtpEmail
}