import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import sendEmail from '../utils/sendEmail.js';


export const createOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map(e => e.msg).join(', '));
  }

  const customerId = req.params.customerId;
  const { delivery } = req.body;

  const customer = await Customer.findById(customerId);
  if (!customer) { res.status(404); throw new Error('Customer not found'); }

  const cart = await Cart.findOne({ customer: customerId }).populate('items.product');
  if (!cart || cart.items.length === 0) { res.status(400); throw new Error('Cart is empty'); }


  let total = 0;
  const orderItems = [];

  for (const it of cart.items) {
    const prod = await Product.findById(it.product._id);
    if (!prod) { res.status(400); throw new Error(`Product ${it.product._id} not found`); }


    if (prod.stock < it.qty) {
      res.status(400);
      throw new Error(`Not enough stock for product ${prod.name}. Available: ${prod.stock}`);
    }


    prod.stock = prod.stock - it.qty;
    await prod.save();

    const subTotal = it.qty * it.price;
    total += subTotal;

    orderItems.push({
      product: prod._id,
      name: prod.name,
      qty: it.qty,
      price: it.price
    });
  }

  const order = new Order({
    customer: customerId,
    items: orderItems,
    totalAmount: total,
    delivery,
    status: 'Confirmed'
  });

  await order.save();


  cart.items = [];
  await cart.save();


  try {
    const subject = `Order Confirmation - #${order._id}`;
    const html = `
      <h2>Thank you for your order, ${customer.name}</h2>
      <p>Order ID: ${order._id}</p>
      <p>Total: ${total.toFixed(2)}</p>
      <h3>Items</h3>
      <ul>
        ${orderItems.map(i => `<li>${i.name} (x${i.qty}) - ${i.price}</li>`).join('')}
      </ul>
      <h3>Delivery details</h3>
      <p>
        ${delivery.name ? `<strong>${delivery.name}</strong><br/>` : ''}
        ${delivery.line1 ? `${delivery.line1}<br/>` : ''}
        ${delivery.line2 ? `${delivery.line2}<br/>` : ''}
        ${delivery.city ? `${delivery.city}, ` : ''}${delivery.state ? `${delivery.state}<br/>` : ''}
        ${delivery.postalCode ? `Postal: ${delivery.postalCode}<br/>` : ''}
        ${delivery.country ? `${delivery.country}<br/>` : ''}
        ${delivery.phone ? `Phone: ${delivery.phone}<br/>` : ''}
        ${delivery.instructions ? `<em>Instructions: ${delivery.instructions}</em><br/>` : ''}
      </p>
    `;
    await sendEmail({ to: customer.email, subject, html });
    order.emailSent = true;
    await order.save();
  } catch (err) {

    console.error('Email sending failed:', err.message);
  }

  res.status(201).json(order);
});


export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer').populate('items.product');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  res.json(order);
});


export const getOrdersByCustomer = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.params.customerId }).sort({ createdAt: -1 });
  res.json(orders);
});
