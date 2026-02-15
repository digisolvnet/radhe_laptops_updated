import { Product } from "../../models/product/product.js";

// Controller for adding a product
const addProduct = async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required!" });
    }

    // Validate request body fields
    const { productName, price, brandName, category, subcategory, longDescription } = req.body;
    
    // Get shortDescription from request body (already an array from frontend)
    const shortDescription = req.body.shortDescription || [];
    
    // Filter out any empty strings from the array
    const filteredShortDescriptions = shortDescription.filter(desc => desc.trim() !== '');

    if (!productName || !price || !brandName || !category || !subcategory) {
      return res.status(400).json({ message: "All required fields are missing" });
    }

    // Construct image URL
    const imageUrl = `${process.env.IMG_BASE_URL}/images/${req.file.filename}`;

    // Create and save product
    const newProduct = new Product({
      productName,
      price,
      brandName,
      category,
      subcategory,
      shortDescription: filteredShortDescriptions,
      longDescription: longDescription || '',
      image: imageUrl,
    });

    await newProduct.save();

    res.status(201).json({ 
      message: "Product added successfully", 
      product: newProduct 
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a product by ID
const editProduct = async (req, res) => {
  try {
    const { brandName, productName, price, subcategory, longDescription } = req.body;
    
    // Convert shortDescription from string to array
    let shortDescription = [];
    if (req.body.shortDescription) {
      shortDescription = req.body.shortDescription.split('\n').filter(point => point.trim() !== '');
    }

    const updateData = { 
      brandName, 
      productName, 
      price, 
      subcategory,
      shortDescription,
      longDescription: longDescription || ''
    };

    // If a file was uploaded, update the image path
    if (req.file) {
      updateData.image = `${process.env.IMG_BASE_URL}/images/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
}

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export { addProduct, editProduct, deleteProduct, getProducts, getProductById };
