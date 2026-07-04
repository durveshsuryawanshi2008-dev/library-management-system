import collegeService from '../services/collegeService.js';
import userService from '../services/userService.js';
import { signToken } from '../utils/jwt.js';

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

    // Support email-based login OR prn/collegeCode student login
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

    // Role-based verification
    if (role === 'admin' && user.role !== 'college_admin' && user.role !== 'super_admin' && user.role !== 'librarian') {
      return res.status(403).json({ message: 'Admin access denied' });
    }

    if (role === 'student' && user.role !== 'student') {
      return res.status(403).json({ message: 'Student access denied' });
    }

    // Check college approval status (except for platform-level super_admin)
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

    const token = signToken({ userId: user._id, role: user.role, collegeId: user.collegeId });

    res.json({
      message: 'Login successful',
      token,
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

export default { registerCollege, approveCollege, login };
