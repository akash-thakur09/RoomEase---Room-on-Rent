import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { login as loginApi } from '../../services/authService';
import styles from './auth.module.css';

const ROLES = [
  { value: 'tenant',   label: 'Tenant',   icon: '🏠' },
  { value: 'landlord', label: 'Landlord', icon: '🔑' },
];

const PANEL_FEATURES = [
  'Browse hundreds of verified listings',
  'Book rooms instantly, no middlemen',
  'Chat directly with landlords',
  'Secure payments & receipts',
];

// ── Validation ────────────────────────────────────────────────────────────────
function validate({ email, password }) {
  const errors = {};
  if (!email)                          errors.email    = 'Email is required.';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email   = 'Enter a valid email.';
  if (!password)                       errors.password = 'Password is required.';
  else if (password.length < 6)        errors.password = 'Minimum 6 characters.';
  return errors;
}

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '', role: 'tenant' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    setLoading(true);
    try {
      const res  = await loginApi(form);
      const data = res.data.data;
      login({ ...data, email: form.email });
      navigate(data.role === 'landlord' ? '/landlord/dashboard' : '/home', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Left decorative panel ── */}
      <aside className={styles.panel}>
        <p className={styles.panelLogo}>RoomEase</p>
        <p className={styles.panelTagline}>
          The easiest way to find and manage rooms — for tenants and landlords alike.
        </p>
        <ul className={styles.panelFeatures}>
          {PANEL_FEATURES.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </aside>

      {/* ── Right form panel ── */}
      <div className={styles.formSide}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Welcome back</h1>
          <p className={styles.subheading}>Sign in to continue to RoomEase</p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Role selector */}
            <div className={styles.fieldGroup}>
              <span className={styles.label}>I am a</span>
              <div className={styles.roleToggle}>
                {ROLES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={[styles.roleBtn, form.role === value ? styles.roleBtnActive : ''].join(' ')}
                    onClick={() => setForm((f) => ({ ...f, role: value }))}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <div className={styles.inputWrap}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                  className={[styles.input, errors.email ? styles.inputError : ''].join(' ')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && <span id="email-error" className={styles.fieldError} role="alert">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  className={[styles.input, styles.inputWithIcon, errors.password ? styles.inputError : ''].join(' ')}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <span id="password-error" className={styles.fieldError} role="alert">{errors.password}</span>}
            </div>

            {/* API error */}
            {apiError && (
              <div className={styles.errorBanner} role="alert">
                <span>⚠</span>
                <span>{apiError}</span>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading && <span className={styles.spinner} aria-hidden="true" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className={styles.footer}>
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
