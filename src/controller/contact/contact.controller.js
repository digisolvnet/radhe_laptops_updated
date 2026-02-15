import {Contact}  from "../../models/Contactus/contact.model.js";

const ContactUs = async (req, res) => {
  const { name, email, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Create a new contact entry
    const newContact = new Contact({
      name,
      email,
      message,
    });

    // Save to the database
    await newContact.save();

    // Respond with success
    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error saving contact form data:", error);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
};

const GetContactDetails = async (req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 }); // Sort by latest first
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    res.status(500).json({ message: "Failed to fetch submissions." });
  }
};

export { ContactUs , GetContactDetails };
