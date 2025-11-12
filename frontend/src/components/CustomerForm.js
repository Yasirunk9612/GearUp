import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createCustomer } from '../api';
import { useCustomer } from '../contexts/CustomerContext';

export default function CustomerForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setCustomer } = useCustomer();
  const location = useLocation();

  React.useEffect(() => {

    if (location && location.state && location.state.message) {

      Swal.fire({
        icon: 'info',
        title: 'Action required',
        text: location.state.message,
        timer: 3000,
        showConfirmButton: false
      });

      try { window.history.replaceState({}, document.title, location.pathname); } catch (e) {}
    }
  }, [location]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);


    const errors = [];
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[0-9+\-()\s]{6,20}$/;

    if (!form.name || form.name.trim().length === 0) errors.push('Name is required');
    if (!form.email || !emailRe.test(form.email.trim())) errors.push('A valid email is required');
    if (!form.phone || !phoneRe.test(form.phone.trim())) errors.push('A valid phone number is required');

    if (errors.length) {
      const html = errors.map(e => `<div>${e}</div>`).join('');
      setError(errors.join(', '));
      Swal.fire({ icon: 'error', title: 'Validation error', html, showConfirmButton: true });
      return;
    }

    setLoading(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() };
      const data = await createCustomer(payload);

      setCustomer(data);
      // success popup then redirect
      Swal.fire({ icon: 'success', title: 'Saved', text: 'Customer saved. Redirecting to products...', timer: 1200, showConfirmButton: false });
      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      console.error('Create customer failed:', err);
      // Map common server responses to friendly messages
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err.message || 'Failed to save customer';

      let friendly = serverMsg;
      if (status === 400) {
        friendly = serverMsg || 'Invalid input. Please check your data and try again.';
      } else if (status === 409) {
        friendly = serverMsg || 'A customer with those details already exists.';
      } else if (status >= 500) {
        friendly = 'Server error. Please try again later.';
      } else if (!status) {
        friendly = 'Network error. Please check your connection.';
      }

      setError(friendly);
      Swal.fire({ icon: 'error', title: 'Unable to save', text: friendly, showConfirmButton: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3>Customer details</h3>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-3">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="form-control" type="email" />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="form-control" />
        </div>

        <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save customer'}</button>
      </form>

      <small className="text-muted">Add customer from here</small>
    </div>
  );
}
