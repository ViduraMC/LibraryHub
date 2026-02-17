import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// send email helper function
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"LibraryHub" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        return false;
    }
};

export default sendEmail;
