import { Admin } from "../../models/admin/admin.model.js";
import { AsyncHandler } from "../../utils/AyncHandler.js";
import { AlreadyExist, NotFoundError } from "../../utils/custumError.js";

/* =====================================================
   ADMIN REGISTER
===================================================== */

const adminRegister = AsyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    throw new AlreadyExist("Admin already exists", "adminRegister method");
  }

  // Create new admin (password auto-hashed by pre('save'))
  const newAdmin = await Admin.create({
    name,
    email,
    password,
    role: role || "admin",
  });

  res.status(201).json({
    status: "success",
    message: "Admin created successfully",
    admin: {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
    },
  });
});

/* =====================================================
   ADMIN LOGIN
===================================================== */

const adminLogin = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if admin exists
  const admin = await Admin.findOne({ email });

  if (!admin) {
    throw new NotFoundError(
      "Invalid email or password",
      "adminLogin method"
    );
  }

  // Compare password
  const isPasswordValid = await admin.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  // Generate JWT token
  const token = admin.generateToken();

  // Set token in HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.status(200).json({
    status: "success",
    message: "Login successful",
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

/* =====================================================
   EXPORTS
===================================================== */

export { adminRegister, adminLogin };
