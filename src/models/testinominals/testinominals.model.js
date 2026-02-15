import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  stars: {
    type: Number,
    default: 5,
  },
  text: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
