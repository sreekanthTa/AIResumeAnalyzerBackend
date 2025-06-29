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

        // Set tokens in cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 3600 * 1000 // 1 hour
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 3600 * 1000 // 7 days
        });

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Refresh Token Method
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      // Validate the refresh token (implementation depends on your token strategy)
      const newAccessToken = await authService.generateAccessToken(refreshToken);

      if (!newAccessToken) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
    }
  }
}

export default new AuthController();