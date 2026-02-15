import { Custumer } from "../../models/custumer/custumer.model.js";
import { AsyncHandler } from "../../utils/AyncHandler.js";
import { AlreadyExist, NotFoundError } from "../../utils/custumError.js";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import bcrypt from "bcryptjs";

const custumerRegister = AsyncHandler(async (req, res) => {
  const { name, email, password, address } = req.body;

  // Check if admin already exists
  const existingCustumer = await Custumer.findOne({ email });
  if (existingCustumer) {
    throw new AlreadyExist("Custumer already exist", "custumer method");
  }

  // Create new custumer (Password will be hashed automatically)
  const newCustumer = await Custumer.create({ name, email, password, address });

  res.status(201).json({
    message: "Custumer created successfully",
    newCustumer,
  });
});

const custumerLogin = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const custumer = await Custumer.findOne({ email });

  if (!custumer) {
    throw new NotFoundError(
      "custumer with this email not found",
      "custumer method"
    );
  }

  // Check if the password matches
  const isPasswordValid = await bcrypt.compare(password, custumer.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Password is wrong" });
  }

  // Generate JWT Token
  const token = custumer.generateToken();

  // Store token in HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.status(200).json({
    message: "Custumer login successful",
    custumer,
    token,
  });
});

const addToCart = async (req, res) => {
  const { customerId, productId, quantity } = req.body;

  if (!customerId || !productId || !quantity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find the customer
    const customer = await Custumer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Use the addToCart method
    await customer.addToCart(productId, quantity);

    res.status(200).json({
      message: "Product added to cart successfully",
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
const mergeGuestCart = AsyncHandler(async (req, res) => {
  const { customerId, guestCart } = req.body;

  if (!customerId || !guestCart) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const customer = await Custumer.findById(customerId);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  // Merge guest cart with the customer's cart
  guestCart.forEach((guestItem) => {
    const existingCartItem = customer.cart.find(
      (item) => item.product.toString() === guestItem.productId
    );

    if (existingCartItem) {
      // Update quantity if the product already exists
      existingCartItem.quantity += guestItem.quantity;
    } else {
      // Add new product to the cart
      customer.cart.push({
        product: guestItem.productId,
        quantity: guestItem.quantity,
      });
    }
  });

  await customer.save();

  res.status(200).json({
    message: "Guest cart merged successfully",
    cart: customer.cart,
  });
});
const removeFromCart = AsyncHandler(async (req, res) => {
  const { productId } = req.params; // Access productId from URL parameters
  const { customerId } = req.body; // Access customerId from the request body

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  if (!customerId) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  // Find the customer by customerId
  const customer = await Custumer.findById(customerId);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  // Filter out the product from the cart
  customer.cart = customer.cart.filter(
    (item) => item.product.toString() !== productId
  );

  // Save the updated customer document
  await customer.save();

  res.status(200).json({
    message: "Product removed from cart successfully",
    cart: customer.cart,
  });
});
// PUT /custumer/cart/update - Update the quantity of a product in the cart
const updateCartItemQuantity = AsyncHandler(async (req, res) => {
  const { customerId, productId, quantity } = req.body;

  if (!customerId || !productId || !quantity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find the customer by ID
  const customer = await Custumer.findById(customerId);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  // Find the cart item
  const cartItem = customer.cart.find(
    (item) => item.product.toString() === productId
  );

  if (!cartItem) {
    return res.status(404).json({ message: "Product not found in cart" });
  }

  // Update the quantity
  cartItem.quantity = quantity;

  // Save the updated customer document
  await customer.save();

  res.status(200).json({
    message: "Cart item quantity updated successfully",
    cart: customer.cart,
  });
});
const getCartItems = AsyncHandler(async (req, res) => {
  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  // Find the customer by ID and populate the product details in the cart
  const customer = await Custumer.findById(customerId).populate({
    path: "cart.product",
    select: "_id productName price image", // Include _id in the selected fields
  });

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  // Validate the cart array
  if (!customer.cart || !Array.isArray(customer.cart)) {
    return res.status(400).json({ message: "Invalid cart data" });
  }

  // Filter out invalid cart items and map through the valid ones
  const validCartItems = customer.cart.filter((item) => item.product);
  const cartItems = validCartItems.map((item) => ({
    product: {
      _id: item.product._id,
      productName: item.product.productName,
      price: item.product.price,
      image: item.product.image,
    },
    quantity: item.quantity,
  }));

  res.status(200).json({
    message: "Cart items fetched successfully",
    cart: cartItems,
  });
});
const updateCustomerProfile = AsyncHandler(async (req, res) => {
  const { name, email, address } = req.body;

  const customer = req.customer;

  customer.name = name || customer.name;
  customer.email = email || customer.email;
  customer.address = address || customer.address;

  await customer.save();

  res.status(200).json({ message: "Profile updated successfully", customer });
});

const getAllCustumerDetails = async (req, res) => {
  try {
    // Get all order history with populated product details including images
    const customers = await Custumer.find()
      .select("orderHistory")
      .populate({
        path: "orderHistory.items.product",
        select: "productName price image sku category",
        model: "Product",
      })
      .populate({
        path: "orderHistory",
      })
      .lean();

    // Process images and format response
    const allOrders = customers.flatMap((customer) =>
      customer.orderHistory.map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        items: order.items.map((item) => ({
          product: item.product
            ? {
                _id: item.product._id,
                name: item.product.productName,
                price: item.product.price,
                image: item.product.image,
                category: item.product.category,
              }
            : null, // Handle cases where item.product might be null
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase || item.product?.price,
        })),
        total: order.total,
        createdAt: order.orderDate,
        updatedAt: order.updatedAt,
      }))
    );

    res.status(200).json({
      success: true,
      count: allOrders.length,
      orders: allOrders,
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validate orderId
    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    // Find the customer who has this order
    const customer = await Custumer.findOne({
      "orderHistory._id": orderId,
    })
      .select("orderHistory")
      .populate({
        path: "orderHistory.items.product",
        select: "productName price image sku category",
        model: "Product",
      })
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find the specific order within the orderHistory
    const order = customer.orderHistory.find(
      (order) => order._id.toString() === orderId
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Format order response
    const formattedOrder = {
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items.map((item) => ({
        product: item.product
          ? {
              _id: item.product._id,
              name: item.product.productName,
              price: item.product.price,
              image: item.product.image,
              category: item.product.category,
            }
          : null, // Handle cases where item.product might be null
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase || item.product?.price,
      })),
      total: order.total,
      createdAt: order.orderDate,
      updatedAt: order.updatedAt,
    };

    res.status(200).json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllCustumers = AsyncHandler(async (req, res) => {
  const custumers = await Custumer.find()
    .select("-password")
    .select("orderHistory")
    .populate({
      path: "orderHistory.items.product",
      select: "productName price image sku category",
      model: "Product",
    })
    .populate({
      path: "orderHistory",
    })
    .lean();

  // Process images and format response
  const allOrders = custumers.flatMap((customer) =>
    customer.orderHistory.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items.map((item) => ({
        product: item.product
          ? {
              _id: item.product._id,
              name: item.product.productName,
              price: item.product.price,
              image: item.product.image,
              category: item.product.category,
            }
          : null, // Handle cases where item.product might be null
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase || item.product?.price,
      })),
      total: order.total,
      createdAt: order.orderDate,
      updatedAt: order.updatedAt,
    }))
  );

  if (!custumers || custumers.length === 0) {
    return res.status(404).json({ message: "No registered customers found." });
  }

  res.status(200).json({
    message: "All registered customers fetched successfully",
    total: custumers.length,
    custumers,
    allOrders: allOrders,
  });
});

const getOrderWithCustomerDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Additional validation (redundant but safe)
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid order ID' 
      });
    }

    // Find customer with matching order ID
    const customer = await Custumer.findOne({
      'orderHistory._id': new mongoose.Types.ObjectId(orderId)
    })
    .populate({
      path: 'orderHistory.items.product',
      select: 'productName price image category'
    })
    .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!customer) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Find the specific order
    const order = customer.orderHistory.find(
      order => order._id.toString() === orderId
    );

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found in customer history' 
      });
    }

    // Prepare response
    const response = {
      success: true,
      order: {
        ...order.toObject(),
        // Convert to plain object if needed
      },
      customer: {
        _id: customer._id,
        email: customer.email,
        name: customer.name,
        address: customer.address,
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order details',
      error: error.message 
    });
  }
};
export {
  custumerRegister,
  custumerLogin,
  addToCart,
  mergeGuestCart,
  removeFromCart,
  getCartItems,
  updateCustomerProfile,
  updateCartItemQuantity,
  getAllCustumerDetails,
  getOrderById,
  getAllCustumers,
  getOrderWithCustomerDetails
};
