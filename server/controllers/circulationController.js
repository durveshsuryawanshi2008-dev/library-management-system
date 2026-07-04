import Book from '../models/Book.js';
import BorrowRecord from '../models/BorrowRecord.js';
import Reservation from '../models/Reservation.js';
import Student from '../models/Student.js';

// 1. Issue Books (Student Request)
export async function requestIssue(req, res) {
  try {
    const { bookId, prn, studentName } = req.body;
    
    // Check book availability
    const book = await Book.findOne({ _id: bookId, collegeId: req.user.collegeId });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.copies - book.reservedCount <= 0) {
      return res.status(400).json({ message: 'No copies available. All stock is reserved or issued.' });
    }

    // Default due date: 14 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const record = await BorrowRecord.create({
      collegeId: req.user.collegeId,
      bookId,
      bookTitle: book.title,
      bookCode: book.isbn || 'GEN-ISBN',
      studentPrn: prn,
      studentName: studentName || 'Student Member',
      dueDate,
      status: 'pending'
    });

    res.status(201).json({ message: 'Issue request submitted successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Issue request failed', error: error.message });
  }
}

// 2. Approve Issue (Librarian Action)
export async function approveIssue(req, res) {
  try {
    const { recordId } = req.params;
    
    const record = await BorrowRecord.findOne({ _id: recordId, collegeId: req.user.collegeId });
    if (!record) return res.status(404).json({ message: 'Borrow record not found' });
    if (record.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be accepted' });
    }

    // Check stock check-out
    const book = await Book.findOne({ _id: record.bookId, collegeId: req.user.collegeId });
    if (!book || book.copies <= 0) {
      return res.status(400).json({ message: 'Book is out of stock' });
    }

    book.copies -= 1;
    await book.save();

    record.status = 'accepted';
    record.issueDate = new Date();
    await record.save();

    res.json({ message: 'Book issued successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Approval failed', error: error.message });
  }
}

// 3. Reject Issue (Librarian Action)
export async function rejectIssue(req, res) {
  try {
    const { recordId } = req.params;
    
    const record = await BorrowRecord.findOneAndUpdate(
      { _id: recordId, collegeId: req.user.collegeId, status: 'pending' },
      { status: 'rejected' },
      { new: true }
    );

    if (!record) return res.status(404).json({ message: 'Pending borrow record not found' });
    res.json({ message: 'Issue request rejected', record });
  } catch (error) {
    res.status(500).json({ message: 'Rejection failed', error: error.message });
  }
}

// 4. Request Return (Student Action)
export async function requestReturn(req, res) {
  try {
    const { recordId } = req.params;
    
    const record = await BorrowRecord.findOneAndUpdate(
      { _id: recordId, collegeId: req.user.collegeId, status: 'accepted' },
      { status: 'return_pending' },
      { new: true }
    );

    if (!record) return res.status(404).json({ message: 'Active borrow record not found' });
    res.json({ message: 'Return request submitted', record });
  } catch (error) {
    res.status(500).json({ message: 'Return request failed', error: error.message });
  }
}

// 5. Approve Return & Calculate Fine (Librarian Action)
export async function approveReturn(req, res) {
  try {
    const { recordId } = req.params;
    
    const record = await BorrowRecord.findOne({ _id: recordId, collegeId: req.user.collegeId });
    if (!record) return res.status(404).json({ message: 'Borrow record not found' });
    if (record.status !== 'return_pending' && record.status !== 'accepted') {
      return res.status(400).json({ message: 'Book is not pending return' });
    }

    const today = new Date();
    const dueDate = new Date(record.dueDate);
    let fineAmount = 0;

    // Overdue Fine: ₹10 per day
    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 10;
    }

    const book = await Book.findOne({ _id: record.bookId, collegeId: req.user.collegeId });
    if (book) {
      book.copies += 1;
      await book.save();
    }

    record.status = 'returned';
    record.returnDate = today;
    record.fineAmount = fineAmount;
    await record.save();

    res.json({ message: 'Return approved successfully', fineAmount, record });
  } catch (error) {
    res.status(500).json({ message: 'Return approval failed', error: error.message });
  }
}

// 6. Create Reservation (Student Action)
export async function createReservation(req, res) {
  try {
    const { bookId, prn, studentName } = req.body;

    const book = await Book.findOne({ _id: bookId, collegeId: req.user.collegeId });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const reservation = await Reservation.create({
      collegeId: req.user.collegeId,
      bookId,
      bookTitle: book.title,
      studentPrn: prn,
      studentName: studentName || 'Student Member',
      status: 'active'
    });

    book.reservedCount += 1;
    await book.save();

    res.status(201).json({ message: 'Book reserved successfully', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Reservation failed', error: error.message });
  }
}

// 7. Cancel Reservation (Student Action)
export async function cancelReservation(req, res) {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findOne({ _id: reservationId, collegeId: req.user.collegeId, status: 'active' });
    if (!reservation) return res.status(404).json({ message: 'Active reservation not found' });

    reservation.status = 'cancelled';
    await reservation.save();

    const book = await Book.findOne({ _id: reservation.bookId, collegeId: req.user.collegeId });
    if (book && book.reservedCount > 0) {
      book.reservedCount -= 1;
      await book.save();
    }

    res.json({ message: 'Reservation cancelled', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Cancellation failed', error: error.message });
  }
}

// 8. List User Records (Student History)
export async function listUserRecords(req, res) {
  try {
    const { prn } = req.params;
    const records = await BorrowRecord.find({ studentPrn: prn, collegeId: req.user.collegeId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user history', error: error.message });
  }
}

// 9. List All Records (Librarian Registry)
export async function listAllRecords(req, res) {
  try {
    const records = await BorrowRecord.find({ collegeId: req.user.collegeId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch circulation records', error: error.message });
  }
}

// 10. Reports Aggregator
export async function getReports(req, res) {
  try {
    const totalCirculations = await BorrowRecord.countDocuments({ collegeId: req.user.collegeId });
    const pendingIssues = await BorrowRecord.countDocuments({ collegeId: req.user.collegeId, status: 'pending' });
    const activeIssues = await BorrowRecord.countDocuments({ collegeId: req.user.collegeId, status: 'accepted' });
    const totalReturns = await BorrowRecord.countDocuments({ collegeId: req.user.collegeId, status: 'returned' });
    
    // Accrued fine calculation
    const fines = await BorrowRecord.aggregate([
      { $match: { collegeId: req.user.collegeId } },
      { $group: { _id: null, total: { $sum: '$fineAmount' } } }
    ]);
    const totalFines = fines.length > 0 ? fines[0].total : 0;

    res.json({
      metrics: {
        totalCirculations,
        pendingIssues,
        activeIssues,
        totalReturns,
        totalFines
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report summaries', error: error.message });
  }
}

export default {
  requestIssue,
  approveIssue,
  rejectIssue,
  requestReturn,
  approveReturn,
  createReservation,
  cancelReservation,
  listUserRecords,
  listAllRecords,
  getReports
};
