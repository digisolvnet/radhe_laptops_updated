import { Admin } from "../../models/admin/admin.model.js";
import { AsyncHandler } from "../../utils/AyncHandler.js";
import { AlreadyExist, NotFoundError } from "../../utils/custumError.js";

const adminRegister = AsyncHandler(async (req, res) => {
  const { name, email, password,role } = req.body;

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new AlreadyExist("Admin already exist", "existingAdmin method");
  }

  // Create new admin (Password will be hashed automatically)
  const newAdmin = await Admin.create({ name, email, password ,role});

  res.status(201).json({
    message: "Admin created successfully",
    newAdmin,
  });
});

const adminLogin = AsyncHandler(async (req, res) => {
  const { email, password,} = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin) {
    throw new NotFoundError(
      "admin with this email not found",
      "adminLogin method"
    );
  }

  // Check if the password matches
  const isPasswordValid = await admin.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Password is wrong" });
  }

  // Generate JWT Token
  const token = admin.generateToken();
  console.log(token)

  // Store token in HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.status(200).json({
    message: "Login successful",
    admin,
    token,
  });
});

export { adminRegister, adminLogin };
