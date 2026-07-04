import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    department: { type: String, trim: true, default: 'General' },
    isbn: { type: String, trim: true },
    copies: { type: Number, required: true, default: 1 },
    description: { type: String, default: '' },
    status: { type: String, enum: ['available', 'low_stock', 'out_of_stock'], default: 'available' },
  },
  { timestamps: true }
);

export default mongoose.model('Book', bookSchema);
