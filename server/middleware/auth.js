import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'User is not authorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

export default { authenticate, authorize };
