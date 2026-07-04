import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    bookTitle: { type: String, required: true },
    studentPrn: { type: String, required: true },
    studentName: { type: String, required: true },
    reservationDate: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'cancelled'],
      default: 'active'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Reservation', reservationSchema);
