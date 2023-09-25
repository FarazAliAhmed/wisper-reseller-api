const nodemailer = require("nodemailer");

// Create a Nodemailer transporter with the SMTP configuration
const transporter = nodemailer.createTransport({
  host: "wisper.ng",
  port: 465,
  secure: true,
  auth: {
    user: "support@wisper.ng",
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Define the helper function to send an email
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: "support@wisper.ng",
    to: to,
    subject: subject,
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

module.exports = { sendEmail };
