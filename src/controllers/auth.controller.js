import authService from '../service/auth.service.js';

class AuthController {
  // Signup Method
  async signup(req, res) {
    try {
      const { name, email, password } = req.body;
      console.log('Signup request received:', { name, email,password });

      await authService.signup(name, email, password);

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Sign-In Method
  async signin(req, res) {
    try {
        const { email, password } = req.body;
        console.log('Signin request received:', { email, password });

        const { accessToken, refreshToken } = await authService.signin(email, password);

        // Set refresh token in cookies
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: 'false',// true for https, false for http (local development)
            // secure: process.env.NODE_ENV === 'production', // Use true in production
            sameSite: 'strict', // Adjust based on your CORS policy
            path: '/api/auth/refresh-token',
            maxAge: 7 * 24 * 3600 * 1000 // 7 days
        });

        // Send access token in JSON response
        res.status(200).json({ message: 'Login successful', accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  }

  // Refresh Token Method
  async refreshToken(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        // Validate the refresh token and generate a new access token
        const newAccessToken = await authService.generateAccessToken(refreshToken);

        if (!newAccessToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
  }

  // Logout Method
  async logout(req, res) {
    try {
        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
  }
}

export default new AuthController();