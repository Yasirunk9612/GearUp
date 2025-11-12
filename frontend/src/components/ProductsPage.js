import React, { useEffect, useState } from 'react';
import { getProducts, addOrUpdateCartItem } from '../api';
import { useCustomer } from '../contexts/CustomerContext';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then((data) => setProducts(data))
      .catch((e) => setErr('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const { customer } = useCustomer();
  const { refreshCart } = useCustomer();

  const handleAdd = async (product) => {
    setErr(null);
    setMsg(null);
    try {
      await addOrUpdateCartItem(customer._id || customer.id, { productId: product._id || product.id, qty: 1 });
  setMsg(`${product.name} added to cart`);
  // notify context/navbar to refresh
  if (refreshCart) refreshCart();
  window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (e) {
      console.error(e);
      setErr('Failed to add to cart');
    }
  };

  return (
    <div className="container py-4">
      <h3>Products</h3>
      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="row">
          {products && products.length ? (
            products.map((p) => (
              <div className="col-md-4" key={p._id || p.id}>
                <div className="card mb-3">
                  { /* image area */ }
                  <div style={{height: 180, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa'}}>
                    <img
                      src={p.imageUrl || p.image || 'https://via.placeholder.com/300x180?text=No+Image'}
                      alt={p.name}
                      style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain'}}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x180?text=No+Image'; }}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{p.name}</h5>
                    <p className="card-text">{p.description || ''}</p>
                    <p className="card-text"><strong>Price: </strong>Rs. {p.price || p.price}</p>
                    <button className="btn btn-sm btn-primary" onClick={() => handleAdd(p)}>Add to cart</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">No products</div>
          )}
        </div>
      )}
    </div>
  );
}
