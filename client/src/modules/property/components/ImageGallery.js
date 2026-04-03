import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from '../detail.module.css';

const TYPE_ICONS = { single: '🛏️', sharing: '🏠', apartment: '🏢' };

/**
 * ImageGallery
 * @param {string[]} photos  - array of filenames (served from /uploads/)
 * @param {string}   type    - room type for placeholder icon
 */
export default function ImageGallery({ photos = [], type }) {
  const [active, setActive]       = useState(0);
  const [lightbox, setLightbox]   = useState(false);

  const total = photos.length;

  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setActive((i) => (i + 1) % total), [total]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     setLightbox(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, prev, next]);

  if (!total) {
    return (
      <div className={styles.gallery}>
        <div className={styles.galleryMain}>
          <div className={styles.galleryPlaceholder} aria-label={`${type} property`}>
            {TYPE_ICONS[type] ?? '🏠'}
          </div>
        </div>
      </div>
    );
  }

  const src = (i) => `/uploads/${photos[i]}`;

  return (
    <>
      <div className={styles.gallery}>
        {/* Main image */}
        <div
          className={styles.galleryMain}
          onClick={() => setLightbox(true)}
          role="button"
          tabIndex={0}
          aria-label="Open image fullscreen"
          onKeyDown={(e) => e.key === 'Enter' && setLightbox(true)}
        >
          <img src={src(active)} alt={`View ${active + 1} of ${total}`} />

          {total > 1 && (
            <>
              <button
                className={`${styles.galleryNav} ${styles.galleryNavPrev}`}
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                className={`${styles.galleryNav} ${styles.galleryNavNext}`}
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next photo"
              >
                ›
              </button>
              <span className={styles.galleryCounter}>{active + 1} / {total}</span>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {total > 1 && (
          <div className={styles.galleryThumbs} role="list" aria-label="Photo thumbnails">
            {photos.map((p, i) => (
              <button
                key={p}
                className={[styles.thumb, i === active ? styles.thumbActive : ''].join(' ')}
                onClick={() => setActive(i)}
                aria-label={`View photo ${i + 1}`}
                aria-current={i === active}
                role="listitem"
              >
                <img src={`/uploads/${p}`} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && createPortal(
        <div
          className={styles.lightbox}
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          <button
            className={styles.lightboxClose}
            onClick={() => setLightbox(false)}
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {total > 1 && (
            <button
              className={`${styles.galleryNav} ${styles.galleryNavPrev}`}
              style={{ position: 'fixed', left: 20, top: '50%' }}
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <img
            className={styles.lightboxImg}
            src={src(active)}
            alt={`Fullscreen view ${active + 1} of ${total}`}
            onClick={(e) => e.stopPropagation()}
          />

          {total > 1 && (
            <button
              className={`${styles.galleryNav} ${styles.galleryNavNext}`}
              style={{ position: 'fixed', right: 20, top: '50%' }}
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
