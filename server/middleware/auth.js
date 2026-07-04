import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

// 1. authenticateJWT (Legacy alias: authenticate)
export async function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'User is not authorized or active' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// 2. authorizeRole (Legacy alias: authorize)
export function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient role privileges' });
    }
    next();
  };
}

// 3. authorizeCollege
export function authorizeCollege(req, res, next) {
  // Super admin can access data across all colleges
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }

  const requestedCollegeId = req.params.collegeId || req.body.collegeId || req.query.collegeId;

  // Verify that if a specific collegeId is targeted, it matches the user's collegeId
  if (requestedCollegeId && req.user.collegeId && req.user.collegeId.toString() !== requestedCollegeId.toString()) {
    return res.status(403).json({ 
      message: 'Access denied: You are not authorized to view or modify another college\'s data' 
    });
  }

  next();
}

// Maintain backward compatibility with existing route imports
export const authenticate = authenticateJWT;
export const authorize = authorizeRole;

export default {
  authenticateJWT,
  authorizeRole,
  authorizeCollege,
  authenticate,
  authorize
};
