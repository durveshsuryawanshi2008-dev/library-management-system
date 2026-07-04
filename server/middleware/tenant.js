import College from '../models/College.js';

export async function tenantHandler(req, res, next) {
  try {
    // 1. If already authenticated via JWT, use the collegeId associated with the user
    if (req.user && req.user.collegeId) {
      req.tenantId = req.user.collegeId;
      req.tenantCode = req.user.collegeCode;
      return next();
    }

    // 2. Otherwise, check request headers (X-College-Code) or query params
    const collegeCode = req.headers['x-college-code'] || req.query.collegeCode;
    
    if (collegeCode) {
      const college = await College.findOne({ code: collegeCode });
      if (college) {
        req.tenantId = college._id;
        req.tenantCode = college.code;
        req.tenantStatus = college.status;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Tenant resolution error', error: error.message });
  }
}

// Utility to enforce tenant context on dynamic queries
export function scopeQuery(req, queryObj = {}) {
  if (req.tenantId) {
    queryObj.collegeId = req.tenantId;
  }
  return queryObj;
}

export default { tenantHandler, scopeQuery };
