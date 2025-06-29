import UserModel from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
  async signup(name, email, password) {
    // Check if user already exists
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      throw new Error('UserModel already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    await UserModel.createUser(name, email, hashedPassword);
  }

  async signin(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('Signin request received with email:', email);

      // Find the user
      const user = await UserModel.findUserByEmail(email);
      console.log('User found:', user);
      if (!user) {
        throw new Error('User not found');
      }

      // Check the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      console.log('Password is valid for user:', isPasswordValid);

      // Generate tokens
      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      console.log('Generated tokens:', { accessToken, refreshToken });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error during signin:', error);
      throw new Error('Signin failed');
    }
  }

  // Generate Access Token Method
  async generateAccessToken(refreshToken) {
    try {
      // Validate the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      if (!decoded) {
        return null;
      }

      // Generate a new access token
      const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return newAccessToken;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return null;
    }
  }
}

export default new AuthService();