import { Router } from "express";
import { Contact } from "../models/Contactus/contact.model.js";
import { GetContactDetails } from "../controller/contact/contact.controller.js";

const routes = Router();

// Add to cart route
routes.post("/", Contact);
routes.get("/", GetContactDetails);

export default routes;
