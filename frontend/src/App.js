import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerForm from './components/CustomerForm';
import ProductsPage from './components/ProductsPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import ProfilePage from './components/ProfilePage';
import { CustomerProvider } from './contexts/CustomerContext';

function App() {
  const logoPath = `${process.env.PUBLIC_URL}/gear.jpg`;

  return (
    <CustomerProvider>
      <div className="app-root">
        <Router>
          <Navbar />

          <main className="main-content">
            <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/customer" element={<CustomerForm />} />
          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Routes>
          </main>

          <footer className="bg-light py-4 mt-5 border-top">
          <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div className="d-flex align-items-center mb-2 mb-md-0">
              <img src={logoPath} alt="GearUp" width="32" height="32" className="me-2" />
              <div>
                <div className="fw-bold">GearUp</div>
                <small className="text-muted">Built as an intern demo</small>
              </div>
            </div>
              <div className="text-muted small">© {new Date().getFullYear()} GearUp. All rights reserved.</div>
            </div>
          </footer>
        </Router>
      </div>
    </CustomerProvider>
  );
}

export default App;
