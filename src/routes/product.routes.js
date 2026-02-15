import { Router } from 'express';
import {
  addProduct,
  editProduct,
  deleteProduct,
  getProducts,
  getProductById,
} from '../controller/products/addProduct.js';
import { validator } from '../helper/validator.js';
import { productValidation } from '../validation/validation.js';
import { uploadMiddleware } from '../middlewares/multer.js';

const routes = Router();

routes.post('/add', uploadMiddleware,  addProduct);
routes.get('/product/:id' , getProductById)
routes.put('/:id', uploadMiddleware,  editProduct);
routes.delete('/:id', deleteProduct);
routes.get('/all', getProducts);

export default routes;
