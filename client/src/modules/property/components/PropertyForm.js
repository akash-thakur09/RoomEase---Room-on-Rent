import React, { useState, useRef, useCallback } from 'react';
import styles from '../properties.module.css';

const CITIES = ['indore', 'bhopal', 'mumbai', 'delhi', 'pune', 'bangalore', 'hyderabad', 'chennai'];
const TYPES  = ['single', 'sharing', 'apartment'];

const INITIAL = {
  type: 'single', address: '', city: '', rent: '',
  status: 'available', description: '',
};

function validate(form) {
  const e = {};
  if (!form.address.trim())       e.address = 'Address is required.';
  if (!form.city.trim())          e.city    = 'City is required.';
  if (form.rent && isNaN(Number(form.rent))) e.rent = 'Rent must be a number.';
  return e;
}

/**
 * PropertyForm — used for both Add and Edit.
 *
 * @param {Object}   initial        - pre-filled values for edit mode
 * @param {string[]} existingPhotos - server photo paths (edit mode)
 * @param {boolean}  submitting
 * @param {string}   submitError
 * @param {Function} onSubmit       - (FormData) => void
 * @param {Function} onCancel
 */
export default function PropertyForm({
  initial = {},
  existingPhotos = [],
  submitting = false,
  submitError = '',
  onSubmit,
  onCancel,
}) {
  const isEdit = !!initial._id;

  const [form, setForm]           = useState({ ...INITIAL, ...initial, rent: initial.rent ?? '' });
  const [amenities, setAmenities] = useState(initial.amenities ?? []);
  const [amenityInput, setAmenityInput] = useState('');
  const [newPhotos, setNewPhotos] = useState([]);   // File objects
  const [keptPhotos, setKeptPhotos] = useState(existingPhotos); // paths to keep
  const [drag, setDrag]           = useState(false);
  const [errors, setErrors]       = useState({});
  const inputRef                  = useRef(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  // ── Amenities ─────────────────────────────────────────────────────────────
  const addAmenity = () => {
    const val = amenityInput.trim();
    if (!val || amenities.includes(val)) return;
    setAmenities((a) => [...a, val]);
    setAmenityInput('');
  };

  const removeAmenity = (a) => setAmenities((prev) => prev.filter((x) => x !== a));

  // ── Photos ────────────────────────────────────────────────────────────────
  const addPhotos = useCallback((files) => {
    const fresh = Array.from(files).filter(
      (f) => !newPhotos.some((p) => p.name === f.name)
    );
    setNewPhotos((prev) => [...prev, ...fresh].slice(0, 5));
  }, [newPhotos]);

  const removeNewPhoto  = (name) => setNewPhotos((p) => p.filter((f) => f.name !== name));
  const removeKeptPhoto = (path) => setKeptPhotos((p) => p.filter((x) => x !== path));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
    });
    amenities.forEach((a) => fd.append('amenities', a));
    newPhotos.forEach((f) => fd.append('photos', f));
    // Tell backend which existing photos to keep
    keptPhotos.forEach((p) => fd.append('keepPhotos', p));
    fd.append('email', localStorage.getItem('userEmail') ?? '');

    onSubmit(fd);
  };

  const field = (name, label, type = 'text', placeholder = '', required = false) => (
    <div className={styles.formField}>
      <label className={styles.formLabel}>
        {label}{required && <span className={styles.formRequired}>*</span>}
      </label>
      <input
        name={name} type={type} placeholder={placeholder}
        value={form[name]} onChange={onChange}
        className={`${styles.formInput} ${errors[name] ? styles.formInputError : ''}`}
        aria-invalid={!!errors[name]}
      />
      {errors[name] && <span className={styles.fieldError}>{errors[name]}</span>}
    </div>
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>

      {/* Type + Status */}
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Room Type<span className={styles.formRequired}>*</span></label>
          <select name="type" value={form.type} onChange={onChange} className={styles.formSelect}>
            {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Status<span className={styles.formRequired}>*</span></label>
          <select name="status" value={form.status} onChange={onChange} className={styles.formSelect}>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>
      </div>

      {/* Address */}
      {field('address', 'Address', 'text', 'e.g. 12 MG Road, Sector 5', true)}

      {/* City + Rent */}
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>City<span className={styles.formRequired}>*</span></label>
          <input
            name="city" list="city-list" placeholder="e.g. Indore"
            value={form.city} onChange={onChange}
            className={`${styles.formInput} ${errors.city ? styles.formInputError : ''}`}
          />
          <datalist id="city-list">
            {CITIES.map((c) => <option key={c} value={c.charAt(0).toUpperCase() + c.slice(1)} />)}
          </datalist>
          {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
        </div>
        {field('rent', 'Rent (₹/month)', 'number', 'e.g. 8000')}
      </div>

      {/* Description */}
      <div className={styles.formField}>
        <label className={styles.formLabel}>Description</label>
        <textarea
          name="description" placeholder="Describe the property — furnishing, floor, nearby landmarks…"
          value={form.description} onChange={onChange}
          className={styles.formTextarea} rows={3}
        />
      </div>

      {/* Amenities */}
      <div className={styles.formField}>
        <label className={styles.formLabel}>Amenities</label>
        <div className={styles.amenitiesWrap}>
          <div className={styles.amenitiesInput}>
            <input
              type="text" placeholder="e.g. WiFi, AC, Parking"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
              className={styles.formInput}
            />
            <button type="button" className={styles.addAmenityBtn} onClick={addAmenity}>
              + Add
            </button>
          </div>
          {amenities.length > 0 && (
            <div className={styles.amenityList}>
              {amenities.map((a) => (
                <span key={a} className={styles.amenityPill}>
                  {a}
                  <button type="button" className={styles.amenityRemove} onClick={() => removeAmenity(a)} aria-label={`Remove ${a}`}>✕</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      <div className={styles.formField}>
        <label className={styles.formLabel}>Photos (up to 5)</label>

        {/* Existing photos (edit mode) */}
        {keptPhotos.length > 0 && (
          <div className={styles.photoPreviewGrid} style={{ marginBottom: 8 }}>
            {keptPhotos.map((path) => {
              const name = path.split('/').pop().split('\\').pop();
              return (
                <div key={path} className={styles.existingPhoto}>
                  <img src={`/uploads/${name}`} alt="existing" />
                  <span className={styles.existingPhotoLabel}>Saved</span>
                  <button type="button" className={styles.photoRemove} onClick={() => removeKeptPhoto(path)} aria-label="Remove photo">✕</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Drop zone */}
        {(keptPhotos.length + newPhotos.length) < 5 && (
          <div
            className={`${styles.photoUploadZone} ${drag ? styles.photoUploadZoneDrag : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); addPhotos(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            aria-label="Upload photos"
          >
            <div className={styles.photoUploadIcon}>📷</div>
            <p className={styles.photoUploadText}>
              {drag ? 'Drop here' : 'Drag & drop or click to upload'}
            </p>
            <input
              ref={inputRef} type="file" multiple accept="image/*"
              className={styles.photoUploadInput}
              onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }}
            />
          </div>
        )}

        {/* New photo previews */}
        {newPhotos.length > 0 && (
          <div className={styles.photoPreviewGrid}>
            {newPhotos.map((f) => (
              <div key={f.name} className={styles.photoPreview}>
                <img src={URL.createObjectURL(f)} alt={f.name} />
                <button type="button" className={styles.photoRemove} onClick={() => removeNewPhoto(f.name)} aria-label="Remove">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API error */}
      {submitError && (
        <div className={styles.formError} role="alert">⚠ {submitError}</div>
      )}

      {/* Actions */}
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting && <span className={styles.spinner} aria-hidden="true" />}
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Property'}
        </button>
      </div>
    </form>
  );
}
