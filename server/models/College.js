import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    principalName: { type: String, required: true, trim: true },
    adminName: { type: String, required: true, trim: true },
    adminEmail: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: { type: String, required: true, trim: true },
    studentCapacity: { type: Number, required: true },
    plan: { type: String, enum: ['Starter', 'Standard', 'Professional', 'Enterprise'], default: 'Starter' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
    code: { type: String, unique: true, required: true },
    logoUrl: { type: String, default: '' },
    aiEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('College', collegeSchema);
