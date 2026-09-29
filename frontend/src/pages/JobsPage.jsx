import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Filter,
} from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (skillFilter) params.skill = skillFilter;
      if (locationFilter) params.location = locationFilter;

      const res = await api.get('/jobs', { params });
      if (res.data?.success) {
        setJobs(res.data.jobs);
      }
    } catch (e) {
      console.warn('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [roleFilter, skillFilter, locationFilter]);

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Job Matches & Skill Alignment</h1>
          <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Curated Demo Data
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Industry job benchmarks matched against your assessed skill competencies. Identify exact skills required to bridge the gap.
        </p>
      </div>

      {/* Demo Notice Banner */}
      <div
        style={{
          padding: '12px 18px',
          background: 'rgba(6, 182, 212, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#67e8f9',
          fontSize: '13px',
        }}
      >
        <AlertCircle size={16} />
        <span>
          <strong>Notice:</strong> As per hackathon specifications, all job listings are verified demonstration records designed for candidate skill alignment.
        </span>
      </div>

      {/* Filter Controls Bar */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          marginBottom: '24px',
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by role title (e.g., Full Stack, React)..."
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
        </div>

        <div style={{ flex: '1 1 180px' }}>
          <select
            className="form-select"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          >
            <option value="">Filter by Skill (All)</option>
            <option value="React">React</option>
            <option value="Node.js">Node.js</option>
            <option value="SQL">SQL</option>
            <option value="MongoDB">MongoDB</option>
            <option value="JavaScript">JavaScript</option>
          </select>
        </div>

        <div style={{ flex: '1 1 180px' }}>
          <select
            className="form-select"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">Location (All)</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        {(roleFilter || skillFilter || locationFilter) && (
          <button
            onClick={() => {
              setRoleFilter('');
              setSkillFilter('');
              setLocationFilter('');
            }}
            className="btn btn-secondary"
            style={{ padding: '10px 14px', fontSize: '12px' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <p style={{ color: '#94a3b8' }}>Loading skill-aligned job recommendations...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Briefcase size={36} color="#64748b" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No matching jobs found</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
            Try broadening your search query or removing filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span className="badge badge-info" style={{ fontSize: '10px', marginBottom: '6px' }}>
                      DEMO LISTING
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                      {job.title}
                    </h3>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#a5b4fc', marginTop: '2px' }}>
                      {job.company}
                    </div>
                  </div>

                  {/* Match Meter */}
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        color: job.matchPercentage >= 70 ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {job.matchPercentage}%
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>
                      Skill Match
                    </div>
                  </div>
                </div>

                {/* Meta details */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: '#94a3b8', margin: '12px 0 16px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} />
                    <span>{job.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={13} />
                    <span>{job.salary}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    <span>{job.experienceLevel}</span>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
                  {job.description}
                </p>

                {/* Matched vs Missing Skills */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                    Required Technical Stack:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {job.requiredSkills.map((sk, i) => {
                      const isMatched = job.matchedSkills?.includes(sk);
                      return (
                        <span
                          key={i}
                          className={`badge ${isMatched ? 'badge-success' : 'badge-warning'}`}
                          style={{ fontSize: '11px' }}
                        >
                          {isMatched && <CheckCircle2 size={11} />}
                          {sk}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => alert(`Simulated application submitted for "${job.title}" at ${job.company}!`)}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '12px', fontSize: '13px' }}
              >
                <span>Simulate Demo Application</span>
                <ExternalLink size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
