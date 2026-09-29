import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    careerGoal: 'Full Stack Developer',
    experienceLevel: 'beginner',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form Validations
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '40px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)',
            }}
          >
            <Brain size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
            Initialize your personalized Career Guidance AI memory profile
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '10px',
              color: '#fda4af',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                className="form-input"
                placeholder="Jane"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                className="form-input"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="jane.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Target Career Goal</label>
              <select
                name="careerGoal"
                className="form-select"
                value={formData.careerGoal}
                onChange={handleChange}
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select
                name="experienceLevel"
                className="form-select"
                value={formData.experienceLevel}
                onChange={handleChange}
              >
                <option value="beginner">Beginner (0-1 yrs)</option>
                <option value="intermediate">Intermediate (1-3 yrs)</option>
                <option value="advanced">Advanced (3+ yrs)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Min. 6 chars"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '13px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                <span>Initializing Memory Bank...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Create Account & Memory Bank</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: '#818cf8' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
