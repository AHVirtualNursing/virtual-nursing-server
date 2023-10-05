const nodemailer = require("nodemailer");
const dns = require('dns');

const sendWelcomeEmail = async (toEmail, username, temporaryPassword) => {
  
  if(await isValidEmail(toEmail)) {
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

  } else {
    throw new Error("Invalid Email");
  }
  
};

const isValidEmail = async (email) => {
  const emailParts = email.split('@');
  
  // Check if there are two parts (local part and domain)
  if (emailParts.length !== 2) {
    return false;
  }
  
  const [localPart, domain] = emailParts;
  
  // Basic regex pattern for local part
  const localPartPattern = /^[a-zA-Z0-9._-]+$/;
  
  // Check local part format
  if (!localPartPattern.test(localPart)) {
    return false;
  }
  
  // Validate domain using DNS lookup
  try {
    await dns.promises.resolve(domain);
    return true; // Domain has a valid DNS record
  } catch (err) {
    return false; // Domain doesn't exist or has no DNS record
  }
}


module.exports = { sendWelcomeEmail };
