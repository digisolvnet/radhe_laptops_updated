// routes/otpRoutes.js
import express from "express";
import { sendOtp, verifyOtp } from "../controller/otp/otp.js";

const routes = express.Router();

routes.post("/send", sendOtp);
routes.post("/verify", verifyOtp);

export default routes;