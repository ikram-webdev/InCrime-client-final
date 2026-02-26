import React, { useRef } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function UrduLegalTemplate({ title, slug, fields, renderDocument }) {
  const [values, setValues] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const printRef = useRef();
  const { isAuthenticated } = useAuth();

  const handleChange = (id, val) => {
    setValues(prev => ({ ...prev, [id]: val }));
    setSaved(false);
  };

  const handlePrint = async () => {
    if (isAuthenticated && slug) {
      try {
        setSaving(true);
        await axios.post('/api/applications', {
          templateSlug: slug,
          templateTitle: title,
          formData: values,
        });
        setSaved(true);
      } catch (e) {
        console.warn('Could not save application history:', e.message);
      } finally {
        setSaving(false);
      }
    }
    window.print();
  };

  return (
    <div style={{ fontFamily: "'Jameel Noori Nastaleeq', Arial, sans-serif", lineHeight: 1.6, background: '#f5f7fa', minHeight: '100vh' }}>
      <style>{`
        /* ── PRINT: show ONLY the legal-document ─────────────────────── */
        @media print {
          body * { visibility: hidden !important; }
          .legal-document,
          .legal-document * { visibility: visible !important; }
          .legal-document {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 18mm 22mm !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #fff !important;
            font-family: 'Jameel Noori Nastaleeq', Arial, sans-serif !important;
            direction: rtl !important;
            font-size: 18px !important;
            line-height: 2 !important;
          }
          @page { size: A4 portrait; margin: 0; }
        }

        /* ── SCREEN styles ────────────────────────────────────────────── */
        input:focus, textarea:focus {
          outline: none;
          border-color: #0d2a3a !important;
          box-shadow: 0 0 0 3px rgba(13,42,58,0.1);
        }
        .placeholder-line {
          display: inline-block;
          min-width: 50px;
          border-bottom: 2px solid #000;
          vertical-align: bottom;
          line-height: 1.2;
        }
        .placeholder-line.filled { border-bottom: none; }

        .template-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
          align-items: start;
        }
        @media(max-width: 900px) { .template-grid { grid-template-columns: 1fr; } }

        .form-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          overflow: hidden;
          position: sticky;
          top: 20px;
        }
        .doc-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          padding: 30px;
          min-height: 500px;
        }
        .form-header {
          background: linear-gradient(135deg, #0d2a3a, #1a4763);
          color: #fff;
          padding: 20px 25px;
          font-size: 18px;
          font-weight: 700;
        }
        .form-body {
          padding: 20px 25px;
          max-height: 65vh;
          overflow-y: auto;
        }
        .field-label {
          display: block;
          margin-bottom: 4px;
          direction: rtl;
          text-align: right;
          font-weight: 700;
          font-size: 14px;
          color: #0d2a3a;
        }
        .field-input {
          width: 100%;
          padding: 10px 12px;
          margin-bottom: 14px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.2s;
          direction: rtl;
        }
        .field-input:hover { border-color: #0d2a3a; }

        .action-bar {
          display: flex;
          gap: 12px;
          padding: 18px 25px;
          background: #f8f9fa;
          border-top: 1px solid #eee;
          flex-wrap: wrap;
          align-items: center;
        }
        .btn-print {
          background: #0d2a3a;
          color: #fff;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-print:hover { background: #1a4763; transform: translateY(-1px); }
        .btn-print:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .btn-clear {
          background: #fff;
          color: #666;
          border: 2px solid #ddd;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-clear:hover { border-color: #999; color: #333; }
        .saved-badge {
          background: #28a745;
          color: #fff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
        .doc-preview-label {
          font-size: 13px;
          color: #999;
          margin-bottom: 15px;
          text-align: center;
          font-family: 'Segoe UI', sans-serif;
        }
      `}</style>

      <Navbar />

      <div className="template-grid">

        {/* ── Left: Form ── */}
        <div className="form-card">
          <div className="form-header">📝 {title}</div>
          <div className="form-body">
            {fields.map(field => (
              <div key={field.id}>
                <label className="field-label">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={field.rows || 5}
                    value={values[field.id] || ''}
                    onChange={e => handleChange(field.id, e.target.value)}
                    className="field-input"
                    style={{ resize: 'vertical' }}
                    placeholder={field.label}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={values[field.id] || ''}
                    onChange={e => handleChange(field.id, e.target.value)}
                    className="field-input"
                    placeholder={field.label}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="action-bar">
            <button className="btn-print" onClick={handlePrint} disabled={saving}>
              {saving ? '⏳ Saving...' : '🖨️ Print / Download'}
            </button>
            <button className="btn-clear" onClick={() => { setValues({}); setSaved(false); }}>
              🗑️ Clear
            </button>
            {saved && <span className="saved-badge">✅ Saved to History</span>}
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="doc-card">
          <div className="doc-preview-label">📄 Live Document Preview</div>
          <div className="legal-document" ref={printRef}>
            {renderDocument(values)}
          </div>
        </div>

      </div>
    </div>
  );
}

export function PlaceholderSpan({ value, style }) {
  const filled = value && String(value).trim();
  return (
    <span
      className={filled ? 'placeholder-line filled' : 'placeholder-line'}
      style={style}
    >
      {filled ? value : '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
    </span>
  );
}
