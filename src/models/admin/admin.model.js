import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const adminSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type:String
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

// 🔹 Middleware: Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Method: Generate JWT Token
adminSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, email: this.email ,role: this.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// 🔹 Method: Compare Password
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Admin = mongoose.model('Admin', adminSchema);
