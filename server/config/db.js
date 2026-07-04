import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuslibrary';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

export default connectDatabase;
