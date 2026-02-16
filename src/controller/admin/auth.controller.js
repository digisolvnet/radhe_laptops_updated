import { Admin } from "../../models/admin/admin.model.js";
import { AsyncHandler } from "../../utils/AyncHandler.js";
import { AlreadyExist, NotFoundError } from "../../utils/custumError.js";
import jwt from "jsonwebtoken";

/* =====================================================
   DEMO ADMIN (For Testing Only)
===================================================== */

const DEMO_ADMIN = {
  email: "demo@admin.com",
  password: "admin123",
  name: "Demo Admin",
  role: "admin",
};

/* =====================================================
   ADMIN REGISTER
===================================================== */

const adminRegister = AsyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    throw new AlreadyExist("Admin already exists", "adminRegister method");
  }

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
   ADMIN LOGIN (WITH DEMO SUPPORT)
===================================================== */

const adminLogin = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  /* ---------- 1️⃣ CHECK DATABASE ---------- */

  const admin = await Admin.findOne({ email });

  if (admin) {
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const token = admin.generateToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
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
  }

  /* ---------- 2️⃣ CHECK DEMO LOGIN ---------- */

  if (
    email === DEMO_ADMIN.email &&
    password === DEMO_ADMIN.password
  ) {
    const token = jwt.sign(
      { email: DEMO_ADMIN.email, role: DEMO_ADMIN.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Demo login successful",
      token,
      admin: DEMO_ADMIN,
    });
  }

  /* ---------- 3️⃣ IF NOTHING MATCHES ---------- */

  throw new NotFoundError("Invalid email or password", "adminLogin method");
});

export { adminRegister, adminLogin };
