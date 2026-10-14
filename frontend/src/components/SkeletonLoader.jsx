import React from 'react';

/**
 * Reusable Skeleton Loaders matching CampusIQ's dark charcoal theme
 */

export function SkeletonLine({ width = '100%', height = '14px', style = {} }) {
  return (
    <div
      className="skeleton-pulse"
      style={{
        width,
        height,
        borderRadius: '4px',
        backgroundColor: 'var(--bg-surface, #222227)',
        ...style,
      }}
    />
  );
}

export function SkeletonCards({ count = 4, minWidth = '220px' }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
        gap: '14px',
        marginBottom: '24px',
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="card skeleton-card"
          style={{
            padding: '18px',
            backgroundColor: 'var(--bg-card, #1C1C20)',
            border: '1px solid var(--border-card, #333339)',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <SkeletonLine width="60%" height="12px" />
            <div
              className="skeleton-pulse"
              style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: 'var(--bg-surface, #222227)' }}
            />
          </div>
          <SkeletonLine width="45%" height="28px" style={{ marginBottom: '10px' }} />
          <SkeletonLine width="80%" height="11px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div
      className="card"
      style={{
        padding: '20px',
        backgroundColor: 'var(--bg-card, #1C1C20)',
        border: '1px solid var(--border-card, #333339)',
        borderRadius: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
        <SkeletonLine width="30%" height="18px" />
        <SkeletonLine width="15%" height="14px" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: '12px',
              padding: '10px 0',
              borderBottom: rIdx < rows - 1 ? '1px solid var(--border-card, #333339)' : 'none',
            }}
          >
            {Array.from({ length: cols }).map((_, cIdx) => (
              <SkeletonLine key={cIdx} width={cIdx === 0 ? '70%' : '50%'} height="13px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkeletonPage({ title = 'Loading...' }) {
  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <SkeletonLine width="180px" height="12px" style={{ marginBottom: '8px' }} />
        <SkeletonLine width="380px" height="26px" style={{ marginBottom: '8px' }} />
        <SkeletonLine width="520px" height="14px" />
      </div>
      <SkeletonCards count={4} />
      <SkeletonTable rows={4} cols={5} />
    </div>
  );
}
