import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';
import { register as registerApi } from '../../services/authService';
import './auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tenant' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerApi(form);
      const data = res.data.data;
      login({ ...data, email: form.email });
      navigate(data.role === 'landlord' ? '/landlord/dashboard' : '/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="auth-logo">RoomEase</h1>
          <p className="auth-subtitle">Find your perfect room</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Create account</h2>

          <div className="form-group">
            <label>I am a</label>
            <div className="role-toggle">
              {['tenant', 'landlord'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-btn${form.role === r ? ' active' : ''}`}
                  onClick={() => setForm({ ...form, role: r })}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" name="name" placeholder="Jane Doe" value={form.name} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" placeholder="••••••••" value={form.password} onChange={onChange} required />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
