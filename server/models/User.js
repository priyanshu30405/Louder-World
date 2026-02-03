import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: String,
  name: String
}, { timestamps: true });

export default mongoose.model('User', userSchema);
