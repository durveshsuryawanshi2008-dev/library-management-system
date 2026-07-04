import College from '../models/College.js';

export async function createCollege(data) {
  return College.create(data);
}

export async function getCollegeById(id) {
  return College.findById(id);
}

export async function getCollegeByCode(code) {
  return College.findOne({ code });
}

export async function approveCollege(id) {
  const college = await College.findById(id);
  if (!college) {
    throw new Error('College not found');
  }
  college.status = 'approved';
  await college.save();
  return college;
}

export async function getAllColleges(filters = {}) {
  return College.find(filters).sort({ createdAt: -1 });
}

export default {
  createCollege,
  getCollegeById,
  getCollegeByCode,
  approveCollege,
  getAllColleges
};
