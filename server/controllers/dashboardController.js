import College from '../models/College.js';
import Book from '../models/Book.js';
import Student from '../models/Student.js';

export async function getDashboard(req, res) {
  try {
    const college = await College.findById(req.user.collegeId);
    const books = await Book.find({ collegeId: req.user.collegeId });
    const students = await Student.find({ collegeId: req.user.collegeId });

    res.json({
      college: {
        name: college?.name,
        code: college?.code,
        status: college?.status,
        plan: college?.plan,
      },
      stats: {
        books: books.length,
        students: students.length,
        availableBooks: books.filter((book) => book.status === 'available').length,
        lowStockBooks: books.filter((book) => book.status === 'low_stock').length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load dashboard', error: error.message });
  }
}

export default { getDashboard };
