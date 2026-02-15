import multer from "multer";
import path from "path";
import fs from "fs";

// Define the upload directory path
const uploadDir = path.join(process.cwd(), "src", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if not exists
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Store files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// Define allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG & PNG are allowed."), false);
  }
};

// Multer middleware
const upload = multer({ storage, fileFilter });

export const uploadMiddleware = upload.single("image"); // Ensure this matches your frontend file input name
