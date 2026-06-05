import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRecommendations } from '../utils/api';
import { MatchBadge } from '../components/MatchBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations()
      .then(res => setRecs(res.data.recommendations.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skills = user?.skills || [];
  const topMatch = recs[0];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
          <div style={{ width:48, height:48, borderRadius:'14px', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-head)', fontWeight:800, fontSize:'1.1rem' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.6rem', fontWeight:700 }}>
              Hello, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p style={{ color:'var(--muted)', fontSize:'0.875rem' }}>Here's your internship overview</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">SKILLS</span>
          <span className="stat-value" style={{ background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{skills.length}</span>
          <span className="stat-sub">skills in your profile</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">MATCHES FOUND</span>
          <span className="stat-value" style={{ color:'var(--accent-3)' }}>{recs.length > 0 ? recs.length + '+' : '—'}</span>
          <span className="stat-sub">internships matched</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">TOP MATCH</span>
          <span className="stat-value" style={{ color:'#f6ad55' }}>{topMatch ? `${topMatch.match_score}%` : '—'}</span>
          <span className="stat-sub">{topMatch?.title || 'Run recommendations'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">STATUS</span>
          <span className="stat-value" style={{ color:'var(--accent-3)', fontSize:'1.1rem', paddingTop:'0.5rem' }}>Active</span>
          <span className="stat-sub">profile is live</span>
        </div>
      </div>

      {/* Skills */}
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700 }}>Your Skills</h3>
          <button className="btn btn-outline" style={{ fontSize:'0.8rem', padding:'0.4rem 0.9rem' }} onClick={() => navigate('/profile')}>
            Edit Profile
          </button>
        </div>
        {skills.length > 0
          ? <div className="skills-wrap">{skills.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
          : <p style={{ color:'var(--muted)', fontSize:'0.875rem' }}>No skills added yet. <button onClick={() => navigate('/profile')} style={{ color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>Add some →</button></p>
        }
      </div>

      {/* Top Recommendations */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700 }}>Top Matches</h3>
          <button className="btn btn-outline" style={{ fontSize:'0.8rem', padding:'0.4rem 0.9rem' }} onClick={() => navigate('/recommendations')}>
            View All →
          </button>
        </div>

        {loading
          ? <div className="loading-screen"><div className="spinner"/><span>Loading matches…</span></div>
          : recs.length === 0
            ? (
              <div className="card" style={{ textAlign:'center', padding:'2rem' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🎯</div>
                <p style={{ color:'var(--muted)', marginBottom:'1rem' }}>No recommendations yet.</p>
                <button className="btn btn-primary" onClick={() => navigate('/recommendations')}>Get Recommendations</button>
              </div>
            )
            : (
              <div className="card-grid">
                {recs.map(rec => (
                  <div key={rec.internship_id} className="card">
                    <div className="internship-card-header">
                      <div>
                        <div className="internship-title">{rec.title}</div>
                        <div className="internship-company">🏢 {rec.company}</div>
                      </div>
                      <MatchBadge score={rec.match_score} />
                    </div>
                    <div style={{ marginTop:'1rem' }}>
                      <div className="score-bar-wrap">
                        <div className="score-bar-label"><span>Match</span><span>{rec.match_score}%</span></div>
                        <div className="score-bar-track">
                          <div className="score-bar-fill" style={{ width:`${rec.match_score}%`, background: rec.match_score>=70?'linear-gradient(90deg,#48bb78,#68d391)':rec.match_score>=40?'linear-gradient(90deg,#e67e22,#f6ad55)':'linear-gradient(90deg,#e53e3e,#fc8181)' }}/>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
        }
      </div>
    </div>
  );
}
