import express from 'express';
import { createCustomer, getCustomerById, getAllCustomers } from '../controllers/customerController.js';

const router = express.Router();

router.post('/', createCustomer);

router.get('/:id', getCustomerById);
router.get('/', getAllCustomers);

export default router;
