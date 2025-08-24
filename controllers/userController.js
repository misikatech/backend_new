
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const { generateToken, generateRefreshToken } = require('../utils/jwt');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const pendingUsers = new Map();

const sendOtpAndCheckEmail = async (req, res) => {
  try {
    const { name, mobile_number, email, city, password } = req.body;

    if (!name || !mobile_number || !email || !city || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is already registered
    const userExists = await pool.query("SELECT * FROM userquery WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // Store OTP in database
    await pool.query(
      `INSERT INTO otp_verifications (email, otp, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE
       SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [email, otp, expiresAt]
    );

    // Store user details in temporary storage
    pendingUsers.set(email, { name, mobile_number, city, password });

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification OTP",
      text: `Your OTP for signup verification is: ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Verify OTP & Register User
const verifyOtpAndSignup = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Fetch OTP details
    const otpRecord = await pool.query("SELECT * FROM otp_verifications WHERE email = $1 AND otp = $2", [email, otp]);

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const { expires_at } = otpRecord.rows[0];

    // Check if OTP is expired
    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    // Get user details from temporary storage
    const userDetails = pendingUsers.get(email);
    if (!userDetails) {
      return res.status(400).json({ message: "User details not found. Request a new OTP." });
    }

    const { name, mobile_number, city, password } = userDetails;

    // Delete OTP after verification
    await pool.query("DELETE FROM otp_verifications WHERE email = $1", [email]);
    pendingUsers.delete(email);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO userquery (name, mobile_number, email, city, password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, name, mobile_number, email, city`,
      [name, mobile_number, email, city, hashedPassword]
    );

    res.status(201).json({ message: "Signup successful!", user: result.rows[0] });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        timestamp: new Date().toISOString()
      });
    }

    // Check if user exists
    const result = await pool.query("SELECT * FROM userquery WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        timestamp: new Date().toISOString()
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        timestamp: new Date().toISOString()
      });
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          mobile_number: user.mobile_number,
          email: user.email,
          city: user.city
        },
        accessToken,
        refreshToken
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get User by Email
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await pool.query("SELECT id, name, mobile_number, email, city FROM userquery WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot Password - Send OTP
const forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const userExists = await pool.query("SELECT * FROM userquery WHERE email = $1", [email]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // Store OTP in database
    await pool.query(
      `INSERT INTO otp_verifications (email, otp, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE
       SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [email, otp, expiresAt]
    );

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reset Password - Verify OTP & Update Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    // Fetch OTP details
    const otpRecord = await pool.query("SELECT * FROM otp_verifications WHERE email = $1 AND otp = $2", [email, otp]);

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const { expires_at } = otpRecord.rows[0];

    // Check if OTP is expired
    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await pool.query("UPDATE userquery SET password = $1 WHERE email = $2", [hashedPassword, email]);

    // Delete OTP after successful password reset
    await pool.query("DELETE FROM otp_verifications WHERE email = $1", [email]);

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  sendOtpAndCheckEmail,
  verifyOtpAndSignup,
  loginUser,
  getUserByEmail,
  forgotPasswordRequest,
  resetPassword
};
