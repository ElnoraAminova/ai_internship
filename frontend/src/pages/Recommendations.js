import { useState, useEffect } from 'react';
import { getRecommendations } from '../utils/api';
import { MatchBadge } from '../components/MatchBadge';

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    setError('');
    getRecommendations()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load recommendations. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const recs = data?.recommendations || [];
  const filtered = filter === 'all' ? recs : recs.filter(r =>
    filter === 'high' ? r.match_score >= 70 :
    filter === 'medium' ? r.match_score >= 40 && r.match_score < 70 :
    r.match_score < 40
  );

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h2>AI Recommendations</h2>
          <p>Internships matched to your skill profile</p>
        </div>
        <button className="btn btn-primary" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {data?.student_skills && (
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div style={{ fontSize:'0.8rem', color:'var(--muted)', fontWeight:500, marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            Matching against your skills
          </div>
          <div className="skills-wrap">
            {data.student_skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {[['all','All'], ['high','Strong (70%+)'], ['medium','Fair (40–69%)'], ['low','Weak (<40%)']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding:'0.4rem 1rem', borderRadius:100, fontSize:'0.8rem', fontWeight:500, cursor:'pointer', border:'1px solid', transition:'all 0.15s',
              background: filter===val ? 'var(--accent)' : 'transparent',
              borderColor: filter===val ? 'var(--accent)' : 'var(--border)',
              color: filter===val ? 'white' : 'var(--muted)'
            }}>
            {label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading
        ? <div className="loading-screen"><div className="spinner"/><span>Analyzing matches…</span></div>
        : filtered.length === 0
          ? <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔍</div>
              <p style={{ color:'var(--muted)' }}>No internships match this filter.</p>
            </div>
          : <div className="card-grid">
              {filtered.map(rec => (
                <div key={rec.internship_id} className="card">
                  <div className="internship-card-header">
                    <div>
                      <div className="internship-title">{rec.title}</div>
                      <div className="internship-company">🏢 {rec.company}</div>
                    </div>
                    <MatchBadge score={rec.match_score} />
                  </div>

                  {/* Score Bar */}
                  <div style={{ margin:'1rem 0' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--muted)', marginBottom:'0.4rem' }}>
                      <span>Match Score</span><span>{rec.match_score}%</span>
                    </div>
                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{
                        width:`${rec.match_score}%`,
                        background: rec.match_score>=70?'linear-gradient(90deg,#48bb78,#68d391)':rec.match_score>=40?'linear-gradient(90deg,#e67e22,#f6ad55)':'linear-gradient(90deg,#e53e3e,#fc8181)'
                      }}/>
                    </div>
                  </div>

                  {/* Required skills */}
                  <div style={{ marginBottom:'0.75rem' }}>
                    <div className="internship-reqs-label">Required Skills</div>
                    <div className="skills-wrap">
                      {rec.requirements.map(r => (
                        <span key={r} className={`skill-tag ${rec.matched_skills.includes(r.toLowerCase()) ? 'matched' : 'missing'}`}>
                          {rec.matched_skills.includes(r.toLowerCase()) ? '✓' : '✗'} {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing skills hint */}
                  {rec.missing_skills.length > 0 && (
                    <div style={{ padding:'0.6rem 0.75rem', background:'rgba(252,129,129,0.06)', borderRadius:'var(--radius)', border:'1px solid rgba(252,129,129,0.15)', fontSize:'0.78rem', color:'var(--muted)' }}>
                      💡 Learn <strong style={{ color:'var(--danger)' }}>{rec.missing_skills.join(', ')}</strong> to improve this match
                    </div>
                  )}
                </div>
              ))}
            </div>
      }
    </div>
  );
}
