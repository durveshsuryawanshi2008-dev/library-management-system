import Student from '../models/Student.js';
import User from '../models/User.js';

export async function listStudents(req, res) {
  try {
    const students = await Student.find({ collegeId: req.user.collegeId }).populate('userId', 'email role');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch students', error: error.message });
  }
}

export async function createStudent(req, res) {
  try {
    const { name, prn, department, year, email, phone } = req.body;
    const password = `${prn}@student`;
    const user = await User.create({
      collegeId: req.user.collegeId,
      name,
      email,
      password,
      role: 'student',
      collegeCode: req.user.collegeCode || req.user.collegeId.toString(),
      prn,
    });

    const student = await Student.create({
      collegeId: req.user.collegeId,
      userId: user._id,
      name,
      prn,
      department,
      year,
      email,
      phone,
    });

    res.status(201).json({ student, temporaryPassword: password });
  } catch (error) {
    res.status(500).json({ message: 'Unable to create student', error: error.message });
  }
}

export default { listStudents, createStudent };
