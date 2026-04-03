import React from 'react';
import styles from '../verification.module.css';

function getFileIcon(path) {
  const lower = (path ?? '').toLowerCase();
  if (lower.match(/\.(jpg|jpeg|png|webp|gif)$/)) return null;
  if (lower.match(/\.pdf$/)) return '📄';
  return '📎';
}

function getFileName(path) {
  return path.split('/').pop().split('\\').pop();
}

export default function DocumentList({ documents, submittedAt }) {
  if (!documents || !documents.length) return null;

  return (
    <div className={styles.docsCard}>
      <div className={styles.docsTitle}>
        Submitted Documents
        {submittedAt && (
          <span className={styles.docsMeta}>
            {new Date(submittedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        )}
      </div>
      <div className={styles.docGrid}>
        {documents.map((doc, i) => {
          const icon = getFileIcon(doc);
          const name = getFileName(doc);
          return (
            <div key={i} className={styles.docThumb}>
              {!icon
                ? <img src={`/uploads/${name}`} alt={`Document ${i + 1}`} />
                : <span className={styles.docThumbIcon}>{icon}</span>
              }
              <span className={styles.docThumbLabel} title={name}>{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
