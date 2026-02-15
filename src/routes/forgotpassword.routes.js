import { Router } from 'express';
import { forgotPassword, resetPassword, verifyResetToken } from '../controller/ForgotPassword/forgotpassword.js';
import { adminForgotPassword,adminResetPassword,adminVerifyResetToken } from '../controller/AdminFgp/adminforgotPassword.js';

const routes = Router();

// Add to cart route

routes.post("/forgot-password",  forgotPassword);
routes.put("/reset-password/:token",  resetPassword);
routes.get("/verify-reset-token/:token",  verifyResetToken);

routes.post("/admin/forgot-password",  adminForgotPassword);
routes.put("/admin/reset-password/:token", adminResetPassword);
routes.get("/admin/verify-reset-token/:token",  adminVerifyResetToken);

export default routes;
