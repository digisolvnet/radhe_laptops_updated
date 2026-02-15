import { Router } from "express";
import {
  custumerLogin,
  custumerRegister,
  addToCart,
  mergeGuestCart,
  removeFromCart,
  getCartItems,
  updateCustomerProfile,
  updateCartItemQuantity,
  getAllCustumerDetails,
  getOrderById,
  getAllCustumers,
  getOrderWithCustomerDetails,
} from "../controller/custumer/auth.costumer.js";
import { validator } from "../helper/validator.js";
import { authValidation, loginValidation } from "../validation/validation.js";
import {
  saveCustomerInfo,
  sendOrderSummary,
  clearCart,
  getCustomerOrderHistory,
} from "../nodemailer.js";
import { createOrder, razorpay } from "../razorpayIntegration/razorpay.js";

const routes = Router();

routes.post("/register", validator(authValidation), custumerRegister);
routes.post("/login", validator(loginValidation), custumerLogin);
routes.post("/logout", custumerLogin);
routes.get("/orders/:orderId", getOrderById);
routes.get("/all/details", getAllCustumerDetails);
routes.post("/cart/add", addToCart);
routes.post("/cart/merge", mergeGuestCart);
routes.delete("/cart/remove/:productId", removeFromCart);

routes.get("/", getAllCustumers);

routes.post("/save-customer-info", saveCustomerInfo);
routes.get("/:customerId/order-history", getCustomerOrderHistory);
routes.post("/send-order-summary", sendOrderSummary);
routes.post("/clear-cart", clearCart);

routes.post("/cart/all", getCartItems);
routes.put("/cart/update", updateCartItemQuantity);
routes.post("/update-custumer", updateCustomerProfile);

routes.post("/verify-payment", razorpay);
routes.post("/create-order", createOrder);


routes.get('/order-details/:orderId', getOrderWithCustomerDetails);

export default routes;
