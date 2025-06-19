const express = require('express');
const { comparePassword, generateToken, hashPassword, createRateLimit, authMiddleware } = require('../config/security');
const User = require('../models/User');
const cache = require('../config/cache');
const winston = require('winston');

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/auth.log' }),
    new winston.transports.Console()
  ]
});

const authLimiter = createRateLimit(
  15 * 60 * 1000,
  5,
  'Too many authentication attempts from this IP'
);

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn('Login attempt with missing credentials', { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username: email }
      ]
    });

    if (!user) {
      logger.warn('Login attempt with non-existent user', { 
        email,
        ip: req.ip 
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.isLocked) {
      logger.warn('Login attempt on locked account', { 
        userId: user._id,
        email: user.email,
        ip: req.ip 
      });
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    if (!user.isActive) {
      logger.warn('Login attempt on inactive account', { 
        userId: user._id,
        email: user.email,
        ip: req.ip 
      });
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      await user.incrementFailedAttempts();
      logger.warn('Failed login attempt', { 
        userId: user._id,
        email: user.email,
        failedAttempts: user.failedLoginAttempts + 1,
        ip: req.ip 
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    await user.resetFailedAttempts();

    const token = generateToken({
      userId: user._id,
      email: user.email,
      username: user.username
    });

    await cache.set(`auth_${user._id}`, { token, userId: user._id }, 3600);

    logger.info('Successful login', { 
      userId: user._id,
      email: user.email,
      ip: req.ip 
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }
    });

  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await cache.del(`auth_${req.user.userId}`);
    
    logger.info('User logout', { 
      userId: req.user.userId,
      ip: req.ip 
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const cacheKey = `auth_${req.user.userId}`;
    const cachedAuth = await cache.get(cacheKey);

    if (!cachedAuth) {
      return res.status(401).json({
        success: false,
        message: 'Token not found in cache'
      });
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    
    if (!user || !user.isActive) {
      await cache.del(cacheKey);
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }
    });

  } catch (error) {
    logger.error('Token verification error', { error: error.message });
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      logger.warn('Registration attempt with existing credentials', { 
        email,
        username,
        ip: req.ip 
      });
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    const passwordHash = await hashPassword(password);

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      passwordHash
    });

    await newUser.save();

    logger.info('New user registered', { 
      userId: newUser._id,
      email: newUser.email,
      username: newUser.username,
      ip: req.ip 
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email
        }
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    logger.error('Registration error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;