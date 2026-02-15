import { Router } from 'express';
import {
  
} from '../controller/products/addProduct.js';
import { addWhiteList, getWhiteList, removeWhiteList } from '../controller/Whitelist/whitelist.js';


const routes = Router();

routes.post('/add', addWhiteList);
routes.post('/remove', removeWhiteList);
routes.get('/:customerId' , getWhiteList)


export default routes;
