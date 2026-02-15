import {Cart} from "../../models/Cart/Cart.js";
import {Product} from "../../models/product/product.js";

// Add a product to the cart
 const addToCart = async (req, res) => {
  const { userId, productId, quantity ,price} = req.body;

  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    // If the cart doesn't exist, create a new one
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if the product is already in the cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      // If the product is already in the cart, update the quantity
      existingItem.quantity += quantity;
    } else {
      // If the product is not in the cart, add it
      cart.items.push({ productId, quantity,price });
    }

    // Save the cart
    await cart.save();

    res.status(200).json({ message: "Product added to cart", cart });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server error during add to cart" });
  }
};

export {addToCart};