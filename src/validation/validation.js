import { object, string } from 'yup';

// auth validation
export const authValidation = object({
  email: string().email('Invalid email').required('Email is required'),
  password: string()
    .min(8, 'Password must be at least 8 characters')
    .required('password is required'),
  name: string()
    .min(2, 'minimum 2 character is required')
    .required('name is required'),
});

// login validation
export const loginValidation = object({
  email: string().email('Invalid email').required('Email is required'),
  password: string().required('password is required'),
});

export const productValidation = object({
  productName: string()
    .required('Product name is required')
    .min(2, 'minimum 2 character is required'),
  price: string().required('Price is required'),
  title: string().required('Title is required'),
  description: string().required('Description is required'),
  // image: string().required('Image is required'),
});
