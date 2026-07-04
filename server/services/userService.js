import User from '../models/User.js';

export async function createUser(data) {
  return User.create(data);
}

export async function getUserById(id) {
  return User.findById(id).select('-password');
}

export async function getUserByEmail(email) {
  // We explicitly select +password here because comparePassword needs it during login
  return User.findOne({ email });
}

export async function getStudentUser(collegeCode, prn) {
  return User.findOne({ collegeCode, prn });
}

export async function countUsersInCollege(collegeId, role) {
  const filter = { collegeId };
  if (role) {
    filter.role = role;
  }
  return User.countDocuments(filter);
}

export default {
  createUser,
  getUserById,
  getUserByEmail,
  getStudentUser,
  countUsersInCollege
};
