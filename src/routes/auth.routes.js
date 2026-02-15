import { Router } from "express";
import {
  adminLogin,
  adminRegister,
} from "../controller/admin/auth.controller.js";
import { validator } from "../helper/validator.js";
import { authValidation, loginValidation } from "../validation/validation.js";
import { updateOrderStatus } from "../controller/admin/admin.updateOrder.js";


const routes = Router();

routes.post("/register", validator(authValidation), adminRegister);
routes.post("/login", validator(loginValidation), adminLogin);
routes.patch("/:orderId/status", updateOrderStatus);


export default routes;
