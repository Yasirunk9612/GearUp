import React, { useEffect, useState, useCallback } from 'react';
import { getCartByCustomer, createOrder } from '../api';
import { useCustomer } from '../contexts/CustomerContext';
import { useNavigate } from 'react-router-dom';



export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    instructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [errors, setErrors] = useState({});

  const loadCart = useCallback(async () => {
    setErr(null);
    if (!customer) return setErr('Please save customer first.');
    
    setDelivery(prev => ({
      ...prev,
      name: prev.name || customer.name || '',
      phone: prev.phone || customer.phone || ''
    }));
    try {
      const data = await getCartByCustomer(customer._id || customer.id);
      setCart(data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load cart');
    }
  }, [customer]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    // client-side validation for delivery fields
    const fieldsToValidate = ['line1','line2','city','state','postalCode','country','instructions'];
    const newErrors = {};
    fieldsToValidate.forEach((f) => {
      const v = (delivery[f] || '').toString().trim();
      if (!v) newErrors[f] = 'This field is required';
    });
    if (!delivery.phone) newErrors.phone = 'Delivery phone required';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return setErr('Please fix the highlighted fields');
    }
    if (!customer) return setErr('Please save customer first.');
    setLoading(true);
    try {
      // Map delivery fields to the backend order schema
      const mappedDelivery = {
        name: delivery.name,
        phone: delivery.phone,
        line1: delivery.line1,
        line2: delivery.line2,
        city: delivery.city,
        state: delivery.state,
        postalCode: delivery.postalCode,
        country: delivery.country,
        instructions: delivery.instructions
      };
      const payload = { delivery: mappedDelivery };
      const order = await createOrder(customer._id || customer.id, payload);
      setCart(null);

      // refresh navbar/cart state
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }

      // show email status to user and navigate to profile where orders are listed
      if (order && order.emailSent) {
        setMsg(`Order created. Confirmation email sent to ${customer.email}`);
      } else {
        setMsg(`Order created. Confirmation email was not sent to ${customer.email}.`);
      }

      // navigate to profile page and pass orderId so the newly created order is selected
      navigate('/profile', { state: { orderId: order._id } });
    } catch (e) {
      console.error(e);
      setErr('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const total = cart?.items ? cart.items.reduce((s,i)=> s + (i.product.price * i.qty), 0).toFixed(2) : '0.00';

  return (
    <div className="container py-4">
      <h3>Checkout</h3>
      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      {customer && (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Customer</h5>
            <p className="mb-1"><strong>{customer.name}</strong></p>
            <p className="mb-1 text-muted">{customer.email}</p>
            <p className="mb-0">{customer.phone}</p>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <h5>Delivery info</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
                <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={delivery.name} onChange={(e)=> { setDelivery({...delivery, name: e.target.value}); setErrors(prev=> ({...prev, name: undefined})); }} />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Phone *</label>
                <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} value={delivery.phone} onChange={(e)=> { setDelivery({...delivery, phone: e.target.value}); setErrors(prev=> ({...prev, phone: undefined})); }} />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
              <div className="mb-3">
                <label className="form-label">Address line 1</label>
                <input className={`form-control ${errors.line1 ? 'is-invalid' : ''}`} value={delivery.line1} onChange={(e)=> { setDelivery({...delivery, line1: e.target.value}); setErrors(prev=> ({...prev, line1: undefined})); }} />
                {errors.line1 && <div className="invalid-feedback">{errors.line1}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Address line 2</label>
                <input className={`form-control ${errors.line2 ? 'is-invalid' : ''}`} value={delivery.line2} onChange={(e)=> { setDelivery({...delivery, line2: e.target.value}); setErrors(prev=> ({...prev, line2: undefined})); }} />
                {errors.line2 && <div className="invalid-feedback">{errors.line2}</div>}
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">City</label>
                  <input className={`form-control ${errors.city ? 'is-invalid' : ''}`} value={delivery.city} onChange={(e)=> { setDelivery({...delivery, city: e.target.value}); setErrors(prev=> ({...prev, city: undefined})); }} />
                  {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">State</label>
                  <input className={`form-control ${errors.state ? 'is-invalid' : ''}`} value={delivery.state} onChange={(e)=> { setDelivery({...delivery, state: e.target.value}); setErrors(prev=> ({...prev, state: undefined})); }} />
                  {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Postal code</label>
                  <input className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`} value={delivery.postalCode} onChange={(e)=> { setDelivery({...delivery, postalCode: e.target.value}); setErrors(prev=> ({...prev, postalCode: undefined})); }} />
                  {errors.postalCode && <div className="invalid-feedback">{errors.postalCode}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Country</label>
                  <input className={`form-control ${errors.country ? 'is-invalid' : ''}`} value={delivery.country} onChange={(e)=> { setDelivery({...delivery, country: e.target.value}); setErrors(prev=> ({...prev, country: undefined})); }} />
                  {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Delivery instructions (optional)</label>
                <textarea className={`form-control ${errors.instructions ? 'is-invalid' : ''}`} value={delivery.instructions} onChange={(e)=> { setDelivery({...delivery, instructions: e.target.value}); setErrors(prev=> ({...prev, instructions: undefined})); }} />
                {errors.instructions && <div className="invalid-feedback">{errors.instructions}</div>}
              </div>

            <button className="btn btn-success" disabled={loading}>{loading ? 'Processing...' : 'Confirm order'}</button>
          </form>
        </div>

        <div className="col-md-6">
          <h5>Order summary</h5>
          {cart && cart.items && cart.items.length ? (
            <ul className="list-group">
              {cart.items.map(it => (
                <li key={it.product._id || it.product.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div><strong>{it.product.name}</strong></div>
                    <div className="text-muted">{it.qty} × Rs. {it.product.price}</div>
                  </div>
                  <div>Rs. {(it.product.price * it.qty).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div>No items in cart.</div>
          )}

          <div className="mt-3 text-end">
            <strong>Total: Rs. {total}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
