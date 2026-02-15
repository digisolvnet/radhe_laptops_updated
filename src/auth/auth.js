// import jwt from 'jsonwebtoken';
// import { Custumer } from '../models/custumer/custumer.model.js';

// export const authenticateCustomer = AsyncHandler(async (req, res, next) => {
//   // Get the token from the Authorization header
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized, no token' });
//   }

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Find the customer by ID from the token payload
//     const customer = await Custumer.findById(decoded.id).select('-password');

//     if (!customer) {
//       return res.status(404).json({ message: 'Customer not found' });
//     }

//     // Attach the customer object to the request
//     req.customer = customer;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Not authorized, token failed' });
//   }
// });