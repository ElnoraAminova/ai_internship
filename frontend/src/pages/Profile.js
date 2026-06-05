import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../utils/api';

const ALL_SKILLS = ['Python', 'SQL', 'Power BI', 'Excel', 'Tableau', 'R', 'Machine Learning', 'Data Visualization'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleSkill = (skill) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (skills.length === 0) { setError('Please select at least one skill'); return; }
    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), skills });
      updateUser({ ...user, name: name.trim(), skills });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h2>My Profile</h2>
        <p>Manage your information and skills</p>
      </div>

      {/* Avatar */}
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'2rem' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-head)', fontWeight:800, fontSize:'1.75rem', flexShrink:0 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily:'var(--font-head)', fontSize:'1.25rem', fontWeight:700 }}>{user?.name}</div>
          <div style={{ color:'var(--muted)', fontSize:'0.875rem' }}>{user?.email}</div>
          <div style={{ color:'var(--accent)', fontSize:'0.8rem', marginTop:'0.2rem' }}>
            {skills.length} skill{skills.length !== 1 ? 's' : ''} · Student Profile
          </div>
        </div>
      </div>

      <form className="card" onSubmit={handleSave}>
        {message && <div className="alert alert-success">{message}</div>}
        {error   && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: '0.5rem' }}>
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" value={user?.email || ''} disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>Email cannot be changed</span>
        </div>

        <div className="form-group">
          <label className="form-label">
            Skills
            <span style={{ color:'var(--accent)', fontWeight:400, marginLeft:'0.5rem' }}>({skills.length} selected)</span>
          </label>
          <div className="skills-wrap">
            {ALL_SKILLS.map(skill => (
              <span
                key={skill}
                className={`skill-tag selectable ${skills.includes(skill) ? 'selected' : ''}`}
                onClick={() => toggleSkill(skill)}
              >
                {skills.includes(skill) ? '✓ ' : '+ '}{skill}
              </span>
            ))}
          </div>
        </div>

        <div style={{ paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : '✓ Save Changes'}
          </button>
        </div>
      </form>

      {/* Skills summary */}
      {skills.length > 0 && (
        <div className="card" style={{ marginTop:'1.25rem' }}>
          <div style={{ fontFamily:'var(--font-head)', fontWeight:600, marginBottom:'0.75rem', fontSize:'0.95rem' }}>
            Current Skills
          </div>
          <div className="skills-wrap">
            {skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
