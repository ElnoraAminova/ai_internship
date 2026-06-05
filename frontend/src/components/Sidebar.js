import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard',       icon: '⊞',  label: 'Dashboard'     },
  { path: '/internships',     icon: '🏢',  label: 'Internships'   },
  { path: '/recommendations', icon: '✦',   label: 'Recommendations'},
  { path: '/profile',         icon: '◎',   label: 'My Profile'    },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">✦</div>
        <h1>AI Internship<br/>Matchmaker</h1>
      </div>

      {user && (
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', marginBottom:'1.25rem', background:'rgba(99,179,237,0.06)', borderRadius:'var(--radius)', border:'1px solid rgba(99,179,237,0.12)' }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-head)', fontWeight:700, fontSize:'0.875rem', flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ overflow:'hidden' }}>
            <div style={{ fontSize:'0.875rem', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item btn-danger" style={{width:'100%'}} onClick={handleLogout}>
          <span className="nav-icon">↩</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
