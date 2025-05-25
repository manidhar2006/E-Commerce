const jwt = require('jsonwebtoken');
const User = require('../schemas/User'); // Assuming the User model exists

// Middleware to check if a user has an active session
module.exports.checkSession = (req, res, next) => {
  // Check if the session exists (assuming a session user object)
  if (!req.session.user) {
    return res.status(401).json({ message: 'No active session. Please log in.' });
  }

  // Proceed to the next middleware or route handler
  next();
};

// Middleware to verify JWT token
module.exports.verifyToken = (req, res, next) => {
  // Get token from Authorization header (Bearer token)
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    // Decode and verify the JWT token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Replace with your JWT secret
    req.user = decoded.user;  // Assuming user info is in the token

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if the user is logged in for login/signup routes
module.exports.checkLoginSession = (req, res, next) => {
  // Check if the user is already logged in through the session
  if (req.session.user) {
    return res.status(400).json({ message: 'User already logged in' });
  }

  // Proceed to the next middleware or route handler
  next();
};
