import React, { useState, useEffect } from 'react';
import Navbar from '../../shared/Navbar';
import { ProfileSkeleton } from '../../shared/Skeleton';
import { getUserProfile, updateUserProfile, deleteUserAccount, uploadProfilePhoto } from '../../services/userService';
import { useAuth } from '../../shared/AuthContext';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import '../auth/auth.css';

export default function TenantProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserProfile(user.userId)
      .then((res) => {
        const d = res.data.data;
        setUserData(d);
        setForm({ name: d.name, email: d.email, contactNumber: d.contactNumber || '', aadharNumber: d.aadharNumber || '' });
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [user.userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUserProfile(user.userId, form);
      setUserData(res.data.data);
      setEditing(false);
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('profilePhoto', file);
    try {
      const res = await uploadProfilePhoto(user.userId, fd);
      setUserData((prev) => ({ ...prev, profilePhoto: res.data.data?.filePath }));
    } catch {
      setError('Photo upload failed.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    try {
      await deleteUserAccount(user.email);
      logout();
      navigate('/');
    } catch {
      setError('Failed to delete account.');
    }
  };

  if (loading) return <div><Navbar /><div className="page-container"><ProfileSkeleton /></div></div>;

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="profile-layout">
          {/* Left: avatar + photo upload */}
          <aside className="profile-aside card">
            <div className="profile-avatar-wrap">
              {userData?.profilePhoto
                ? <img src={userData.profilePhoto} alt="Profile" className="profile-avatar-img" />
                : <div className="profile-avatar-placeholder">{userData?.name?.[0]?.toUpperCase()}</div>
              }
            </div>
            <h2 className="profile-name">{userData?.name}</h2>
            <p className="profile-role badge badge-info">Tenant</p>
            <label className="btn btn-outline btn-sm profile-upload-btn">
              Change Photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
            </label>
            <button className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={handleDelete}>
              Delete Account
            </button>
          </aside>

          {/* Right: details */}
          <div className="profile-content">
            {error && <p className="auth-error">{error}</p>}

            <div className="card profile-section-card">
              <div className="profile-section-header">
                <h3>Personal Details</h3>
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleUpdate} className="profile-form">
                  {[
                    { name: 'name', label: 'Full Name', type: 'text' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'contactNumber', label: 'Contact Number', type: 'text' },
                    { name: 'aadharNumber', label: 'Aadhar Number', type: 'text' },
                  ].map(({ name, label, type }) => (
                    <div className="form-group" key={name}>
                      <label>{label}</label>
                      <input type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <dl className="profile-dl">
                  {[
                    ['Name', userData?.name],
                    ['Email', userData?.email],
                    ['Contact', userData?.contactNumber || '—'],
                    ['Aadhar', userData?.aadharNumber || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="profile-dl__row">
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
