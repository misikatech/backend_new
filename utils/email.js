const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@misika.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Misika!',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining Misika. We're excited to have you on board!</p>
    `,
  }),
  
  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
  }),
  
  orderConfirmation: (name, orderId, total) => ({
    subject: 'Order Confirmation',
    html: `
      <h1>Order Confirmed!</h1>
      <p>Hi ${name},</p>
      <p>Your order #${orderId} has been confirmed.</p>
      <p>Total: ₹${total}</p>
      <p>Thank you for shopping with Misika!</p>
    `,
  }),
};

module.exports = {
  sendEmail,
  emailTemplates,
};
