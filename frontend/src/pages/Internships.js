import { useState, useEffect } from 'react';
import { getInternships } from '../utils/api';

const ICONS = { 'Data Analyst Intern':'📊', 'BI Analyst Intern':'📈', 'SQL Developer Intern':'🗄️', 'Python Developer Intern':'🐍', 'Data Science Intern':'🤖', 'Tableau Analyst Intern':'📉' };

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getInternships()
      .then(res => setInternships(res.data.internships))
      .catch(() => setError('Failed to load internships. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = internships.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h2>Internship Listings</h2>
        <p>Browse all available internship positions</p>
      </div>

      <div style={{ marginBottom:'1.5rem' }}>
        <input
          className="form-input"
          type="text"
          placeholder="Search by title or company…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading
        ? <div className="loading-screen"><div className="spinner"/><span>Loading internships…</span></div>
        : (
          <>
            <p style={{ color:'var(--muted)', fontSize:'0.875rem', marginBottom:'1.25rem' }}>
              Showing <strong style={{ color:'var(--text)' }}>{filtered.length}</strong> internship{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="card-grid">
              {filtered.map(i => (
                <div key={i.id} className="card" style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
                    <div style={{ fontSize:'1.75rem', flexShrink:0 }}>{ICONS[i.title] || '💼'}</div>
                    <div style={{ flex:1 }}>
                      <div className="internship-title">{i.title}</div>
                      <div className="internship-company">{i.company}</div>
                    </div>
                  </div>

                  <div>
                    <div className="internship-reqs-label">Requirements</div>
                    <div className="skills-wrap">
                      {(i.requirements || []).map(req => (
                        <span key={req} className="skill-tag">{req}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', paddingTop:'0.5rem', borderTop:'1px solid var(--border)', marginTop:'auto' }}>
                    <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>🟢 Open</span>
                    <span style={{ fontSize:'0.75rem', color:'var(--muted)', marginLeft:'auto' }}>Internship #{i.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      }
    </div>
  );
}
