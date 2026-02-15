import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  brandName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
  },
  shortDescription: {
    type: [String], // Array of strings for bullet points
    default: []
  },
  longDescription: {
    type: String,
  },
  image: {
    type: String,
  },
});

export const Product = mongoose.model("Product", productSchema);