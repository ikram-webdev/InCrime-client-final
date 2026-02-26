import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  MdBalance, MdGavel, MdFamilyRestroom, MdSecurity,
  MdArrowForward, MdArrowUpward, MdEmail, MdPhone,
  MdLocationOn, MdStar, MdVerified
} from 'react-icons/md';
import {
  FiShield, FiFileText, FiDownload, FiMessageSquare,
  FiChevronRight, FiUsers, FiClock, FiAward, FiZap
} from 'react-icons/fi';
import { BsWhatsapp, BsShieldLockFill, BsPeopleFill } from 'react-icons/bs';

/* ─── DATA ─────────────────────────────────────────────────────────── */
const criminalCases = [
  { key: 'bail-pre',          title: 'Pre-Bail Application',    desc: 'Request to prevent arrest before trial',                path: '/templates/criminal/bail-pre',           Icon: MdBalance },
  { key: 'bail-post',         title: 'Post-Bail Application',   desc: 'Request for release or modify bail after granted',      path: '/templates/criminal/bail-post',          Icon: FiShield },
  { key: 'theft',             title: 'Theft Complaint',         desc: 'Reporting theft or robbery incidents',                  path: '/templates/criminal/theft',              Icon: BsShieldLockFill },
  { key: 'attendance',        title: 'Attendance Excused',      desc: 'Cases where court attendance is excused',              path: '/templates/criminal/attendance-excused', Icon: FiFileText },
  { key: 'harassment',        title: 'Harassment',              desc: 'Legal protection against harassment and abuse',         path: '/templates/criminal/harassment',         Icon: MdSecurity },
  { key: 'consent',           title: 'Consent Application',     desc: 'Cases related to mutual agreement issues',             path: '/templates/criminal/consent',            Icon: FiUsers },
  { key: 'challan',           title: 'Challan Application',     desc: 'Court petition for challan related matters',           path: '/templates/criminal/challan',            Icon: MdGavel },
];

const familyCases = [
  { key: 'nikah',    title: 'Nikah Nama Form',          desc: 'Register or correct marriage legal records',           path: '/templates/family/nikah-nama',         Icon: MdFamilyRestroom },
  { key: 'custody',  title: 'Child Custody',            desc: 'Guardianship and custody applications',                path: '/templates/family/child-custody',      Icon: BsPeopleFill },
  { key: 'tansik',   title: 'Annulment of Marriage',    desc: 'Request to declare marriage null and void',            path: '/templates/family/tansik-nikah',       Icon: FiFileText },
  { key: 'second',   title: 'Second Marriage',          desc: 'Court permission for second marriage',                 path: '/templates/family/second-marriage',    Icon: FiUsers },
  { key: 'azad',     title: 'Release from Darul-Aman', desc: 'Application for release from Dar-ul-Aman',             path: '/templates/family/azad-darul-aman',    Icon: FiShield },
  { key: 'meeting',  title: 'Meeting at Dar-ul-Aman',  desc: 'Permission to meet someone in Dar-ul-Aman',            path: '/templates/family/meeting-darul-aman', Icon: FiMessageSquare },
  { key: 'sending',  title: 'Sending to Dar-ul-Aman',  desc: 'Application to send woman to Dar-ul-Aman',             path: '/templates/family/sending-darul-aman', Icon: MdGavel },
];

/* ─── ANIMATED COUNTER ─────────────────────────────────────────────── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const numeric = parseInt(target.toString().replace(/\D/g, ''), 10);
        let start = 0;
        const duration = 1800;
        const step = Math.ceil(numeric / (duration / 16));
        const timer = setInterval(() => {
          start = Math.min(start + step, numeric);
          setCount(start);
          if (start >= numeric) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const display = target.toString().includes('+') ? `${count.toLocaleString()}+` : count.toString();
  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── MAIN COMPONENT ────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [showTop, setShowTop] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => { setShowTop(window.scrollY > 400); setScrollY(window.scrollY); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activePage]);

  const handleTemplateClick = (path) => {
    if (!isAuthenticated) { navigate('/login', { state: { from: path } }); return; }
    navigate(path);
  };

  /* ─── SUBCATEGORY GRID ─── */
  const SubGrid = ({ cases }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 20, marginTop: 10,
    }}>
      {cases.map((c, i) => (
        <div
          key={c.key}
          onClick={() => handleTemplateClick(c.path)}
          className="case-card"
          style={{ '--delay': `${i * 60}ms` }}
        >
          <div className="card-glow" />
          <div className="card-icon-wrap">
            <c.Icon size={22} />
          </div>
          <h4 className="card-title">{c.title}</h4>
          <p className="card-desc">{c.desc}</p>
          <div className="card-cta">
            Generate Document <FiChevronRight size={14} />
          </div>
        </div>
      ))}
    </div>
  );

  /* ─── CSS ─── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy: #0b1f2d;
      --navy-mid: #0d2a3a;
      --navy-light: #153447;
      --gold: #c9a227;
      --gold-light: #e2bb48;
      --gold-pale: #fdf3d8;
      --cream: #f7f4ef;
      --white: #ffffff;
      --text-muted: #6b7a8d;
      --border: #e8ecf0;
      --radius: 16px;
      --shadow: 0 8px 32px rgba(11,31,45,0.10);
      --shadow-lg: 0 20px 60px rgba(11,31,45,0.18);
    }

    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: #fff; color: var(--navy); }

    /* ── HERO ── */
    .hero-section {
      min-height: 100vh;
      background: var(--navy);
      position: relative;
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .hero-bg-img {
      position: absolute; inset: 0;
      background: url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1920&auto=format&fit=crop') center/cover no-repeat;
      opacity: 0.12;
    }
    .hero-grid-pattern {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .hero-glow {
      position: absolute; width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 70%);
      top: -100px; right: -100px; pointer-events: none;
    }
    .hero-glow-2 {
      position: absolute; width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(13,90,150,0.15) 0%, transparent 70%);
      bottom: -50px; left: 10%; pointer-events: none;
    }
    .hero-inner {
      position: relative; z-index: 2;
      width: 100%; max-width: 1240px;
      margin: 0 auto;
      padding: 100px 60px 80px;
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 60px;
      align-items: center;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(201,162,39,0.15);
      border: 1px solid rgba(201,162,39,0.35);
      color: var(--gold-light);
      padding: 7px 16px; border-radius: 50px;
      font-size: 13px; font-weight: 600; letter-spacing: 0.3px;
      margin-bottom: 24px;
    }
    .hero-h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(32px, 4.5vw, 58px);
      font-weight: 800; line-height: 1.15;
      color: var(--white);
      margin-bottom: 22px;
    }
    .hero-h1 span { color: var(--gold); }
    .hero-p {
      font-size: clamp(15px, 1.8vw, 18px);
      color: rgba(255,255,255,0.72);
      line-height: 1.75; max-width: 520px;
      margin-bottom: 38px;
    }
    .hero-btns {
      display: flex; gap: 14px; flex-wrap: wrap;
    }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 9px;
      background: var(--gold); color: var(--navy);
      border: none; padding: 14px 28px; border-radius: 50px;
      font-weight: 700; font-size: 15px; cursor: pointer;
      transition: all 0.25s; font-family: 'DM Sans', sans-serif;
      box-shadow: 0 4px 20px rgba(201,162,39,0.35);
    }
    .btn-primary:hover { background: var(--gold-light); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,162,39,0.45); }
    .btn-outline {
      display: inline-flex; align-items: center; gap: 9px;
      background: rgba(255,255,255,0.08); color: white;
      border: 1.5px solid rgba(255,255,255,0.28); padding: 14px 28px;
      border-radius: 50px; font-weight: 600; font-size: 15px;
      cursor: pointer; transition: all 0.25s; font-family: 'DM Sans', sans-serif;
      backdrop-filter: blur(8px);
    }
    .btn-outline:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.5); transform: translateY(-2px); }

    /* ── HERO CARD ── */
    .hero-card {
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 24px; padding: 40px 34px;
      text-align: center; cursor: pointer;
      transition: all 0.35s;
    }
    .hero-card:hover {
      transform: translateY(-10px);
      background: rgba(255,255,255,0.10);
      border-color: rgba(201,162,39,0.45);
      box-shadow: 0 24px 60px rgba(201,162,39,0.18);
    }
    .hero-card-icon {
      width: 72px; height: 72px; border-radius: 20px;
      background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px; box-shadow: 0 8px 24px rgba(201,162,39,0.35);
    }
    .hero-card h3 { font-family: 'Playfair Display', serif; font-size: 21px; color: var(--gold); margin-bottom: 12px; }
    .hero-card p  { color: rgba(255,255,255,0.72); font-size: 14px; line-height: 1.7; margin-bottom: 22px; }
    .hero-card-cta {
      display: inline-flex; align-items: center; gap: 7px;
      background: var(--gold); color: var(--navy);
      padding: 9px 22px; border-radius: 50px;
      font-weight: 700; font-size: 13px;
    }

    /* ── FLOATING STATS ── */
    .floating-stat {
      display: inline-flex; align-items: center; gap: 10px;
      background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);
      border-radius: 12px; padding: 12px 18px;
      margin-top: 30px; color: white;
    }
    .floating-stat-val { font-size: 20px; font-weight: 800; color: var(--gold); }
    .floating-stat-label { font-size: 12px; color: rgba(255,255,255,0.65); }

    /* ── WAVE DIVIDER ── */
    .wave-divider { display: block; width: 100%; overflow: hidden; line-height: 0; }

    /* ── STATS BAR ── */
    .stats-bar {
      background: var(--navy);
      padding: 48px 60px;
    }
    .stats-inner {
      max-width: 1100px; margin: 0 auto;
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
    }
    .stat-item {
      text-align: center; padding: 10px 20px;
      border-right: 1px solid rgba(255,255,255,0.10);
      transition: transform 0.3s;
    }
    .stat-item:last-child { border-right: none; }
    .stat-item:hover { transform: scale(1.04); }
    .stat-num { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 800; color: var(--gold); line-height: 1; }
    .stat-lbl { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 6px; font-weight: 500; letter-spacing: 0.3px; }

    /* ── SECTION SHARED ── */
    .section-label {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--gold-pale); color: var(--gold);
      padding: 5px 14px; border-radius: 50px;
      font-size: 12px; font-weight: 700; letter-spacing: 0.8px;
      text-transform: uppercase; margin-bottom: 14px;
    }
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(28px, 4vw, 44px);
      font-weight: 800; color: var(--navy); line-height: 1.2;
      margin-bottom: 16px;
    }
    .section-sub { font-size: 16px; color: var(--text-muted); line-height: 1.7; max-width: 540px; }
    .gold-line { width: 56px; height: 4px; background: linear-gradient(90deg, var(--gold), var(--gold-light)); border-radius: 2px; margin: 18px 0 48px; }

    /* ── CATEGORIES ── */
    .categories-section {
      padding: 96px 60px;
      background: var(--cream);
      position: relative; overflow: hidden;
    }
    .categories-section::before {
      content: ''; position: absolute;
      width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 70%);
      top: -100px; right: -100px; pointer-events: none;
    }
    .cat-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 1100px; }
    .cat-card {
      background: var(--white); border-radius: 20px; padding: 44px 40px;
      border: 2px solid transparent;
      box-shadow: var(--shadow);
      cursor: pointer; transition: all 0.35s; position: relative; overflow: hidden;
    }
    .cat-card::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
      opacity: 0; transition: opacity 0.35s;
    }
    .cat-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); border-color: var(--gold); }
    .cat-card:hover::after { opacity: 0.03; }
    .cat-card-inner { position: relative; z-index: 1; }
    .cat-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 14px; border-radius: 50px; font-size: 12px; font-weight: 700;
      margin-bottom: 20px;
    }
    .cat-badge.criminal { background: #fef2f2; color: #dc2626; }
    .cat-badge.family   { background: #f0fdf4; color: #16a34a; }
    .cat-card-icon {
      width: 60px; height: 60px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    .cat-card-icon.criminal { background: linear-gradient(135deg, #fef2f2, #fee2e2); color: #dc2626; }
    .cat-card-icon.family   { background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #16a34a; }
    .cat-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 800; color: var(--navy); margin-bottom: 12px; }
    .cat-desc  { font-size: 15px; color: var(--text-muted); line-height: 1.75; margin-bottom: 24px; }
    .cat-link  { display: inline-flex; align-items: center; gap: 8px; color: var(--navy); font-weight: 700; font-size: 14px; transition: gap 0.2s; }
    .cat-card:hover .cat-link { gap: 14px; color: var(--gold); }

    /* ── HOW IT WORKS ── */
    .how-section { padding: 96px 60px; background: var(--white); }
    .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; max-width: 1100px; }
    .step-card {
      background: var(--cream); border-radius: 20px; padding: 40px 32px;
      text-align: center; position: relative; overflow: hidden;
      transition: all 0.3s;
    }
    .step-card:hover { transform: translateY(-6px); box-shadow: var(--shadow); background: var(--white); }
    .step-num {
      position: absolute; top: 20px; right: 24px;
      font-family: 'Playfair Display', serif;
      font-size: 72px; font-weight: 800;
      color: rgba(201,162,39,0.08); line-height: 1;
      pointer-events: none;
    }
    .step-icon {
      width: 64px; height: 64px; border-radius: 18px;
      background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 22px; box-shadow: 0 8px 24px rgba(11,31,45,0.2);
    }
    .step-title { font-weight: 800; font-size: 19px; color: var(--navy); margin-bottom: 10px; }
    .step-desc  { font-size: 14px; color: var(--text-muted); line-height: 1.7; }
    .step-connector { display: none; }

    /* ── CASE CARDS ── */
    .case-card {
      background: var(--white); border-radius: var(--radius);
      padding: 28px 24px; cursor: pointer; position: relative; overflow: hidden;
      border: 1.5px solid var(--border);
      transition: all 0.3s;
    }
    .case-card .card-glow {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
      opacity: 0; transition: opacity 0.3s;
    }
    .case-card:hover { transform: translateY(-6px); border-color: var(--gold); box-shadow: 0 12px 40px rgba(201,162,39,0.14); }
    .case-card:hover .card-glow { opacity: 0.03; }
    .card-icon-wrap {
      width: 48px; height: 48px; border-radius: 13px;
      background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
      display: flex; align-items: center; justify-content: center;
      color: var(--gold); margin-bottom: 16px;
      transition: transform 0.3s;
      position: relative; z-index: 1;
    }
    .case-card:hover .card-icon-wrap { transform: scale(1.08); }
    .card-title {
      font-weight: 700; font-size: 16px; color: var(--navy);
      margin-bottom: 8px; position: relative; z-index: 1;
    }
    .card-desc {
      font-size: 13px; color: var(--text-muted); line-height: 1.65;
      margin-bottom: 18px; position: relative; z-index: 1;
    }
    .card-cta {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--gold-pale); color: var(--gold);
      padding: 7px 14px; border-radius: 50px;
      font-size: 12px; font-weight: 700;
      border: 1px solid rgba(201,162,39,0.25);
      transition: all 0.2s; position: relative; z-index: 1;
    }
    .case-card:hover .card-cta { background: var(--gold); color: var(--navy); }

    /* ── SUB-PAGE HEADER ── */
    .subpage-header {
      background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
      padding: 44px 60px; position: relative; overflow: hidden;
    }
    .subpage-header::after {
      content: ''; position: absolute; inset: 0;
      background-image: linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .subpage-header-inner { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .back-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.25);
      color: white; padding: 10px 20px; border-radius: 50px;
      font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;
      font-family: 'DM Sans', sans-serif;
    }
    .back-btn:hover { background: rgba(255,255,255,0.2); }
    .subpage-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; color: white; margin-bottom: 6px; }
    .subpage-sub { color: rgba(255,255,255,0.65); font-size: 15px; }

    /* ── FEATURES ── */
    .features-section {
      padding: 80px 60px;
      background: var(--navy);
      position: relative; overflow: hidden;
    }
    .features-section::before {
      content: ''; position: absolute; inset: 0;
      background-image: linear-gradient(rgba(201,162,39,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(201,162,39,0.03) 1px, transparent 1px);
      background-size: 50px 50px;
    }
    .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1100px; }
    .feature-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 16px; padding: 28px 22px; text-align: center;
      transition: all 0.3s; position: relative; z-index: 1;
    }
    .feature-card:hover {
      background: rgba(255,255,255,0.09);
      border-color: rgba(201,162,39,0.35);
      transform: translateY(-4px);
    }
    .feature-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: linear-gradient(135deg, rgba(201,162,39,0.2), rgba(201,162,39,0.08));
      border: 1px solid rgba(201,162,39,0.25);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; color: var(--gold);
    }
    .feature-title { font-weight: 700; font-size: 15px; color: white; margin-bottom: 8px; }
    .feature-desc  { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.65; }

    /* ── CONTACT ── */
    .contact-section {
      padding: 96px 60px;
      background: var(--cream);
    }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; max-width: 1100px; align-items: start; }
    .contact-item {
      display: flex; align-items: flex-start; gap: 16px;
      padding: 22px; background: var(--white);
      border-radius: 14px; margin-bottom: 14px;
      border: 1px solid var(--border);
      transition: all 0.25s;
    }
    .contact-item:hover { border-color: var(--gold); transform: translateX(4px); }
    .contact-icon {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: var(--navy); display: flex; align-items: center; justify-content: center; color: var(--gold);
    }
    .contact-label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .contact-val   { font-size: 15px; color: var(--navy); font-weight: 700; }

    /* ── TRUST BADGES ── */
    .trust-section { padding: 60px; background: var(--white); border-top: 1px solid var(--border); }
    .trust-grid { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 32px; max-width: 900px; margin: 0 auto; }
    .trust-badge {
      display: flex; align-items: center; gap: 10px;
      font-size: 14px; font-weight: 600; color: var(--text-muted);
    }
    .trust-badge svg { color: var(--gold); }

    /* ── FOOTER ── */
    .footer {
      background: var(--navy); color: rgba(255,255,255,0.5);
      text-align: center; padding: 24px 20px;
      font-size: 13px; line-height: 1.7;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .footer strong { color: rgba(255,255,255,0.75); }

    /* ── SCROLL TOP ── */
    .scroll-top {
      position: fixed; bottom: 28px; right: 28px;
      width: 46px; height: 46px; border-radius: 50%;
      background: var(--gold); color: var(--navy);
      border: none; cursor: pointer; z-index: 999;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 20px rgba(201,162,39,0.4);
      transition: all 0.25s; font-family: 'DM Sans', sans-serif;
    }
    .scroll-top:hover { transform: translateY(-3px) scale(1.08); }

    /* ── ANIMATIONS ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }

    /* ── MOBILE ── */
    @media (max-width: 1024px) {
      .hero-inner     { grid-template-columns: 1fr; padding: 90px 40px 60px; }
      .hero-card      { display: none; }
      .stats-inner    { grid-template-columns: repeat(2, 1fr); }
      .stat-item:nth-child(2) { border-right: none; }
      .cat-cards      { grid-template-columns: 1fr; }
      .steps-grid     { grid-template-columns: 1fr 1fr; }
      .features-grid  { grid-template-columns: repeat(2, 1fr); }
      .contact-grid   { grid-template-columns: 1fr; gap: 32px; }
    }
    @media (max-width: 768px) {
      .hero-inner     { padding: 80px 24px 50px; }
      .hero-h1        { font-size: 30px; }
      .hero-p         { font-size: 15px; }
      .stats-bar      { padding: 36px 24px; }
      .stats-inner    { grid-template-columns: repeat(2, 1fr); gap: 0; }
      .stat-num       { font-size: 32px; }
      .categories-section, .how-section, .features-section, .contact-section, .trust-section { padding: 64px 24px; }
      .steps-grid     { grid-template-columns: 1fr; gap: 16px; }
      .features-grid  { grid-template-columns: 1fr 1fr; }
      .subpage-header { padding: 32px 24px; }
      .subpage-title  { font-size: 26px; }
    }
    @media (max-width: 480px) {
      .hero-btns      { flex-direction: column; }
      .btn-primary, .btn-outline { width: 100%; justify-content: center; }
      .stats-inner    { grid-template-columns: 1fr 1fr; }
      .features-grid  { grid-template-columns: 1fr; }
      .trust-section  { padding: 40px 20px; }
      .trust-grid     { gap: 20px; }
      .scroll-top     { bottom: 20px; right: 20px; width: 42px; height: 42px; }
    }
  `;

  /* ─── HOME PAGE ─────────────────────────────────────────────────── */
  const HomePage = () => (
    <>
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg-img" />
        <div className="hero-grid-pattern" />
        <div className="hero-glow" />
        <div className="hero-glow-2" />
        <div className="hero-inner">
          {/* Left */}
          <div>
            <div className="hero-badge">
              <MdVerified size={14} />
              Pakistan's #1 Legal Document Platform
            </div>
            <h1 className="hero-h1">
              Automated Legal<br />
              <span>Document Generation</span><br />
              &amp; Case Assistance
            </h1>
            <p className="hero-p">
              Generate court applications, FIRs, and legal documents instantly. Get guided assistance through an integrated AI chatbot for all your legal queries.
            </p>
            <div className="hero-btns">
              <button
                className="btn-primary"
                onClick={() => isAuthenticated ? setActivePage('criminal') : navigate('/login')}
              >
                <MdBalance size={17} /> Get Started
              </button>
              <button className="btn-outline" onClick={() => navigate('/chatbot')}>
                <FiMessageSquare size={16} /> AI Chatbot
              </button>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 36 }}>
              {[
                { val: '10,000+', label: 'Docs Generated' },
                { val: '14', label: 'Templates' },
                { val: '24/7', label: 'AI Support' },
              ].map(s => (
                <div key={s.label} className="floating-stat">
                  <div>
                    <div className="floating-stat-val">{s.val}</div>
                    <div className="floating-stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right card */}
          <div
            className="hero-card"
            onClick={() => isAuthenticated ? navigate('/application') : navigate('/login')}
          >
            <div className="hero-card-icon">
              <MdGavel size={32} color="#0b1f2d" />
            </div>
            <h3>Generate Your Application</h3>
            <p>Quickly draft and download court-ready legal applications using our AI-powered form system with live Urdu preview.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22, textAlign: 'left' }}>
              {['Criminal Cases', 'Family Law', '14 Templates', 'Urdu Format'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a227', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>

            <div className="hero-card-cta">
              Start Now <MdArrowForward size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stats-inner">
          {[
            { target: '10000+', label: 'Documents Generated', Icon: FiFileText },
            { target: '14',     label: 'Legal Templates',     Icon: FiAward },
            { target: '2',      label: 'Case Categories',     Icon: MdBalance },
            { target: '24/7',   label: 'AI Chatbot Support',  Icon: FiZap },
          ].map(({ target, label, Icon }, i) => (
            <div key={label} className="stat-item">
              <div className="stat-num">
                {target === '24/7' ? '24/7' : <Counter target={target} />}
              </div>
              <div className="stat-lbl">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="categories-section" id="categories">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label"><FiFileText size={12} /> Case Categories</div>
          <h2 className="section-title">Choose Your Case Type</h2>
          <div className="gold-line" />
          <div className="cat-cards">
            {[
              {
                key: 'criminal', type: 'criminal',
                title: 'Criminal Cases',
                desc: 'Cases related to theft, assault, bail applications, and other criminal offences. Legal guidance and FIR drafting support available.',
                count: '7 Templates', Icon: BsShieldLockFill,
              },
              {
                key: 'family', type: 'family',
                title: 'Family Cases',
                desc: 'Divorce, custody, Nikah Nama, and domestic issues handled with privacy and accuracy through our AI-powered forms.',
                count: '7 Templates', Icon: BsPeopleFill,
              },
            ].map(cat => (
              <div
                key={cat.key} className="cat-card"
                onClick={() => setActivePage(cat.key)}
              >
                <div className="cat-card-inner">
                  <div className={`cat-badge ${cat.type}`}>{cat.count}</div>
                  <div className={`cat-card-icon ${cat.type}`}>
                    <cat.Icon size={26} />
                  </div>
                  <h3 className="cat-title">{cat.title}</h3>
                  <p className="cat-desc">{cat.desc}</p>
                  <div className="cat-link">
                    View Templates <FiChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label"><FiZap size={12} /> Process</div>
          <h2 className="section-title">How It Works</h2>
          <div className="gold-line" />
          <div className="steps-grid">
            {[
              { num: '01', title: 'Choose Template', desc: 'Select from our library of legal document templates for criminal or family cases.', Icon: FiFileText },
              { num: '02', title: 'Fill in Details',  desc: 'Enter your case details in the guided form. All fields are clearly labeled in Urdu.', Icon: FiUsers },
              { num: '03', title: 'Download Document', desc: 'Preview your legal document and download or print it instantly in court-ready format.', Icon: FiDownload },
            ].map(s => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-icon">
                  <s.Icon size={24} color="#c9a227" />
                </div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label" style={{ background: 'rgba(201,162,39,0.15)', color: '#c9a227' }}>
            <FiAward size={12} /> Why InCrime
          </div>
          <h2 className="section-title" style={{ color: 'white' }}>Built for Pakistani Legal Needs</h2>
          <div className="gold-line" />
          <div className="features-grid">
            {[
              { Icon: MdBalance, title: 'Urdu Templates',    desc: 'All documents generated in proper Urdu Nastaliq script, ready for Pakistani courts.' },
              { Icon: FiZap,     title: 'Instant Generation', desc: 'Fill the form and get a print-ready legal application in seconds.' },
              { Icon: FiShield,  title: 'Secure & Private',  desc: 'Your case details are protected. We never share your information.' },
              { Icon: FiMessageSquare, title: 'AI Chatbot', desc: '24/7 legal guidance on bail, FIR, family law, rights, and more.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon"><f.Icon size={20} /></div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section" id="contact">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="contact-grid">
            <div>
              <div className="section-label"><MdEmail size={12} /> Contact</div>
              <h2 className="section-title">Get In Touch</h2>
              <div className="gold-line" />
              <p className="section-sub">
                Have questions about our platform or need help with your legal documents? Reach out to us anytime.
              </p>
            </div>
            <div>
              {[
                { Icon: MdEmail,       label: 'Email',    val: 'support@incrime.pk' },
                { Icon: MdPhone,       label: 'Phone',    val: '+92 300 *******' },
                { Icon: BsWhatsapp,    label: 'WhatsApp', val: '+92 300 *******' },
                { Icon: MdLocationOn,  label: 'Address',  val: 'Pakistan' },
              ].map(c => (
                <div key={c.label} className="contact-item">
                  <div className="contact-icon"><c.Icon size={18} /></div>
                  <div>
                    <div className="contact-label">{c.label}</div>
                    <div className="contact-val">{c.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <div className="trust-section">
        <div className="trust-grid">
          {[
            { Icon: MdVerified,  text: 'Verified Platform' },
            { Icon: FiShield,    text: 'Secure & Private' },
            { Icon: MdBalance,   text: 'Pakistani Law Compliant' },
            { Icon: FiUsers,     text: '10,000+ Users Served' },
            { Icon: FiClock,     text: '24/7 Availability' },
          ].map(b => (
            <div key={b.text} className="trust-badge">
              <b.Icon size={16} /> {b.text}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <p style={{ marginBottom: 6 }}>
          <strong>Disclaimer:</strong> InCrime is not affiliated with any government or legal authority. It provides AI-based assistance for educational and informational purposes only.
        </p>
        <p>© 2025 InCrime — Every Case, Every Detail</p>
      </footer>
    </>
  );

  /* ─── SUB PAGES ─────────────────────────────────────────────────── */
  const SubPage = ({ type }) => {
    const isCriminal = type === 'criminal';
    const cases = isCriminal ? criminalCases : familyCases;
    return (
      <>
        <div className="subpage-header">
          <div className="subpage-header-inner">
            <div>
              <div className="subpage-title">
                {isCriminal ? 'Criminal Cases' : 'Family Cases'}
              </div>
              <div className="subpage-sub">
                Select a case type to generate your legal application
              </div>
            </div>
            <button className="back-btn" onClick={() => setActivePage('home')}>
              ← Back to Home
            </button>
          </div>
        </div>
        <div style={{ background: 'var(--cream)', padding: '40px 60px 60px', minHeight: '60vh' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <SubGrid cases={cases} />
          </div>
        </div>
        <footer className="footer">
          <p>© 2025 InCrime — Every Case, Every Detail</p>
        </footer>
      </>
    );
  };

  /* ─── RENDER ─────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: '#0b1f2d', background: '#fff' }}>
      <style>{css}</style>
      <Navbar />

      {activePage === 'home'     && <HomePage />}
      {activePage === 'criminal' && <SubPage type="criminal" />}
      {activePage === 'family'   && <SubPage type="family" />}

      {showTop && (
        <button
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to top"
        >
          <MdArrowUpward size={20} />
        </button>
      )}
    </div>
  );
}
