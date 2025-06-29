import express from 'express';
import authController from '../controllers/auth.controller.js';
const router = express.Router();

// Signup Route
router.post('/signup', authController.signup);

// Sign-In Route
router.post('/signin', authController.signin);

// Refresh Token Route
router.post('/refresh-token', authController.refreshToken);

// Logout Route
router.post('/logout', authController.logout);

export default router;