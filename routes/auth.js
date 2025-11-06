const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const storage = require('../storage');

// Check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
};

// Registration endpoint
router.post('/register', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { full_name, email, username, password } = req.body;

    if (isMongoConnected()) {
      // Use MongoDB
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email already registered' 
          });
        }
        if (existingUser.username === username) {
          return res.status(400).json({ 
            success: false, 
            message: 'Username already taken' 
          });
        }
      }

      const newUser = new User({
        full_name,
        email,
        username,
        password
      });

      await newUser.save();

      req.session.userId = newUser._id;
      req.session.username = newUser.username;

      res.status(201).json({ 
        success: true, 
        message: 'Registration successful!',
        user: {
          id: newUser._id,
          username: newUser.username,
          full_name: newUser.full_name,
          email: newUser.email
        }
      });
    } else {
      // Use in-memory storage
      const existingEmail = await storage.findUserByEmail(email);
      const existingUsername = await storage.findUserByUsername(username);

      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already registered' 
        });
      }
      if (existingUsername) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already taken' 
        });
      }

      const newUser = await storage.createUser({
        full_name,
        email,
        username,
        password
      });

      req.session.userId = newUser._id;
      req.session.username = newUser.username;

      res.status(201).json({ 
        success: true, 
        message: 'Registration successful!',
        user: {
          id: newUser._id,
          username: newUser.username,
          full_name: newUser.full_name,
          email: newUser.email
        }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

// Login endpoint
router.post('/login', [
  body('username_or_email').trim().notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username_or_email, password } = req.body;

    let user;
    
    if (isMongoConnected()) {
      // Use MongoDB
      user = await User.findOne({
        $or: [
          { username: username_or_email },
          { email: username_or_email }
        ]
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid username/email or password' 
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid username/email or password' 
        });
      }
    } else {
      // Use in-memory storage
      user = await storage.findUserByEmailOrUsername(username_or_email);

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid username/email or password' 
        });
      }

      const isPasswordValid = await storage.comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid username/email or password' 
        });
      }
    }

    // Create session
    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({ 
      success: true, 
      message: 'Login successful!',
      user: {
        id: user._id,
        username: user.username,
        full_name: user.full_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: error.message 
    });
  }
});

// Demo login endpoint - creates/uses a demo account
router.post('/demo-login', async (req, res) => {
  try {
    const demoEmail = 'demo@musicstream.com';
    const demoUsername = 'demouser';
    
    let demoUser;
    
    if (isMongoConnected()) {
      // Use MongoDB
      demoUser = await User.findOne({ email: demoEmail });
      
      if (!demoUser) {
        demoUser = new User({
          full_name: 'Demo User',
          email: demoEmail,
          username: demoUsername,
          password: 'demo123456'
        });
        await demoUser.save();
      }
    } else {
      // Use in-memory storage
      demoUser = await storage.findUserByEmail(demoEmail);
      
      if (!demoUser) {
        demoUser = await storage.createUser({
          full_name: 'Demo User',
          email: demoEmail,
          username: demoUsername,
          password: 'demo123456'
        });
      }
    }
    
    // Create session
    req.session.userId = demoUser._id;
    req.session.username = demoUser.username;

    res.json({ 
      success: true, 
      message: 'Demo login successful!',
      user: {
        id: demoUser._id,
        username: demoUser.username,
        full_name: demoUser.full_name,
        email: demoUser.email
      }
    });

  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during demo login',
      error: error.message 
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error logging out' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

// Check authentication status
router.get('/check', isAuthenticated, async (req, res) => {
  try {
    let user;
    
    if (isMongoConnected()) {
      user = await User.findById(req.session.userId).select('-password');
    } else {
      user = await storage.findUserById(req.session.userId);
      if (user) {
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        user = userWithoutPassword;
      }
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        authenticated: false,
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      authenticated: true,
      user: {
        id: user._id,
        username: user.username,
        full_name: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error checking authentication' 
    });
  }
});

module.exports = router;
