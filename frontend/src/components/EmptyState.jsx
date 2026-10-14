import React from 'react';
import { Inbox, RotateCcw, Search } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'No matching data was returned for the selected filter criteria.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <div
      className="card"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-card, #1C1C20)',
        border: '1px solid var(--border-card, #333339)',
        borderRadius: '14px',
        margin: '16px 0',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-surface, #222227)',
          border: '1px solid var(--border-card, #333339)',
          color: 'var(--text-muted, #B8B0B0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}
      >
        <Icon size={24} />
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main, #FFFFFF)', margin: '0 0 6px 0' }}>
        {title}
      </h3>

      <p style={{ fontSize: '13px', color: 'var(--text-muted, #B8B0B0)', maxWidth: '420px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                padding: '8px 16px',
              }}
            >
              <RotateCcw size={13} />
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                padding: '8px 16px',
              }}
            >
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
