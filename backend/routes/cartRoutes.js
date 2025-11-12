import express from 'express';
import { getCartByCustomer, addOrUpdateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.get('/:customerId', getCartByCustomer);
router.post('/:customerId/items', addOrUpdateCartItem);
router.delete('/:customerId/items/:productId', removeCartItem);
router.delete('/:customerId', clearCart);

export default router;
