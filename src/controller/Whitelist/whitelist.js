import { Custumer } from "../../models/custumer/custumer.model.js";

// Add a product to the whitelist
const addWhiteList = async (req, res) => {
  const { customerId, productId } = req.body;

  try {
    const custumer = await Custumer.findById(customerId);
    if (!custumer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if the product is already in the whitelist
    const isProductInWhitelist = custumer.whitelist.some(
      (item) => item.product.toString() === productId
    );

    if (isProductInWhitelist) {
      return res.status(400).json({ message: "Product already in whitelist" });
    }

    // Add the product to the whitelist
    custumer.whitelist.push({ product: productId });
    await custumer.save();

    res.status(200).json({
      message: "Product added to whitelist",
      whitelist: custumer.whitelist,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove a product from the whitelist
const removeWhiteList = async (req, res) => {
  const { customerId, productId } = req.body;
  console.log(req.body);

  try {
    const custumer = await Custumer.findById(customerId);
    if (!custumer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Filter out the product from the whitelist
    custumer.whitelist = custumer.whitelist.filter(
      (item) => item.product.toString() !== productId
    );

    await custumer.save();

    res.status(200).json({
      message: "Product removed from whitelist",
      whitelist: custumer.whitelist,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch the whitelist for a customer
const getWhiteList = async (req, res) => {
  const { customerId } = req.params;

  try {
    const customer =
      await Custumer.findById(customerId).populate("whitelist.product");
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ whitelist: customer.whitelist });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export { addWhiteList, removeWhiteList, getWhiteList };
