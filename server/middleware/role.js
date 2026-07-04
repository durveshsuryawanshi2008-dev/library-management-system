export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Access denied. Required role(s): ${allowedRoles.join(', ')}` 
      });
    }
    
    next();
  };
}

export const isSuperAdmin = requireRole('super_admin');
export const isCollegeAdmin = requireRole('college_admin');
export const isLibrarian = requireRole('librarian');
export const isStudent = requireRole('student');

export default {
  requireRole,
  isSuperAdmin,
  isCollegeAdmin,
  isLibrarian,
  isStudent
};
