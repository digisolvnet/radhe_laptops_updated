import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import custumerRoutes from "./custumer.routes.js";
import whiteListRoutes from "./whiteList.routes.js";
import contactRoutes from "./contact.routes.js";
import forgotPasswordRoutes from "./forgotpassword.routes.js";
import otpRoutes from "../routes/otp.routes.js";
import testinominalsRoutes from "./testinominals.routes.js";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/product", productRoutes);
routes.use("/custumer", custumerRoutes);
routes.use("/whitelist", whiteListRoutes);
routes.use("/contact", contactRoutes);
routes.use("/forgot-password", forgotPasswordRoutes);
routes.use("/otp", otpRoutes);
routes.use("/testimonials", testinominalsRoutes);

export default routes;
