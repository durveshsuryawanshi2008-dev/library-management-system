import collegeService from '../services/collegeService.js';
import userService from '../services/userService.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

function generateCollegeCode(name) {
  const base = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `${base}${randomPart}`;
}

export async function registerCollege(req, res) {
  try {
    const { name, address, city, state, pinCode, principalName, adminName, adminEmail, phone, studentCapacity, plan } = req.body;

    const existingCollege = await collegeService.getAllColleges({ adminEmail });
    if (existingCollege.length > 0) {
      return res.status(409).json({ message: 'A college with this admin email already exists' });
    }

    const collegeCode = generateCollegeCode(name);
    const college = await collegeService.createCollege({
      name,
      address,
      city,
      state,
      pinCode,
      principalName,
      adminName,
      adminEmail,
      phone,
      studentCapacity: parseInt(studentCapacity, 10) || 100,
      plan: plan || 'Starter',
      code: collegeCode,
      status: 'pending',
    });

    const adminPassword = `${collegeCode.toLowerCase()}@admin`;
    const adminUser = await userService.createUser({
      collegeId: college._id,
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'college_admin',
      collegeCode,
      status: 'active'
    });

    res.status(201).json({
      message: 'College registration submitted successfully',
      college: {
        id: college._id,
        name: college.name,
        code: college.code,
        status: college.status,
      },
      adminCredentials: {
        email: adminUser.email,
        password: adminPassword,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'College registration failed', error: error.message });
  }
}

export async function approveCollege(req, res) {
  try {
    const { collegeId } = req.params;
    const college = await collegeService.approveCollege(collegeId);
    res.json({ message: 'College approved successfully', college });
  } catch (error) {
    res.status(500).json({ message: 'College approval failed', error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password, role, collegeCode, prn } = req.body;

    let user = null;

    if (email) {
      user = await userService.getUserByEmail(email);
    } else if (prn && collegeCode) {
      user = await userService.getStudentUser(collegeCode, prn);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (role === 'admin' && user.role !== 'college_admin' && user.role !== 'super_admin' && user.role !== 'librarian') {
      return res.status(403).json({ message: 'Admin access denied' });
    }

    if (role === 'student' && user.role !== 'student') {
      return res.status(403).json({ message: 'Student access denied' });
    }

    if (user.role !== 'super_admin' && user.collegeId) {
      const college = await collegeService.getCollegeById(user.collegeId);
      if (!college) {
        return res.status(404).json({ message: 'Associated college not found' });
      }
      if (college.status !== 'approved') {
        return res.status(403).json({ 
          message: `Your college registration is currently ${college.status}. Access is restricted until approved by super admin.` 
        });
      }
    }

    const accessToken = signAccessToken({ userId: user._id, role: user.role, collegeId: user.collegeId });
    const refreshToken = signRefreshToken({ userId: user._id });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      accessToken,
      token: accessToken, // backward compatibility
      refreshToken,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        collegeCode: user.collegeCode,
        prn: user.prn,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

export async function refresh(req, res) {
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const split = c.split('=');
        return [split[0] || '', split[1] || ''];
      })
    );

    const refreshToken = cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await userService.getUserById(decoded.userId);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'User is unauthorized or suspended' });
    }

    const newAccessToken = signAccessToken({ userId: user._id, role: user.role, collegeId: user.collegeId });
    const newRefreshToken = signRefreshToken({ userId: user._id });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Token refreshed',
      accessToken: newAccessToken,
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token', error: error.message });
  }
}

export async function logout(req, res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logout successful' });
}

export default { registerCollege, approveCollege, login, refresh, logout };
