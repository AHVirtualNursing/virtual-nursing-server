const nodemailer = require("nodemailer");

const sendWelcomeEmail = async (toEmail, username, temporaryPassword) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const message = {
    from: "ahvirtualnursing@gmail.com",
    to: toEmail,
    subject: "Your AH Virtual Nursing Account is live - Change Password Now!",
    html: `
            <p>Dear ${username},</p>
            <p>Congratulations - your account is live and ready for action.</p>
            <p> Your temporary password is: <strong>${temporaryPassword}</strong></p>
            <p>Please log in to your account and change your password.</p>
            <p>Best regards,<br> AH Virtual Nursing Admin</p>
        `,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("Message sent successfully as %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Email sending failed");
  }
};

module.exports = { sendWelcomeEmail };
