import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { register as registerApi } from '../../services/authService';
import styles from './auth.module.css';

const ROLES = [
  { value: 'tenant',   label: 'Tenant',   icon: '🏠' },
  { value: 'landlord', label: 'Landlord', icon: '🔑' },
];

const PANEL_FEATURES = [
  'Free to sign up — no credit card needed',
  'Verified listings only',
  'Instant booking requests',
  'In-app messaging with landlords',
];

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score: 1, label: 'Weak',   color: styles.strengthWeak };
  if (score <= 2) return { score: 2, label: 'Fair',   color: styles.strengthFair };
  return           { score: 3, label: 'Strong', color: styles.strengthStrong };
}

// ── Validation ────────────────────────────────────────────────────────────────
function validate({ name, email, password }) {
  const errors = {};
  if (!name || name.trim().length < 2)   errors.name     = 'Full name is required (min 2 chars).';
  if (!email)                            errors.email    = 'Email is required.';
  else if (!/\S+@\S+\.\S+/.test(email))  errors.email    = 'Enter a valid email.';
  if (!password)                         errors.password = 'Password is required.';
  else if (password.length < 6)          errors.password = 'Minimum 6 characters.';
  return errors;
}

export default function Register() {
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: 'tenant' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const strength = useMemo(() => getStrength(form.password), [form.password]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    setLoading(true);
    try {
      const res  = await registerApi(form);
      const data = res.data.data;
      login({ ...data, email: form.email, name: form.name });
      navigate(data.role === 'landlord' ? '/landlord/dashboard' : '/home', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
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
          Join thousands of tenants and landlords already using RoomEase.
        </p>
        <ul className={styles.panelFeatures}>
          {PANEL_FEATURES.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </aside>

      {/* ── Right form panel ── */}
      <div className={styles.formSide}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Create your account</h1>
          <p className={styles.subheading}>Get started with RoomEase for free</p>

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

            {/* Full name */}
            <div className={styles.fieldGroup}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <div className={styles.inputWrap}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={onChange}
                  className={[styles.input, errors.name ? styles.inputError : ''].join(' ')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
              </div>
              {errors.name && <span id="name-error" className={styles.fieldError} role="alert">{errors.name}</span>}
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

            {/* Password + strength */}
            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={onChange}
                  className={[styles.input, styles.inputWithIcon, errors.password ? styles.inputError : ''].join(' ')}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : 'password-strength'}
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

              {/* Strength bar — only shown when user has typed */}
              {form.password && (
                <div id="password-strength" aria-live="polite">
                  <div className={styles.strengthBar}>
                    {[1, 2, 3].map((seg) => (
                      <div
                        key={seg}
                        className={[
                          styles.strengthSegment,
                          strength.score >= seg ? strength.color : '',
                        ].join(' ')}
                      />
                    ))}
                  </div>
                  <span className={[styles.strengthLabel, strength.color].join(' ')}>
                    {strength.label}
                  </span>
                </div>
              )}

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
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
