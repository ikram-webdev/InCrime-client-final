import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/* ─── Design Tokens ─────────────────────────────────────── */
const T = {
  navy:    '#0d2a3a',
  navyMid: '#153447',
  navyLight:'#1e4460',
  gold:    '#FFD700',
  goldSoft:'#fff0a0',
  bg:      '#f0f3f7',
  white:   '#ffffff',
  danger:  '#e53935',
  success: '#2e7d32',
  warn:    '#fb8c00',
  info:    '#1565c0',
  purple:  '#6a1b9a',
  text:    '#1a2533',
  muted:   '#8795a1',
  border:  '#e4eaf0',
};

/* ─── Global CSS ─────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body { font-family: 'Plus Jakarta Sans', sans-serif; background: ${T.bg}; color: ${T.text}; }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(13,42,58,0.2); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(13,42,58,0.35); }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, ${T.navy} 0%, ${T.navyMid} 60%, #0a1f2d 100%);
      position: fixed; left: 0; top: 0; height: 100vh;
      display: flex; flex-direction: column;
      z-index: 200;
      transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s;
      box-shadow: 4px 0 24px rgba(0,0,0,0.15);
    }
    .sidebar-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 199;
      backdrop-filter: blur(2px);
      transition: opacity 0.3s;
    }
    .main { margin-left: 260px; min-height: 100vh; padding: 32px 28px; transition: margin 0.3s; }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 18px; border-radius: 10px;
      cursor: pointer; font-size: 14px; font-weight: 500;
      color: rgba(255,255,255,0.72);
      border-left: 3px solid transparent;
      transition: all 0.2s;
      margin-bottom: 2px;
      user-select: none;
    }
    .nav-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
    .nav-item.active {
      background: rgba(255,215,0,0.13);
      border-left-color: ${T.gold};
      color: ${T.gold}; font-weight: 700;
    }
    .nav-item .icon { font-size: 18px; flex-shrink: 0; }

    .card {
      background: ${T.white}; border-radius: 16px;
      box-shadow: 0 2px 16px rgba(13,42,58,0.07);
      overflow: hidden;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .card:hover { box-shadow: 0 6px 28px rgba(13,42,58,0.11); }

    .stat-card {
      background: ${T.white}; border-radius: 16px;
      padding: 22px 20px;
      box-shadow: 0 2px 16px rgba(13,42,58,0.07);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative; overflow: hidden;
    }
    .stat-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: var(--accent);
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(13,42,58,0.12); }

    table { width: 100%; border-collapse: collapse; }
    thead tr { background: ${T.navy}; }
    thead th {
      padding: 13px 16px; text-align: left;
      color: ${T.gold}; font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.6px;
      white-space: nowrap;
    }
    tbody tr { border-bottom: 1px solid ${T.border}; transition: background 0.15s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: #f5f8fc; }
    tbody td { padding: 13px 16px; font-size: 14px; color: ${T.text}; vertical-align: middle; }

    .btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 13px; border-radius: 7px;
      border: none; cursor: pointer; font-weight: 600; font-size: 12px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
      white-space: nowrap;
    }
    .btn:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.12); }
    .btn:active { transform: scale(0.97); }

    .badge {
      display: inline-block; padding: 3px 11px;
      border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
    }

    .input-field {
      padding: 10px 14px; border: 1.5px solid ${T.border};
      border-radius: 9px; font-size: 14px; font-family: inherit;
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
      background: #fff; color: ${T.text};
    }
    .input-field:focus { border-color: ${T.navy}; box-shadow: 0 0 0 3px rgba(13,42,58,0.1); }

    .alert {
      padding: 13px 18px; border-radius: 10px;
      font-weight: 600; font-size: 14px;
      display: flex; align-items: center; gap: 10px;
      animation: slideDown 0.3s ease;
    }
    @keyframes slideDown { from { opacity:0; transform:translateY(-10px);} to { opacity:1; transform:translateY(0);} }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
      padding: 20px; backdrop-filter: blur(3px);
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
    .modal-box {
      background: #fff; border-radius: 20px; padding: 32px;
      width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
      animation: scaleIn 0.25s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes scaleIn { from { opacity:0; transform:scale(0.92);} to { opacity:1; transform:scale(1);} }

    .empty-state { text-align: center; padding: 52px 20px; color: ${T.muted}; }
    .empty-state .emo { font-size: 48px; margin-bottom: 12px; }

    .hamburger {
      display: none; position: fixed; top: 16px; left: 16px; z-index: 300;
      background: ${T.navy}; color: ${T.gold}; border: none;
      width: 42px; height: 42px; border-radius: 10px;
      font-size: 20px; cursor: pointer; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      transition: background 0.2s;
    }

    @media (max-width: 900px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); box-shadow: 8px 0 40px rgba(0,0,0,0.25); }
      .sidebar-overlay.show { display: block; }
      .main { margin-left: 0; padding: 24px 16px; padding-top: 72px; }
      .hamburger { display: flex; }
    }

    @media (max-width: 600px) {
      .main { padding: 20px 12px; padding-top: 72px; }
      .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
      .two-col { grid-template-columns: 1fr !important; }
      .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      tbody td, thead th { white-space: nowrap; }
    }
    @media (max-width: 360px) {
      .stats-grid { grid-template-columns: 1fr !important; }
    }

    .page-title { font-size: 24px; font-weight: 800; color: ${T.navy}; }
    .page-sub { font-size: 13px; color: ${T.muted}; margin-top: 3px; }

    .loading-wrap { text-align: center; padding: 60px 20px; color: ${T.muted}; }
    .spinner {
      width: 44px; height: 44px; border: 3px solid ${T.border};
      border-top-color: ${T.navy}; border-radius: 50%;
      animation: spin 0.75s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    code { font-family: 'JetBrains Mono', monospace; background: #f0f4f8; padding: 2px 7px; border-radius: 5px; font-size: 12px; color: ${T.navy}; }

    .section-header { font-size: 17px; font-weight: 700; color: ${T.navy}; margin-bottom: 18px; }

    .sidebar-logo-wrap { padding: 24px 20px 18px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .sidebar-logo { font-size: 22px; font-weight: 800; color: ${T.gold}; display: flex; align-items: center; gap: 9px; }
    .sidebar-logo-sub { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 4px; letter-spacing: 0.5px; text-transform: uppercase; }

    .sidebar-footer { padding: 18px 16px; border-top: 1px solid rgba(255,255,255,0.08); }
    .sidebar-user { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .sidebar-user-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(255,215,0,0.2); border: 1.5px solid rgba(255,215,0,0.4);
      display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
    }
    .ghost-btn {
      width: 100%; padding: 8px 12px; background: none;
      border: 1.5px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.8);
      border-radius: 8px; cursor: pointer; font-size: 12px; font-family: inherit;
      font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;
      transition: all 0.2s; margin-bottom: 7px;
    }
    .ghost-btn:hover { border-color: rgba(255,255,255,0.5); color: #fff; background: rgba(255,255,255,0.06); }
    .logout-btn {
      width: 100%; padding: 8px 12px; background: rgba(229,57,53,0.15);
      border: 1.5px solid rgba(229,57,53,0.4); color: #ff7575;
      border-radius: 8px; cursor: pointer; font-size: 12px; font-family: inherit;
      font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;
      transition: all 0.2s;
    }
    .logout-btn:hover { background: rgba(229,57,53,0.28); color: #ff9999; }
  `}</style>
);

/* ─── Helpers ────────────────────────────────────────────── */
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

const Badge = ({ children, color = T.info, bg }) => (
  <span className="badge" style={{ background: bg || `${color}18`, color }}>
    {children}
  </span>
);

const Btn = ({ onClick, color = T.navy, textColor = '#fff', children, small, fullWidth, disabled }) => (
  <button className="btn" onClick={onClick} disabled={disabled}
    style={{ background: color, color: textColor, width: fullWidth ? '100%' : undefined, opacity: disabled ? 0.6 : 1 }}>
    {children}
  </button>
);

const Loading = () => (
  <div className="loading-wrap">
    <div className="spinner" />
    <p style={{ fontWeight: 600 }}>Loading…</p>
  </div>
);

const Empty = ({ msg = 'Nothing here yet' }) => (
  <div className="empty-state">
    <div className="emo">📭</div>
    <p style={{ fontWeight: 600, fontSize: 15 }}>{msg}</p>
  </div>
);

/* ─── Stat Card ──────────────────────────────────────────── */
const StatCard = ({ label, value, icon, accent }) => (
  <div className="stat-card" style={{ '--accent': accent }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 13, color: T.muted, fontWeight: 600, marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: T.navy, lineHeight: 1 }}>{value ?? '—'}</div>
      </div>
      <div style={{ fontSize: 30, opacity: 0.85, background: `${accent}14`, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
        {icon}
      </div>
    </div>
  </div>
);

/* ─── Table Wrapper ──────────────────────────────────────── */
const DataTable = ({ headers, children }) => (
  <div className="card">
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  </div>
);

/* ─── Modal ──────────────────────────────────────────────── */
function AdminModal({ data, onClose, onSuccess }) {
  const [form, setForm] = useState(data.data || {});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    try {
      if (data.type === 'addCategory')    { await axios.post('/api/categories', form); onSuccess('Category created! ✅'); }
      else if (data.type === 'editCategory') { await axios.put(`/api/categories/${form._id}`, form); onSuccess('Category updated! ✅'); }
      else if (data.type === 'editTemplate') { await axios.put(`/api/templates/${form._id}`, form); onSuccess('Template updated! ✅'); }
    } catch (e) { alert(e.response?.data?.message || 'Error saving'); }
    finally { setLoading(false); }
  };

  const inp = (key, placeholder, type = 'text') => (
    <input className="input-field" style={{ width: '100%', marginBottom: 14 }}
      type={type} value={form[key] || ''} placeholder={placeholder}
      onChange={e => set(key, e.target.value)} />
  );

  const titles = {
    addCategory: '➕ Add Category', editCategory: '✏️ Edit Category',
    editTemplate: '✏️ Edit Template', viewContact: '📩 Contact Details'
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: T.navy }}>{titles[data.type]}</h3>
          <button onClick={onClose} style={{ background: T.border, border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>✕</button>
        </div>

        {data.type === 'viewContact' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['Name', data.data.name], ['Email', data.data.email], ['Phone', data.data.phone || '—'], ['Subject', data.data.subject]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{v}</div>
              </div>
            ))}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>Message</div>
              <div style={{ background: T.bg, padding: '14px 16px', borderRadius: 10, lineHeight: 1.75, fontSize: 14 }}>{data.data.message}</div>
            </div>
            {data.data.rating && <div style={{ fontSize: 14 }}>Rating: {'⭐'.repeat(data.data.rating)}</div>}
          </div>
        ) : (
          <>
            {(data.type === 'addCategory' || data.type === 'editCategory') && (<>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Category Name</label>
              {inp('name', 'e.g. Criminal Cases')}
              <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Type</label>
              <select className="input-field" style={{ width: '100%', marginBottom: 14 }} value={form.type || 'other'} onChange={e => set('type', e.target.value)}>
                {['criminal','family','civil','other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Icon (emoji)</label>
              {inp('icon', 'e.g. ⚖️')}
              <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Description</label>
              <textarea className="input-field" style={{ width: '100%', height: 80, resize: 'vertical', marginBottom: 14 }}
                placeholder="Category description…" value={form.description || ''} onChange={e => set('description', e.target.value)} />
            </>)}

            {data.type === 'editTemplate' && (<>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Template Title</label>
              {inp('title', 'Template title')}
              <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Description</label>
              <textarea className="input-field" style={{ width: '100%', height: 80, resize: 'vertical', marginBottom: 14 }}
                value={form.description || ''} onChange={e => set('description', e.target.value)} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', userSelect: 'none', marginBottom: 14 }}>
                <input type="checkbox" checked={form.isActive !== false} onChange={e => set('isActive', e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: T.navy, cursor: 'pointer' }} />
                Template is Active
              </label>
            </>)}

            <Btn onClick={handleSave} disabled={loading} fullWidth color={T.navy} textColor={T.gold}>
              {loading ? '⏳ Saving…' : '💾 Save Changes'}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',    label: 'Dashboard',        icon: '📊' },
  { id: 'users',        label: 'Users',             icon: '👥' },
  { id: 'applications', label: 'Applications',      icon: '📋' },
  { id: 'templates',    label: 'Templates',         icon: '📄' },
  { id: 'categories',   label: 'Categories',        icon: '📂' },
  { id: 'contacts',     label: 'Reviews & Contact', icon: '💬' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [search, setSearch] = useState('');
  const [modalData, setModalData] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const load = useCallback(async (fn) => {
    setLoading(true);
    try { await fn(); }
    catch (e) { showAlert('Error loading data', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const map = {
      dashboard:    () => axios.get('/api/admin/stats').then(r => r.data.success && setStats(r.data)),
      users:        () => axios.get(`/api/admin/users?search=${search}`).then(r => r.data.success && setUsers(r.data.users)),
      applications: () => axios.get('/api/admin/applications').then(r => r.data.success && setApplications(r.data.applications)),
      contacts:     () => axios.get('/api/admin/contacts').then(r => r.data.success && setContacts(r.data.contacts)),
      categories:   () => axios.get('/api/categories').then(r => r.data.success && setCategories(r.data.categories)),
      templates:    () => axios.get('/api/templates/all').then(r => r.data.success && setTemplates(r.data.templates)),
    };
    if (map[activePage]) load(map[activePage]);
  }, [activePage]);

  const fetchUsers = () => load(() => axios.get(`/api/admin/users?search=${search}`).then(r => r.data.success && setUsers(r.data.users)));

  const toggleUser = async (id) => {
    try { const { data } = await axios.put(`/api/admin/users/${id}/toggle`); if (data.success) { showAlert(data.message); fetchUsers(); } }
    catch { showAlert('Error toggling user', 'error'); }
  };
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their data?')) return;
    try { await axios.delete(`/api/admin/users/${id}`); showAlert('User deleted'); fetchUsers(); }
    catch { showAlert('Error deleting user', 'error'); }
  };
  const deleteTemplate = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try { await axios.delete(`/api/templates/${id}`); showAlert('Template deleted'); load(() => axios.get('/api/templates/all').then(r => r.data.success && setTemplates(r.data.templates))); }
    catch { showAlert('Error deleting template', 'error'); }
  };
  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await axios.delete(`/api/categories/${id}`); showAlert('Category deleted'); load(() => axios.get('/api/categories').then(r => r.data.success && setCategories(r.data.categories))); }
    catch { showAlert('Error deleting category', 'error'); }
  };
  const updateContactStatus = async (id, status) => {
    try { await axios.put(`/api/admin/contacts/${id}/status`, { status }); showAlert('Contact updated'); load(() => axios.get('/api/admin/contacts').then(r => r.data.success && setContacts(r.data.contacts))); }
    catch { showAlert('Error updating contact', 'error'); }
  };

  const navigate2 = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const currentNav = NAV.find(n => n.id === activePage);

  return (
    <>
      <GlobalStyle />

      {/* Hamburger */}
      <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>

      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo">⚖️ InCrime</div>
          <div className="sidebar-logo-sub">Administration Panel</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV.map(item => (
            <div key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => navigate2(item.id)}>
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">👤</div>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName}</span>
          </div>
          <button className="ghost-btn" onClick={() => navigate('/')}>🌐 View Site</button>
          <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">{currentNav?.icon} {currentNav?.label}</h1>
            <p className="page-sub">InCrime Administration Panel</p>
          </div>
          <button onClick={() => window.location.reload()}
            style={{ background: T.white, border: `1.5px solid ${T.border}`, padding: '9px 18px', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, color: T.navy, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            🔄 Refresh
          </button>
        </div>

        {/* Alert */}
        {alert && (
          <div className="alert" style={{
            background: alert.type === 'error' ? '#ffebee' : '#e8f5e9',
            color: alert.type === 'error' ? '#c62828' : T.success,
            border: `1px solid ${alert.type === 'error' ? '#ffcdd2' : '#c8e6c9'}`,
            marginBottom: 22
          }}>
            {alert.type === 'error' ? '❌' : '✅'} {alert.msg}
          </div>
        )}

        {/* Loading */}
        {loading && <Loading />}

        {/* ── DASHBOARD ── */}
        {activePage === 'dashboard' && !loading && stats && (<>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 26 }}>
            <StatCard label="Total Users"        value={stats.stats.totalUsers}        icon="👥" accent={T.info} />
            <StatCard label="Total Applications" value={stats.stats.totalApplications} icon="📋" accent={T.success} />
            <StatCard label="Templates"          value={stats.stats.totalTemplates}    icon="📄" accent={T.warn} />
            <StatCard label="New Messages"       value={stats.stats.newContacts}       icon="💬" accent={T.purple} />
          </div>

          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <div className="section-header">🆕 Recent Users</div>
              {stats.recentUsers.map((u, i) => (
                <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < stats.recentUsers.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `${T.navy}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{u.fullName}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>@{u.username}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: T.muted }}>{fmtDate(u.createdAt)}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div className="section-header">📊 Applications by Type</div>
              {stats.applicationsByType.map(t => (
                <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{t._id || 'Unknown'}</span>
                  <span style={{ background: T.navy, color: T.gold, padding: '3px 14px', borderRadius: 20, fontWeight: 800, fontSize: 13 }}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ── USERS ── */}
        {activePage === 'users' && !loading && (<>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <input className="input-field" style={{ flex: 1, minWidth: 200 }}
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchUsers()}
              placeholder="🔍 Search users…" />
            <Btn onClick={fetchUsers} color={T.navy} textColor={T.gold}>Search</Btn>
          </div>
          {users.length > 0 ? (
            <DataTable headers={['#', 'Name', 'Username', 'Email / Phone', 'Status', 'Joined', 'Actions']}>
              {users.map((u, i) => (
                <tr key={u._id}>
                  <td style={{ padding: '13px 16px', color: T.muted, fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: '13px 16px' }}><strong>{u.fullName}</strong></td>
                  <td style={{ padding: '13px 16px', color: T.muted, fontSize: 13 }}>@{u.username}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13 }}>{u.email || u.phone || '—'}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <Badge color={u.isActive ? T.success : T.danger}>{u.isActive ? '✅ Active' : '🚫 Inactive'}</Badge>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: T.muted }}>{fmtDate(u.createdAt)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <Btn onClick={() => toggleUser(u._id)} color={u.isActive ? T.warn : T.success}>{u.isActive ? '🚫 Deactivate' : '✅ Activate'}</Btn>
                    <Btn onClick={() => deleteUser(u._id)} color={T.danger}>🗑️ Delete</Btn>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : <Empty msg="No users found" />}
        </>)}

        {/* ── APPLICATIONS ── */}
        {activePage === 'applications' && !loading && (
          applications.length > 0 ? (
            <DataTable headers={['#', 'User', 'Template', 'Category', 'Status', 'Date']}>
              {applications.map((a, i) => (
                <tr key={a._id}>
                  <td style={{ padding: '13px 16px', color: T.muted, fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <strong>{a.user?.fullName || '—'}</strong>
                    <div style={{ fontSize: 12, color: T.muted }}>@{a.user?.username}</div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13 }}>{a.templateTitle || a.templateSlug}</td>
                  <td style={{ padding: '13px 16px' }}><Badge color={T.info}>{a.categoryType || '—'}</Badge></td>
                  <td style={{ padding: '13px 16px' }}><Badge color={T.purple}>{a.status}</Badge></td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: T.muted }}>{fmtDate(a.createdAt)}</td>
                </tr>
              ))}
            </DataTable>
          ) : <Empty msg="No applications found" />
        )}

        {/* ── TEMPLATES ── */}
        {activePage === 'templates' && !loading && (
          templates.length > 0 ? (
            <DataTable headers={['#', 'Title', 'Slug', 'Category', 'Usage', 'Status', 'Actions']}>
              {templates.map((t, i) => (
                <tr key={t._id}>
                  <td style={{ padding: '13px 16px', color: T.muted, fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: '13px 16px' }}><strong>{t.title}</strong></td>
                  <td style={{ padding: '13px 16px' }}><code>{t.slug}</code></td>
                  <td style={{ padding: '13px 16px', fontSize: 13 }}>{t.category?.name || t.categoryType}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13 }}>{t.usageCount || 0}</td>
                  <td style={{ padding: '13px 16px' }}><Badge color={t.isActive ? T.success : T.danger}>{t.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td style={{ padding: '13px 16px' }}>
                    <Btn onClick={() => setModalData({ type: 'editTemplate', data: t })} color={T.navy}>✏️ Edit</Btn>
                    <Btn onClick={() => deleteTemplate(t._id)} color={T.danger}>🗑️</Btn>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : <Empty msg="No templates found" />
        )}

        {/* ── CATEGORIES ── */}
        {activePage === 'categories' && !loading && (<>
          <div style={{ marginBottom: 18 }}>
            <Btn onClick={() => setModalData({ type: 'addCategory' })} color={T.navy} textColor={T.gold}>➕ Add Category</Btn>
          </div>
          {categories.length > 0 ? (
            <DataTable headers={['#', 'Icon', 'Name', 'Type', 'Status', 'Created', 'Actions']}>
              {categories.map((c, i) => (
                <tr key={c._id}>
                  <td style={{ padding: '13px 16px', color: T.muted, fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: '13px 16px', fontSize: 24 }}>{c.icon}</td>
                  <td style={{ padding: '13px 16px' }}><strong>{c.name}</strong></td>
                  <td style={{ padding: '13px 16px' }}><Badge color={T.info}>{c.type}</Badge></td>
                  <td style={{ padding: '13px 16px' }}><Badge color={c.isActive ? T.success : T.danger}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: T.muted }}>{fmtDate(c.createdAt)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <Btn onClick={() => setModalData({ type: 'editCategory', data: c })} color={T.navy}>✏️ Edit</Btn>
                    <Btn onClick={() => deleteCategory(c._id)} color={T.danger}>🗑️</Btn>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : <Empty msg="No categories found" />}
        </>)}

        {/* ── CONTACTS ── */}
        {activePage === 'contacts' && !loading && (
          contacts.length > 0 ? (
            <DataTable headers={['#', 'Name', 'Email', 'Subject', 'Type', 'Rating', 'Status', 'Date', 'Actions']}>
              {contacts.map((c, i) => (
                <tr key={c._id}>
                  <td style={{ padding: '13px 16px', color: T.muted, fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: '13px 16px' }}><strong>{c.name}</strong></td>
                  <td style={{ padding: '13px 16px', fontSize: 13 }}>{c.email}</td>
                  <td style={{ padding: '13px 16px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{c.subject}</td>
                  <td style={{ padding: '13px 16px' }}><Badge color={T.warn}>{c.type}</Badge></td>
                  <td style={{ padding: '13px 16px', fontSize: 13 }}>{c.rating ? '⭐'.repeat(c.rating) : '—'}</td>
                  <td style={{ padding: '13px 16px' }}><Badge color={c.status === 'new' ? T.info : T.success}>{c.status}</Badge></td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: T.muted }}>{fmtDate(c.createdAt)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <Btn onClick={() => setModalData({ type: 'viewContact', data: c })} color={T.navy}>👁️ View</Btn>
                    <Btn onClick={() => updateContactStatus(c._id, 'read')} color={T.warn}>✓ Read</Btn>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : <Empty msg="No contacts found" />
        )}
      </main>

      {/* Modal */}
      {modalData && (
        <AdminModal
          data={modalData}
          onClose={() => setModalData(null)}
          onSuccess={(msg) => {
            showAlert(msg);
            setModalData(null);
            load(() => axios.get('/api/categories').then(r => r.data.success && setCategories(r.data.categories)));
            load(() => axios.get('/api/templates/all').then(r => r.data.success && setTemplates(r.data.templates)));
          }}
        />
      )}
    </>
  );
}
