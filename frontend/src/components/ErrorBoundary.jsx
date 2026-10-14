import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CampusIQ ErrorBoundary Captured Error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            backgroundColor: 'var(--bg-primary, #0B0B0D)',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '32px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-card, #1C1C20)',
              border: '1px solid var(--border-card, #333339)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: 'rgba(198, 40, 61, 0.15)',
                color: 'var(--primary-hover, #C6283D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main, #FFF)', marginBottom: '8px' }}>
              Something went wrong loading this view
            </h2>

            <p style={{ fontSize: '13px', color: 'var(--text-muted, #B8B0B0)', lineHeight: 1.6, marginBottom: '20px' }}>
              CampusIQ encountered an unexpected client render state. All backend calculations and records remain safely preserved.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'var(--bg-surface, #222227)',
                  border: '1px solid var(--border-card, #333339)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#ff8a80',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: '24px',
                  maxHeight: '100px',
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                }}
              >
                <RotateCcw size={14} />
                <span>Reload View</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                }}
              >
                <Home size={14} />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
