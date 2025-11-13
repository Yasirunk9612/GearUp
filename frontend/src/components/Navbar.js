import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerContext';

export default function Navbar() {
  const { customer, cartCount } = useCustomer();
  const [count, setCount] = useState(0);
  const [bump, setBump] = useState(false);
  const prevCountRef = React.useRef(0);

  useEffect(() => {
    const newCount = cartCount || 0;
    setCount(newCount);
    if (newCount > (prevCountRef.current || 0)) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      return () => clearTimeout(t);
    }
    prevCountRef.current = newCount;
  }, [cartCount]);

  const logoPath = `${process.env.PUBLIC_URL}/gear.jpg`;

  return (
    <header className="navbar-modern shadow-sm">
      <div className="container d-flex align-items-center justify-content-between">
        <Link to="/" className="brand d-flex align-items-center text-decoration-none">
          <div className="brand-logo">
            <img src={logoPath} alt="GearUp" />
          </div>
          <div className="brand-text">
            <div className="fw-bold">GearUp</div>
            <small className="text-light-opacity">Intern demo</small>
          </div>
        </Link>

        <nav className="nav-items d-flex align-items-center">
          <Link to="/products" className="nav-link me-3">Products</Link>
          {customer ? (
            <>
              <Link to="/profile" className="nav-link me-3 d-none d-md-inline">My Profile</Link>
              <div className="d-flex align-items-center">
                <span className="user-name me-3 d-none d-md-inline">{customer.name}</span>
                <Link to="/cart" className={`cart-btn btn btn-sm me-2 position-relative ${bump ? 'bump' : ''}`} title="Cart">
                  <span className="cart-emoji">🛒</span>
                  {count > 0 && (
                    <span className="cart-badge">{count}</span>
                  )}
                </Link>
              </div>
            </>
          ) : (
            <Link to="/customer" className="btn btn-light btn-sm">Add customer</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
