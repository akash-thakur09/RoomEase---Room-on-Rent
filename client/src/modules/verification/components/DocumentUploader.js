import React, { useRef, useState, useCallback } from 'react';
import styles from '../verification.module.css';

const MAX_FILES = 5;
const MAX_MB    = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ACCEPTED  = '.jpg,.jpeg,.png,.pdf,.webp';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(file) {
  if (file.type.startsWith('image/')) return '🖼️';
  if (file.type === 'application/pdf') return '📄';
  return '📎';
}

/**
 * DocumentUploader
 * @param {boolean}  submitting
 * @param {boolean}  submitted   - hide form after success
 * @param {string}   error
 * @param {boolean}  success
 * @param {Function} onSubmit    - (FormData) => void
 */
export default function DocumentUploader({
  submitting,
  submitted,
  error,
  success,
  onSubmit,
}) {
  const inputRef            = useRef(null);
  const [files, setFiles]   = useState([]);
  const [drag,  setDrag]    = useState(false);
  const [valErr, setValErr] = useState('');

  const validate = useCallback((incoming) => {
    const combined = [...files, ...incoming].slice(0, MAX_FILES);
    for (const f of combined) {
      if (f.size > MAX_BYTES) {
        return `"${f.name}" exceeds ${MAX_MB} MB limit.`;
      }
    }
    return '';
  }, [files]);

  const addFiles = useCallback((incoming) => {
    const err = validate(incoming);
    if (err) { setValErr(err); return; }
    setValErr('');
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const fresh = incoming.filter((f) => !names.has(f.name));
      return [...prev, ...fresh].slice(0, MAX_FILES);
    });
  }, [validate]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleChange = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeFile = (name) =>
    setFiles((prev) => prev.filter((f) => f.name !== name));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!files.length) { setValErr('Please select at least one document.'); return; }
    setValErr('');
    const fd = new FormData();
    files.forEach((f) => fd.append('documents', f));
    onSubmit(fd);
  };

  if (submitted && success) return null;

  return (
    <div className={styles.uploadCard}>
      <p className={styles.uploadTitle}>Upload Identity Documents</p>
      <p className={styles.uploadSub}>
        Accepted: Aadhar card, PAN card, passport, or any government-issued ID.
        Images (JPG, PNG) or PDF — max {MAX_MB} MB each, up to {MAX_FILES} files.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Drop zone */}
        <div
          className={`${styles.uploadZone} ${drag ? styles.uploadZoneDrag : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Click or drag files to upload"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <div className={styles.uploadIcon} aria-hidden="true">📁</div>
          <p className={styles.uploadText}>
            {drag ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className={styles.uploadHint}>or</p>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          >
            Browse Files
          </button>
          <input
            ref={inputRef}
            type="file"
            className={styles.uploadInput}
            accept={ACCEPTED}
            multiple
            onChange={handleChange}
            aria-label="Select documents to upload"
          />
        </div>

        {/* Selected files */}
        {files.length > 0 && (
          <div className={styles.fileList} role="list" aria-label="Selected files">
            {files.map((f) => (
              <div key={f.name} className={styles.fileItem} role="listitem">
                <span className={styles.fileIcon} aria-hidden="true">{fileIcon(f)}</span>
                <span className={styles.fileName} title={f.name}>{f.name}</span>
                <span className={styles.fileSize}>{formatBytes(f.size)}</span>
                <button
                  type="button"
                  className={styles.fileRemove}
                  onClick={() => removeFile(f.name)}
                  aria-label={`Remove ${f.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Validation / API errors */}
        {(valErr || error) && (
          <div className={styles.uploadError} role="alert">
            <span>⚠</span> {valErr || error}
          </div>
        )}

        {success && (
          <div className={styles.uploadSuccess} role="status">
            ✓ Documents submitted successfully! Your verification is under review.
          </div>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={submitting || !files.length}
        >
          {submitting && <span className={styles.spinner} aria-hidden="true" />}
          {submitting
            ? 'Uploading…'
            : `Submit ${files.length > 0 ? `(${files.length} file${files.length > 1 ? 's' : ''})` : ''}`
          }
        </button>
      </form>
    </div>
  );
}
