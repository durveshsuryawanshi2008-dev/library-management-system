import mongoose from 'mongoose';

const borrowRecordSchema = new mongoose.Schema(
  {
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    bookTitle: { type: String, required: true },
    bookCode: { type: String, required: true },
    studentPrn: { type: String, required: true },
    studentName: { type: String, required: true },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    fineAmount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'return_pending', 'returned'], 
      default: 'pending' 
    }
  },
  { timestamps: true }
);

export default mongoose.model('BorrowRecord', borrowRecordSchema);
