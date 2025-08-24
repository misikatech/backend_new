


const express = require("express");
const { sendOtpAndCheckEmail, verifyOtpAndSignup, loginUser, getUserByEmail, forgotPasswordRequest, resetPassword } = require("../controllers/userController");

const uresRouter = express.Router();

// Send OTP (If Email is New)
uresRouter.post("/send-otp", sendOtpAndCheckEmail);

// Verify OTP & Signup User
uresRouter.post("/verify-otp", verifyOtpAndSignup);

uresRouter.post("/forgot-password", forgotPasswordRequest); // Step 1: Request OTP
uresRouter.post("/reset-password", resetPassword); // Step 2: Verify OTP & Reset Password

// Login User
uresRouter.post("/login", loginUser);

// Get User by Email
uresRouter.get("/email/:email", getUserByEmail);

module.exports = uresRouter;
