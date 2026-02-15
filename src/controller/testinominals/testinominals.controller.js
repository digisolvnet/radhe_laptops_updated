import { Testimonial } from "../../models/testinominals/testinominals.model.js";

// GET all testimonials
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// POST new testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { text, name, company, stars } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required!" });
    }

    // Construct image URL
    const imageUrl = `${process.env.IMG_BASE_URL}/images/${req.file.filename}`;

    const testimonial = new Testimonial({
      text,
      name,
      company,
      image: imageUrl,
      stars,
    });
    await testimonial.save();

    res.status(201).json(testimonial);
  } catch (error) {
    res.status(400).json({ message: "Invalid Data" });
  }
};

// DELETE testimonial by ID
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: "Not found" });

    await testimonial.remove();
    res.json({ message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting testimonial" });
  }
};

// PUT (Edit) testimonial by ID
export const updateTestimonial = async (req, res) => {
  try {
    const { text, name, company, stars } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });

    // Update fields
    testimonial.text = text || testimonial.text;
    testimonial.name = name || testimonial.name;
    testimonial.company = company || testimonial.company;
    testimonial.stars = stars || testimonial.stars;

    // Update image if a new one is uploaded
    if (req.file) {
      const imageUrl = `${process.env.IMG_BASE_URL}/images/${req.file.filename}`;
      testimonial.image = imageUrl;
    }

    await testimonial.save();
    res.json(testimonial);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ message: "Error updating testimonial" });
  }
};
