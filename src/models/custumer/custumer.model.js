import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const custumerSchema = mongoose.Schema({
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
  address: {
    type: String,
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to the Product model
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  whitelist: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to the Product model
      },
      addedAt: {
        type: Date,
        default: Date.now, // Track when the product was added to the whitelist
      },
    },
  ],
  orderHistory: [
    {
      items: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: Number,
          price: Number, // Store the price at the time of purchase
        },
      ],
      totalPrice: Number,
      shippingCost: Number,
      country: String,
      paymentDetails: {
        paymentId: String,
        orderId: String,
        signature: String,
        amount: Number,
        currency: String,
        status: String,
        paymentDate: {
          type: Date,
          default: Date.now,
        },
      },
      status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
      },
      changedAt: {
        type: Date,
        default: Date.now,
      },

      note: String,
      orderDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});
// 🔹 Middleware: Hash password before saving
custumerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Prevents double hashing

  console.log("Hashing password before saving...");
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log("Final Hashed Password Before Save:", this.password);

  next();
});

// 🔹 Method: Generate JWT Token
custumerSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Function to compare the password
custumerSchema.methods.isPasswordCorrect = async function (password) {
  if (!password || typeof password !== "string") {
    throw new Error("Invalid password provided for comparison.");
  }
  return await bcrypt.compare(password, this.password);
};

// 🔹 Method: Add item to cart
custumerSchema.methods.addToCart = function (productId, quantity = 1) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const cartItem = this.cart.find((item) => {
    if (!item.product || !productId) return false;
    return item.product.toString() === productId.toString();
  });

  if (cartItem) {
    cartItem.quantity += quantity; // Update quantity if item already exists
  } else {
    this.cart.push({ product: productId, quantity }); // Add new item to cart
  }

  return this.save();
};

// 🔹 Method: Clear cart
custumerSchema.methods.clearCart = function () {
  this.cart = [];
  return this.save();
};

export const Custumer = mongoose.model("Custumer", custumerSchema);
