import { Custumer } from "../../models/custumer/custumer.model.js";
import { isValidObjectId } from "mongoose";
import { sendEmail } from "../admin/emailService.js"; // You'll need to implement this

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    // Validate inputs
    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Find customer with order and populate product details
    const customer = await Custumer.findOne({
      "orderHistory._id": orderId,
    }).populate({
      path: "orderHistory.items.product",
      select: "productName price image",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find the specific order
    const order = customer.orderHistory.find(
      (o) => o._id.toString() === orderId
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Save previous status for comparison
    const previousStatus = order.status;

    // Update order fields
    order.status = status;
    order.updatedAt = new Date();

    // Initialize statusHistory if it doesn't exist
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,

      note: note || "",
      changedAt: new Date(),
    });

    // Save the updated document
    await customer.save();

    // Only send email if status actually changed
    if (previousStatus !== status) {
      await sendOrderStatusEmail(customer, order, previousStatus);
    }

    res.status(200).json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Order status update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Email notification function
const sendOrderStatusEmail = async (customer, order, previousStatus) => {
  try {
    const statusLabels = {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    // Generate product list HTML
    const productList = order.items
      .map(
        (item) => `
      <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
        <h3 style="margin: 5px 0;">${item.product?.productName || "Product"}</h3>
        ${item.product?.image ? `<img src="${item.product.image}" alt="${item.productName}" style="max-width: 200px; margin: 5px 0;" />` : ""}
        <p style="margin: 5px 0;">Quantity: ${item.quantity}</p>
        <p style="margin: 5px 0;">Price: Rs. ${item.product.price || item.price}</p>
      </div>
    `
      )
      .join("");

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Order Status Has Been Updated</h2>
        <p>Hello ${customer.name},</p>
        
        <p>Your order <strong></strong> status has been changed from 
        <strong>${statusLabels[previousStatus]}</strong> to <strong>${statusLabels[order.status]}</strong>.</p>
        
        <h3 style="margin-top: 20px;">Order Details:</h3>
        ${productList}
        
        <p><strong>Total Amount:</strong> Rs. ${order.totalPrice}</p>
        <p><strong>Shipping To:</strong> ${order.country}</p>
        
        ${
          order.statusHistory[order.statusHistory.length - 1]?.note
            ? `
          <h3>Admin Note:</h3>
          <p>${order.statusHistory[order.statusHistory.length - 1].note}</p>
        `
            : ""
        }
        
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
             style="background: #0066cc; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            View Your Order
          </a>
        </p>
        
        <p style="margin-top: 30px;">Thank you for shopping with us!</p>
      </div>
    `;

    await sendEmail({
      to: customer.email,
      subject: `Order #${order.orderNumber} Status Update: ${statusLabels[order.status]}`,
      html: emailContent,
    });

    console.log(`Status update email sent to ${customer.email}`);
  } catch (emailError) {
    console.error("Failed to send status email:", emailError);
    // Don't fail the whole request if email fails
  }
};

export { updateOrderStatus };
