import Book from '../models/Book.js';

export async function listBooks(req, res) {
  try {
    const books = await Book.find({ collegeId: req.user.collegeId }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch books', error: error.message });
  }
}

export async function createBook(req, res) {
  try {
    const book = await Book.create({ ...req.body, collegeId: req.user.collegeId });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create book', error: error.message });
  }
}

export async function updateBook(req, res) {
  try {
    const book = await Book.findOneAndUpdate({ _id: req.params.bookId, collegeId: req.user.collegeId }, req.body, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update book', error: error.message });
  }
}

export async function deleteBook(req, res) {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.bookId, collegeId: req.user.collegeId });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete book', error: error.message });
  }
}

export default { listBooks, createBook, updateBook, deleteBook };
