import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config(); 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Radhe Laptops" <${process.env.EMAIL_USER}>`, // Use EMAIL_USER instead of EMAIL_FROM
      to,
      subject,
      html,
    });
    console.log("Email sent successfully!");
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

export { sendEmail };
