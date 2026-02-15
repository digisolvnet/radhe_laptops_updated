import express from "express";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from "../controller/testinominals/testinominals.controller.js";
import { uploadMiddleware } from "../middlewares/multer.js";
const routes = express.Router();

routes.get("/", getTestimonials);
routes.post("/", uploadMiddleware,createTestimonial);
routes.delete("/:id", deleteTestimonial);
routes.put("/:id", uploadMiddleware,updateTestimonial);

export default routes;
