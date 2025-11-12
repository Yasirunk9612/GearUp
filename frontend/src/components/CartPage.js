import React, { useEffect, useState } from 'react';
import { getCartByCustomer, addOrUpdateCartItem, removeCartItem, clearCart } from '../api';
import { useCustomer } from '../contexts/CustomerContext';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const { customer } = useCustomer();
  const { refreshCart } = useCustomer();
  const navigate = useNavigate();


  const [editingItem, setEditingItem] = useState(null); 
  const [modalQty, setModalQty] = useState(1);

  const loadCart = async () => {
    setErr(null);
    if (!customer) return setErr('Please save customer first.');
    setLoading(true);
    try {
      const data = await getCartByCustomer(customer._id || customer.id);
      setCart(data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [customer]);

  
  const openEditModal = (it) => {
    setEditingItem({ productId: it.product._id || it.product.id, name: it.product.name, qty: it.qty });
    setModalQty(it.qty);
  };

  const saveModalQty = async () => {
    if (!editingItem) return;
    setErr(null);
    setMsg(null);
    try {
      const qty = Math.max(1, Number(modalQty) || 1);
      await addOrUpdateCartItem(customer._id || customer.id, { productId: editingItem.productId, qty });
      setMsg('Cart updated');
      setEditingItem(null);
  await loadCart();
  if (refreshCart) refreshCart();
  window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (e) {
      console.error(e);
      setErr('Failed to update qty');
    }
  };

  const handleContinue = async () => {
    if (!customer) {
      setErr('Please save customer first.');
      return;
    }
    
    if (editingItem) {
      await saveModalQty();
    }
    navigate('/checkout');
  };

  const handleRemove = async (productId) => {
    setErr(null);
    if (!customer) return setErr('Please save customer first.');
    try {
      await removeCartItem(customer._id || customer.id, productId);
      setMsg('Item removed');
  loadCart();
  if (refreshCart) refreshCart();
  window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (e) {
      console.error(e);
      setErr('Failed to remove item');
    }
  };

  const handleClear = async () => {
    setErr(null);
    if (!customer) return setErr('Please save customer first.');
    try {
      await clearCart(customer._id || customer.id);
      setMsg('Cart cleared');
  loadCart();
  if (refreshCart) refreshCart();
  window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (e) {
      console.error(e);
      setErr('Failed to clear cart');
    }
  };

  return (
    <div className="container py-4">
      <h3>Your Cart</h3>
      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {cart && cart.items && cart.items.length ? (
            <div>
              <ul className="list-group mb-3">
                {cart.items.map((it) => {
                  const product = it.product || null;
                  const key = product ? (product._id || product.id) : (it.productId || it._id || Math.random());
                  return (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={key}>
                      <div>
                        {product ? (
                          <>
                            <div><strong>{product.name}</strong></div>
                            <div className="text-muted">Rs. {product.price} each</div>
                          </>
                        ) : (
                          <div><strong>Product removed</strong><div className="text-muted">This product is no longer available.</div></div>
                        )}
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="me-2">Qty: <strong>{it.qty}</strong></div>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => product ? openEditModal(it) : setErr('Cannot edit a removed product. Please remove it from the cart.')}
                        >
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleRemove(product ? (product._id || product.id) : (it.productId || it._id))}>Remove</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="d-flex justify-content-between">
                <div>
                  <button className="btn btn-outline-danger me-2" onClick={handleClear}>Clear cart</button>
                  <button className="btn btn-primary" onClick={handleContinue}>Continue to checkout</button>
                </div>
                  <div>
                  <strong>Total: </strong>Rs. {cart.items.reduce((s,i)=> s + ((i.product?.price || 0) * i.qty), 0).toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div>No items in cart.</div>
          )}
        </div>
      )}
     
      {editingItem && (
        <div className="modal-backdrop" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1050}}>
          <div className="card" style={{width:320}}>
            <div className="card-body">
              <h5 className="card-title">Update quantity</h5>
              <p className="card-text">{editingItem.name}</p>
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input type="number" min="1" className="form-control" value={modalQty} onChange={(e) => setModalQty(Number(e.target.value))} />
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-secondary me-2" onClick={() => setEditingItem(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveModalQty}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
