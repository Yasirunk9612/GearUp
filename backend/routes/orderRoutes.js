import express from 'express';
import { createOrder, getOrderById, getOrdersByCustomer } from '../controllers/orderController.js';

const router = express.Router();


router.post('/:customerId', createOrder);

router.get('/:id', getOrderById);
router.get('/customer/:customerId', getOrdersByCustomer);

export default router;
