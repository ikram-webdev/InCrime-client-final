import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  FiSend, FiMic, FiMicOff, FiPlus, FiTrash2, FiMessageSquare,
  FiClock, FiChevronRight, FiMenu, FiMoon, FiSun, FiBookOpen,
  FiArrowRight, FiFileText,
} from 'react-icons/fi';
import {
  MdBalance, MdGavel, MdFamilyRestroom, MdSecurity, MdHome
} from 'react-icons/md';
import { BsShieldLockFill, BsPeopleFill } from 'react-icons/bs';

const C = { primary: '#0d2a3a', gold: '#c9a227', light: '#f4f6f9', white: '#ffffff' };

// ─── ALL 14 TEMPLATES ────────────────────────────────────────────────────────
const ALL_TEMPLATES = [
  { id: 'bail-pre',        label: 'Pre-Arrest Bail',      urdu: 'ضمانت قبل از گرفتاری', route: '/templates/criminal/bail-pre',          cat: 'criminal', emoji: '⚖️' },
  { id: 'bail-post',       label: 'Post-Arrest Bail',     urdu: 'ضمانت بعد از گرفتاری', route: '/templates/criminal/bail-post',         cat: 'criminal', emoji: '🔓' },
  { id: 'theft',           label: 'Theft / FIR',          urdu: 'چوری / ایف آئی آر',    route: '/templates/criminal/theft',             cat: 'criminal', emoji: '🚨' },
  { id: 'harassment',      label: 'Harassment',           urdu: 'ہراسانی درخواست',      route: '/templates/criminal/harassment',         cat: 'criminal', emoji: '🛡️' },
  { id: 'challan',         label: 'Challan Application',  urdu: 'چالان درخواست',        route: '/templates/criminal/challan',            cat: 'criminal', emoji: '📋' },
  { id: 'consent',         label: 'Consent / Compromise', urdu: 'رضامندی / صلح',        route: '/templates/criminal/consent',            cat: 'criminal', emoji: '🤝' },
  { id: 'attendance',      label: 'Attendance Excused',   urdu: 'پیشی معاف',            route: '/templates/criminal/attendance-excused', cat: 'criminal', emoji: '📅' },
  { id: 'nikah',           label: 'Nikah Nama',           urdu: 'نکاح نامہ',            route: '/templates/family/nikah-nama',           cat: 'family',   emoji: '💍' },
  { id: 'custody',         label: 'Child Custody',        urdu: 'حضانت اطفال',          route: '/templates/family/child-custody',        cat: 'family',   emoji: '👶' },
  { id: 'tansikh',         label: 'Tansikh Nikah',        urdu: 'تنسیخ نکاح',           route: '/templates/family/tansik-nikah',         cat: 'family',   emoji: '📜' },
  { id: 'second-marriage', label: 'Second Marriage',      urdu: 'دوسری شادی',           route: '/templates/family/second-marriage',      cat: 'family',   emoji: '💒' },
  { id: 'azad-darul',      label: 'Release Dar-ul-Aman',  urdu: 'آزادی دارالامان',      route: '/templates/family/azad-darul-aman',      cat: 'family',   emoji: '🏠' },
  { id: 'meeting-darul',   label: 'Meeting Dar-ul-Aman',  urdu: 'ملاقات دارالامان',     route: '/templates/family/meeting-darul-aman',   cat: 'family',   emoji: '👥' },
  { id: 'sending-darul',   label: 'Sending Dar-ul-Aman',  urdu: 'بھیجنا دارالامان',     route: '/templates/family/sending-darul-aman',   cat: 'family',   emoji: '🏡' },
];

const byId = (ids) => ids.map(id => ALL_TEMPLATES.find(t => t.id === id)).filter(Boolean);

// ─── KEYWORD → TEMPLATE MAPPING ─────────────────────────────────────────────
const TEMPLATE_TRIGGERS = [
  { keys: ['pre arrest bail','pre-arrest','anticipatory','pre bail','bail se pehle','griftari se pehle','قبل از گرفتاری'], ids: ['bail-pre'] },
  { keys: ['post arrest bail','post-arrest','after arrest','post bail','jail se nikalna','بعد از گرفتاری'], ids: ['bail-post'] },
  { keys: ['bail application','bail apply','bail banao','bail chahiye','bail form','ضمانت','bail kaise'], ids: ['bail-pre','bail-post'] },
  { keys: ['theft','stolen','robbery','چوری','ڈکیتی','chori','snatch','mobile chori','dacoity'], ids: ['theft'] },
  { keys: ['fir','first information','muqadma','ایف آئی آر','fir file','fir banao','fir kaise'], ids: ['theft'] },
  { keys: ['harassment','ہراساں','sexual harassment','blackmail','ہراسانی','molest','tang karna'], ids: ['harassment'] },
  { keys: ['challan','چالان','charge sheet'], ids: ['challan'] },
  { keys: ['consent','compromise','صلح','رضامندی','case settle','case band','case wapas'], ids: ['consent'] },
  { keys: ['attendance excused','peshi maaf','پیشی معاف','court miss','absent court','nbw'], ids: ['attendance'] },
  { keys: ['nikah','نکاح','nikah nama','نکاح نامہ','marriage form','shadi register'], ids: ['nikah'] },
  { keys: ['child custody','bachon ki custody','حضانت','guardianship','bache custody'], ids: ['custody'] },
  { keys: ['tansikh','annulment','تنسیخ نکاح','void marriage','nikah cancel'], ids: ['tansikh'] },
  { keys: ['second marriage','دوسری شادی','dusri shadi','second wife','do shadian'], ids: ['second-marriage'] },
  { keys: ['release darul','azad darul','دارالامان سے آزادی','release shelter'], ids: ['azad-darul'] },
  { keys: ['meeting darul','ملاقات دارالامان','visit darul','darul visit'], ids: ['meeting-darul'] },
  { keys: ['sending darul','بھیجنا دارالامان','darul bhejna','send darul'], ids: ['sending-darul'] },
  { keys: ['darul aman','dar ul aman','dar-ul-aman','دارالامان','shelter home','women shelter'], ids: ['azad-darul','meeting-darul','sending-darul'] },
  { keys: ['domestic violence','marta hai','maar peet','ghar mein marta'], ids: ['harassment','sending-darul'] },
  { keys: ['khula','divorce','talaq','طلاق','خلع'], ids: ['tansikh'] },
  { keys: ['maintenance','nafaqa','نفقہ','kharcha nahi'], ids: ['consent'] },
  { keys: ['generate','template','form banao','درخواست بنائیں','document chahiye','apply karna','form chahiye','all templates'], ids: ['bail-pre','bail-post','theft','harassment','challan','consent','attendance','nikah','custody','tansikh','second-marriage','azad-darul','meeting-darul','sending-darul'] },
  { keys: ['criminal template','criminal form'], ids: ['bail-pre','bail-post','theft','harassment','challan','consent','attendance'] },
  { keys: ['family template','family form'], ids: ['nikah','custody','tansikh','second-marriage','azad-darul','meeting-darul','sending-darul'] },
];

function detectTemplates(message) {
  const msg = message.toLowerCase();
  const matched = new Set();
  for (const t of TEMPLATE_TRIGGERS) {
    for (const kw of t.keys) {
      if (msg.includes(kw.toLowerCase())) {
        t.ids.forEach(id => matched.add(id));
        break;
      }
    }
  }
  return ALL_TEMPLATES.filter(t => matched.has(t.id));
}

const QUICK_TOPICS = [
  { icon: MdBalance,       label: 'Bail Application', q: 'How to file bail application in Pakistan?' },
  { icon: MdGavel,         label: 'File FIR',          q: 'How to file an FIR at police station?' },
  { icon: MdFamilyRestroom,label: 'Divorce / Khula',   q: 'How to get Khula divorce in Pakistan?' },
  { icon: BsPeopleFill,    label: 'Child Custody',     q: 'How does child custody work in Pakistan?' },
  { icon: BsShieldLockFill,label: 'Harassment',        q: 'What are legal options against harassment?' },
  { icon: MdSecurity,      label: 'Legal Rights',      q: 'What are my rights if I am arrested?' },
  { icon: FiBookOpen,      label: 'Cyber Crime',       q: 'How to report cyber crime in Pakistan?' },
  { icon: MdHome,          label: 'Dar-ul-Aman',       q: 'What is Dar-ul-Aman and how to apply?' },
];

const EXAMPLE_QS = [
  'What should I do if police refuse to register my FIR?',
  'What is difference between pre-arrest and post-arrest bail?',
  'How can a wife get Khula if husband refuses divorce?',
  'What are my fundamental rights if I am arrested in Pakistan?',
  'How do I report someone who is blackmailing me online?',
  'What is domestic violence law in Pakistan?',
  'How to file complaint against a corrupt police officer?',
];

// ─── LOCAL KB ─────────────────────────────────────────────────────────────────
// Every followUp question maps to its OWN dedicated KB entry so clicking a
// suggestion always returns the specific, unique answer for that question.
const LOCAL_KB = {

  // ── BAIL (general) ───────────────────────────────────────────────────────
  bail: {
    answer: `Bail in Pakistan — ضمانت\n\nTypes of Bail:\n1. Pre-Arrest Bail (Section 498 CrPC): Filed BEFORE arrest to prevent arrest\n2. Post-Arrest Bail (Section 497 CrPC): Filed AFTER arrest to get released\n3. Interim Bail: Temporary bail during hearing\n4. Statutory Bail: Automatic if challan not filed on time\n\nWhere to File:\n- Bailable offences: Magistrate Court — bail is your RIGHT\n- Non-bailable offences: Sessions Court — judge decides\n- If refused: High Court\n\nWhat You Need:\n- FIR copy and CNIC\n- Surety (guarantor) with property documents\n- Lawyer to represent you\n\nCost: Court bail is free. Lawyer: Rs 5,000 to Rs 50,000\nFree Legal Aid: 0800-09008 (Punjab)`,
    tids: ['bail-pre','bail-post'],
    followUp: [
      'How to file pre-arrest bail?',
      'What is surety in bail?',
      'What if bail is rejected?',
      'What is statutory bail?',
    ],
  },

  // ── PRE-ARREST BAIL ──────────────────────────────────────────────────────
  bail_pre: {
    answer: `Pre-Arrest Bail (Anticipatory Bail) — ضمانت قبل از گرفتاری\n\nFiled BEFORE you are arrested to prevent arrest.\nGoverning Law: Section 498 CrPC\n\nWhere to File:\n- Sessions Court (first try)\n- High Court (if Sessions refuses)\n\nWhat You Need:\n- FIR number, date, police station\n- Sections (charges) you are facing\n- Surety with property documents\n- Strong grounds: false implication, no criminal record, breadwinner of family\n\nProcess:\n1. Hire lawyer immediately\n2. File petition in Sessions Court\n3. Interim bail usually granted same day\n4. Final hearing within 3 to 7 days\n5. If Sessions Court refuses — High Court within 24 hours\n\nWarning: Bail can be cancelled if you miss court dates or tamper with evidence.`,
    tids: ['bail-pre'],
    followUp: [
      'What is surety in bail?',
      'What if bail is rejected?',
      'What is post-arrest bail?',
      'How to file post-arrest bail?',
    ],
  },

  // ── POST-ARREST BAIL ─────────────────────────────────────────────────────
  bail_post: {
    answer: `Post-Arrest Bail — ضمانت بعد از گرفتاری\n\nFiled AFTER arrest to get released from custody.\nGoverning Law: Section 497 CrPC\n\nTwo Categories:\n1. Bailable Offences: Bail is your LEGAL RIGHT — Magistrate must give it\n2. Non-Bailable Offences: Sessions Judge decides based on arguments\n\nRequired Documents:\n- FIR copy (get free from police station)\n- Arrest memo, CNIC of accused and surety\n- Property documents of surety\n- Medical certificate if health issue\n\nTimeline:\n- Must appear before Magistrate within 24 hours of arrest\n- Bail hearing: 2 to 7 days\n\nStatutory Bail: If police do not file challan within 14 days for bailable offence — you have automatic right to bail.`,
    tids: ['bail-post'],
    followUp: [
      'What is surety in bail?',
      'What is statutory bail?',
      'What if bail is rejected?',
      'What is pre-arrest bail?',
    ],
  },

  // ── SURETY ───────────────────────────────────────────────────────────────
  surety: {
    answer: `What is Surety in Bail? — ضامن\n\nA surety is a person who guarantees to the court that the accused will appear at every hearing. If the accused runs away, the surety's property can be seized by the court.\n\nWho Can Be a Surety:\n- Any adult Pakistani citizen\n- Must own property in Pakistan\n- Must have a clean record (no pending cases)\n- Usually a close relative — father, brother, uncle\n\nDocuments Surety Must Bring:\n- Original CNIC\n- Property documents (Registry, Fard, or Khatauni)\n- Recent utility bill of the property\n- Affidavit of surety (your lawyer prepares this)\n\nImportant Points:\n- Court decides how much the surety bond amount will be (e.g. Rs 50,000 or Rs 200,000)\n- If accused fails to appear — surety must pay that amount OR have property seized\n- Surety can withdraw at any time by informing the court — accused will then be arrested\n- One person can be surety for multiple people\n\nIf You Cannot Arrange Surety:\n- Apply for Personal Bond (court may accept your own guarantee)\n- Free Legal Aid can help: 0800-09008`,
    tids: ['bail-pre','bail-post'],
    followUp: [
      'What if I cannot find a surety?',
      'How much does surety bond cost?',
      'Can surety withdraw from bail?',
      'What happens if accused skips court?',
    ],
  },

  // ── BAIL REJECTED ────────────────────────────────────────────────────────
  bail_rejected: {
    answer: `What If Bail Is Rejected? — ضمانت رد ہونے پر کیا کریں\n\nDo NOT give up — you have multiple options:\n\nStep 1 — Go to Higher Court:\n- If Sessions Court rejects → immediately file in High Court\n- If High Court rejects → file in Supreme Court\n- Each court can review the case independently\n\nStep 2 — File Fresh Bail After Changed Circumstances:\n- If your health worsens → file medical bail\n- If key witness dies or turns hostile → file fresh bail\n- If you have been in jail for a long time → file fresh bail on delay grounds\n\nStep 3 — Statutory Bail (Section 167 CrPC):\n- If police have NOT filed challan within:\n  - 14 days for bailable offences\n  - 30 days (extendable to 60) for non-bailable offences\n- You have AUTOMATIC right to bail — court must grant it\n\nStep 4 — Writ of Habeas Corpus:\n- If detained illegally without charge\n- File in High Court under Article 199\n- Court must produce you within 24 hours\n\nCommon Reasons Bail Gets Rejected:\n- Very serious offence (murder, terrorism, rape)\n- Flight risk — no permanent address\n- Accused previously jumped bail\n- Weak surety documents\n\nFree Legal Aid: 0800-09008 (Punjab)`,
    tids: ['bail-pre','bail-post'],
    followUp: [
      'What is statutory bail?',
      'What is Habeas Corpus?',
      'How to appeal bail rejection?',
      'What is medical bail?',
    ],
  },

  // ── STATUTORY BAIL ───────────────────────────────────────────────────────
  statutory_bail: {
    answer: `Statutory Bail — قانونی ضمانت (خودکار)\n\nThis is your AUTOMATIC right if police fail to complete their work on time.\nGoverned by: Section 167(5) CrPC\n\nTimelines:\n- Bailable offences: Challan must be filed within 14 days — if not, bail is your RIGHT\n- Non-bailable offences: 30 days (extendable to 60 by court) — if no challan, bail is your RIGHT\n\nHow to Claim It:\n1. Check with your lawyer if the deadline has passed\n2. File a simple application in court stating challan was not filed on time\n3. Court MUST grant bail — it is mandatory, not discretionary\n4. Even if offence is very serious, this bail cannot be refused\n\nImportant:\n- Statutory bail is cancelled automatically if police file challan BEFORE your application\n- After bail is granted, police can still file challan later\n- You must still attend all court hearings\n\nThis is one of the most powerful bail rights in Pakistan — do not miss the deadline!`,
    tids: ['bail-post'],
    followUp: [
      'What is post-arrest bail?',
      'What if bail is rejected?',
      'What is challan in court?',
      'What is surety in bail?',
    ],
  },

  // ── SURETY CANNOT BE FOUND ───────────────────────────────────────────────
  surety_cannot_find: {
    answer: `Cannot Find a Surety? — ضامن نہ ملنے پر کیا کریں\n\nOptions Available:\n\n1. Personal Bond (PR Bond):\n- Court may accept YOUR own written guarantee\n- No property required — based on your personal assurance\n- More common for minor offences and first-time offenders\n- Ask your lawyer to request this from the judge\n\n2. Multiple Small Sureties:\n- Instead of one big surety, court may accept two or three people\n- Each provides smaller property value\n- Easier to arrange from friends or relatives\n\n3. Free Legal Aid:\n- Punjab Legal Aid Society: 0800-09008 (Free)\n- They can sometimes help locate proper surety sources\n- District Legal Empowerment Committee in each district\n\n4. Charity Organizations:\n- Edhi Foundation: 115\n- Umang Helpline: 0317-4288665\n- Some NGOs help poor families arrange bail surety\n\nNote: If you are poor and cannot afford surety, inform the judge directly. Courts do have discretion to reduce bond amount or accept PR bond in genuine hardship cases.`,
    tids: ['bail-pre','bail-post'],
    followUp: [
      'What is surety in bail?',
      'What is statutory bail?',
      'What if bail is rejected?',
      'What are my rights if arrested?',
    ],
  },

  // ── FIR ──────────────────────────────────────────────────────────────────
  fir: {
    answer: `FIR — First Information Report — ایف آئی آر\n\nFIR officially starts a criminal case. It is FREE to register.\nLaw: Section 154 CrPC — police MUST register FIR.\n\nHow to File:\n1. Go to nearest police station\n2. Meet the SHO (Station House Officer)\n3. Tell complete incident with dates, times, location\n4. Give names or description of accused\n5. Police must give you a FREE certified copy\n\nIf Police REFUSE:\n1. Complain to DSP (senior officer)\n2. File application before Judicial Magistrate (Section 22-A)\n3. Complain to SSP by registered post\n4. Use Pakistan Citizen Portal: www.citizenportal.gov.pk\n5. File writ petition in High Court\n\nEmergency: Call 15`,
    tids: ['theft'],
    followUp: [
      'What if police refuse FIR?',
      'Can FIR be cancelled?',
      'How to get FIR copy?',
      'What is challan in court?',
    ],
  },

  // ── POLICE REFUSE FIR ────────────────────────────────────────────────────
  fir_refuse: {
    answer: `Police Refusing FIR — What To Do — پولیس نے ایف آئی آر لکھنے سے انکار کیا\n\nSection 154 CrPC: Police are LEGALLY OBLIGATED to register FIR.\n\nSteps in Order:\n\nStep 1 — Go to Senior Officer:\n- Complain to DSP (Deputy Superintendent of Police)\n- DSP can ORDER the SHO to register FIR immediately\n\nStep 2 — Judicial Magistrate (Most Effective):\n- File application under Section 22-A CrPC\n- Magistrate will direct police to register FIR\n- Court cannot refuse — it is mandatory order\n\nStep 3 — Written Complaint:\n- Send by registered post to SSP and DIG\n- Keep postal receipt as proof of delivery\n\nStep 4 — Government Portals:\n- Pakistan Citizen Portal: www.citizenportal.gov.pk\n- SMS to 1201 (PM Portal)\n\nStep 5 — High Court:\n- File writ petition under Article 199\n- Court orders police within 24 hours\n\nAlways note officer name, badge number, date, and time of refusal.`,
    tids: ['theft'],
    followUp: [
      'How to file Magistrate application?',
      'What is writ petition?',
      'How to complain against police?',
      'What is Pakistan Citizen Portal?',
    ],
  },

  // ── FIR CANCELLED ────────────────────────────────────────────────────────
  fir_cancel: {
    answer: `Can FIR Be Cancelled? — ایف آئی آر کیسے ختم ہوتی ہے\n\nYes, FIR can be cancelled or closed in two ways:\n\n1. Compromise / Consent Between Parties:\n- In compoundable offences (e.g. minor assault, property disputes)\n- Both parties sign a compromise deed\n- Court approves and cancels FIR\n- List of compoundable offences in Schedule II of CrPC\n\n2. Cancellation Report by Police:\n- If police investigate and find no evidence\n- Police file a "C-Report" (Cancellation Report) before court\n- Magistrate reviews and can accept or reject it\n- If magistrate rejects — case continues\n\nNon-Compoundable Offences CANNOT be cancelled by compromise:\n- Murder, rape, kidnapping, terrorism\n- State prosecutes even if victim forgives\n\nImportant:\n- Never pay money to get FIR cancelled — this is illegal\n- Only use court-approved compromise process\n- Get a lawyer to draft proper compromise deed\n\nAfter Cancellation:\n- No arrest can be made on that FIR\n- If same incident repeated — new FIR must be filed`,
    tids: ['consent','theft'],
    followUp: [
      'What crimes can be settled?',
      'How to withdraw FIR?',
      'What is Diyat in murder cases?',
      'What is challan in court?',
    ],
  },

  // ── FIR COPY ─────────────────────────────────────────────────────────────
  fir_copy: {
    answer: `How to Get FIR Copy — ایف آئی آر کی نقل کیسے ملے\n\nYou Have a Legal Right to FIR Copy — it is FREE.\n\nWho Can Get FIR Copy:\n- The complainant (person who filed FIR)\n- The accused or their lawyer\n- Any affected party\n\nHow to Get It:\n\nMethod 1 — Police Station:\n- Go to the same police station where FIR was registered\n- Ask SHO for certified copy — it is FREE by law\n- If they charge money — complain to DSP\n\nMethod 2 — Online (Punjab):\n- Website: www.punjabpolice.gov.pk\n- Click on "FIR Search"\n- Enter FIR number, year, and police station\n- Download PDF copy instantly\n\nMethod 3 — Court:\n- If case is in court, get copy from Reader (court clerk)\n- Small fee of Rs 5 to Rs 20 per page\n\nIf Police Deny FIR Copy:\n- This is illegal — Section 154(2) CrPC guarantees it\n- Complain to DSP or file complaint on Citizen Portal\n- Magistrate can also order police to provide copy`,
    tids: ['theft'],
    followUp: [
      'What if police refuse FIR?',
      'How to file an FIR?',
      'Can FIR be cancelled?',
      'What is challan in court?',
    ],
  },

  // ── CHALLAN ──────────────────────────────────────────────────────────────
  challan: {
    answer: `Challan (Charge Sheet) — چالان\n\nChallan is the official document police submit to court after completing investigation. It formally puts the case before the court for trial.\n\nWhat Challan Contains:\n- Names of accused\n- Names of witnesses\n- List of evidence collected\n- FIR copy\n- Medical and forensic reports\n- Police's conclusion (guilty or innocent)\n\nTwo Types of Challan:\n1. Positive Challan: Police believe accused is guilty — trial begins\n2. Cancellation Report (C-Report): Police found no evidence — case may close\n\nTimeline for Police to File Challan:\n- Bailable offence: 14 days from arrest\n- Non-bailable offence: 30 days (extendable to 60)\n- If not filed on time → Accused gets STATUTORY BAIL automatically\n\nAfter Challan is Filed:\n- Court frames charges against accused\n- Trial begins\n- Accused can challenge weak evidence\n\nWhat Challan Means for You:\n- If you are accused: Hire a lawyer immediately to challenge challan\n- If you are victim: Ensure your name and statement are in challan`,
    tids: ['challan'],
    followUp: [
      'What is FIR?',
      'What is statutory bail?',
      'What is difference between FIR and challan?',
      'How to apply bail after challan?',
    ],
  },

  // ── FIR vs CHALLAN ───────────────────────────────────────────────────────
  fir_vs_challan: {
    answer: `Difference Between FIR and Challan — فرق\n\nFIR (First Information Report):\n- Filed by the COMPLAINANT (victim or witness)\n- Filed at the POLICE STATION\n- Starts the investigation\n- Registered immediately when incident is reported\n- Contains: incident details, accused description, complainant's statement\n\nChallan (Charge Sheet):\n- Filed by the POLICE after investigation\n- Filed in COURT\n- Starts the trial\n- Filed after investigation is complete (14 to 60 days)\n- Contains: evidence, witnesses, forensic reports, police conclusion\n\nSimple Way to Remember:\n- FIR = Complaint that starts investigation\n- Challan = Police report that starts trial\n\nFlow of a Criminal Case:\n1. Incident happens\n2. Victim files FIR at police station\n3. Police investigate\n4. Police file Challan in court\n5. Court frames charges\n6. Trial begins\n7. Verdict (guilty or not guilty)`,
    tids: ['challan','theft'],
    followUp: [
      'How to file an FIR?',
      'What is challan in court?',
      'What is statutory bail?',
      'What happens during trial?',
    ],
  },

  // ── BAIL AFTER CHALLAN ───────────────────────────────────────────────────
  bail_after_challan: {
    answer: `Bail After Challan Is Filed — چالان کے بعد ضمانت\n\nYes, you can still apply for bail after challan is filed.\n\nProcess:\n1. Your lawyer files bail application in the same court where challan is filed (Sessions Court or Magistrate Court)\n2. Court hears both sides\n3. Judge considers: severity of offence, your record, risk of fleeing, evidence strength\n\nThings That Help Get Bail After Challan:\n- First-time offender with no prior record\n- Accused is elderly, sick, or a woman\n- Offence is bailable in nature\n- Evidence against accused is weak\n- Accused is the only breadwinner of family\n\nThings That Hurt Bail After Challan:\n- Multiple previous cases\n- Serious offence (murder, terrorism, kidnapping)\n- Accused previously jumped bail\n- Police showed strong evidence in challan\n\nImportant:\n- Filing challan does NOT cancel your existing bail\n- If you were on bail during investigation — it continues through trial\n- Prosecution can apply to CANCEL your bail if you threaten witnesses`,
    tids: ['bail-post','challan'],
    followUp: [
      'What if bail is rejected?',
      'What is surety in bail?',
      'What is statutory bail?',
      'What is post-arrest bail?',
    ],
  },

  // ── NBW / WARRANT ────────────────────────────────────────────────────────
  nbw: {
    answer: `NBW (Non-Bailable Warrant) — ناقابل ضمانت وارنٹ\n\nAn NBW is issued by a court when the accused fails to appear at hearings. Police are ordered to arrest and produce the person before court immediately.\n\nWhat Happens After NBW:\n- Police can arrest you anywhere — home, work, any district\n- You are brought directly before the court\n- Court decides whether to accept your excuse or send you to jail\n\nHow to Cancel NBW:\n1. Appear before court IMMEDIATELY with your lawyer\n2. File an application to cancel the warrant\n3. Give valid reason (illness, emergency, travel, miscommunication)\n4. Bring supporting documents (medical certificate, travel record)\n5. Court will usually cancel NBW if you appear and give good reason\n\nPreventing NBW:\n- Never miss a court date without prior application\n- File "Attendance Excused" application BEFORE missing court\n- Give your lawyer current phone number and address\n\nNote: If NBW is not cancelled — you can be arrested any time. Act immediately.`,
    tids: ['attendance'],
    followUp: [
      'How to cancel a court warrant?',
      'What is attendance excused application?',
      'What if I miss court date?',
      'What is post-arrest bail?',
    ],
  },

  // ── MISS COURT ───────────────────────────────────────────────────────────
  miss_court: {
    answer: `Missed a Court Hearing? — عدالت میں پیش نہیں ہوئے\n\nWhat Happens:\n- Court issues Bailable Warrant (BW) first — you can get bail from any police officer\n- If you miss again — Non-Bailable Warrant (NBW) is issued\n- NBW means police WILL arrest you without bail option at station\n\nImmediate Steps:\n1. Contact your lawyer IMMEDIATELY — same day\n2. Your lawyer files application to cancel warrant\n3. Appear before court as soon as possible\n4. Bring proof of why you missed (illness, death in family, emergency)\n\nBest Practice — Before Missing Court:\n- File "Attendance Excused" application at least 3 days before the date\n- Your lawyer submits this to the court\n- Court may waive your appearance for that date\n- Use the template available on this platform\n\nIf On Bail:\n- Missing court can result in BAIL CANCELLATION\n- Your surety may also be called to court and fined\n- Act immediately — every day delay makes it worse`,
    tids: ['attendance'],
    followUp: [
      'What is NBW?',
      'How to cancel a court warrant?',
      'What is attendance excused application?',
      'What is surety in bail?',
    ],
  },

  // ── ATTENDANCE EXCUSED ───────────────────────────────────────────────────
  attendance_excused: {
    answer: `Attendance Excused Application — پیشی معافی\n\nThis application requests the court to excuse your absence from a hearing.\n\nWhen to Use:\n- You are sick and cannot travel to court\n- You are travelling abroad on the hearing date\n- Family emergency (death, illness of close relative)\n- Work commitment that cannot be postponed\n\nHow to File:\n1. Inform your lawyer at least 3 to 5 days before the hearing\n2. Lawyer drafts the application with reason and supporting documents\n3. Application submitted to court before the hearing date\n4. Court may accept and adjourn to next date without issuing warrant\n\nDocuments to Attach:\n- Medical certificate (if sick)\n- Travel ticket or visa (if abroad)\n- Death certificate or hospital record (if family emergency)\n\nImportant:\n- Do NOT simply not show up — always file application first\n- Court has discretion — genuine reasons are accepted, weak excuses may be rejected\n- Use the Attendance Excused template on this platform to generate the correct format`,
    tids: ['attendance'],
    followUp: [
      'What is NBW?',
      'What if I miss court date?',
      'How to cancel a court warrant?',
      'What is post-arrest bail?',
    ],
  },

  // ── CANCEL WARRANT ───────────────────────────────────────────────────────
  cancel_warrant: {
    answer: `How to Cancel a Court Warrant — وارنٹ کیسے منسوخ کریں\n\nStep 1 — Contact Lawyer Immediately:\n- Do not delay even one day\n- Lawyer files application to cancel warrant on urgent basis\n\nStep 2 — Appear Before Court:\n- You MUST personally appear before the same court\n- Warrant cannot be cancelled in your absence\n- Bring your CNIC and any relevant documents\n\nStep 3 — File Cancellation Application:\n- Application states reasons for non-appearance\n- Attach supporting documents (medical, travel, emergency proof)\n- Request court to cancel warrant and grant fresh date\n\nStep 4 — Court Decision:\n- If reason is genuine — warrant cancelled, new date given\n- Court may impose small fine (Multa) as warning\n- If reason is weak — court may send you to jail on that day\n\nStep 5 — Prevent Future Warrants:\n- Keep your lawyer's number saved\n- Always confirm your next hearing date after each appearance\n- File Attendance Excused in advance if you know you cannot come\n\nUrgency: Every day you delay after a warrant is issued increases risk of arrest.`,
    tids: ['attendance'],
    followUp: [
      'What is NBW?',
      'What if I miss court date?',
      'What is attendance excused application?',
      'What if bail is rejected?',
    ],
  },

  // ── KHULA / DIVORCE ──────────────────────────────────────────────────────
  khula: {
    answer: `Khula Divorce — خلع\n\nKhula is the wife's right to end the marriage through Family Court.\n\nGrounds for Khula:\n- Cruelty or domestic violence\n- Husband not providing maintenance\n- Desertion (husband missing or absent)\n- Addiction to drugs or alcohol\n- Husband in prison\n- Incompatibility\n\nProcess:\n1. File Khula petition in Family Court\n2. Usually wife returns the Mehr amount\n3. Court attempts reconciliation first\n4. If no reconciliation — Khula decree issued\n5. Timeline: 3 to 6 months typically\n\nHusband CANNOT block Khula permanently — court will grant it.\n\nAfter Khula:\n- Wife observes Iddat for 3 months\n- Children's custody decided separately`,
    tids: ['tansikh'],
    followUp: [
      'How long does Khula take?',
      'Can husband refuse Khula?',
      'What about Mehr after Khula?',
      'What about children after Khula?',
    ],
  },

  // ── HOW LONG KHULA TAKES ─────────────────────────────────────────────────
  khula_time: {
    answer: `How Long Does Khula Take? — خلع میں کتنا وقت لگتا ہے\n\nTypical Timeline: 3 to 6 months\n\nPhase 1 — Filing and Notice (Weeks 1 to 2):\n- Petition filed in Family Court\n- Court issues notice to husband\n- Husband given time to respond\n\nPhase 2 — Reconciliation Attempt (Weeks 2 to 8):\n- Court appoints arbitrators (usually one from each family)\n- Three reconciliation sessions are held\n- If reconciled — case closed\n- If not — case moves forward\n\nPhase 3 — Decree (Weeks 8 to 24):\n- Court records wife's statement\n- Husband given final chance to respond\n- Khula decree issued\n\nFactors That DELAY Khula:\n- Husband deliberately not appearing in court\n- Disputes over Mehr return amount\n- Children's custody and maintenance arguments\n- Court backlogs in busy cities\n\nFactors That SPEED IT UP:\n- Husband cooperates or does not contest\n- No dispute over Mehr\n- Ex-parte decree (if husband keeps missing hearings)\n\nAfter Decree:\n- Wife observes Iddat (3 months)\n- Free to remarry after Iddat`,
    tids: ['tansikh'],
    followUp: [
      'Can husband refuse Khula?',
      'What about Mehr after Khula?',
      'How to get Khula if husband refuses?',
      'What about children after Khula?',
    ],
  },

  // ── HUSBAND REFUSE KHULA ─────────────────────────────────────────────────
  husband_refuse_khula: {
    answer: `Can Husband Refuse Khula? — کیا خاوند خلع روک سکتا ہے\n\nShort Answer: NO — husband CANNOT permanently block Khula.\n\nWhat Husband Can Do:\n- Not appear in court (but court issues ex-parte decree after notices)\n- Delay proceedings by not responding (but court proceeds anyway)\n- Contest the Mehr return amount (court will decide fair amount)\n- Argue about children's custody (decided separately)\n\nWhat Husband CANNOT Do:\n- Permanently refuse or cancel a Khula petition\n- Force wife to stay in marriage against her will\n- Block the court from issuing Khula decree\n\nIf Husband Keeps Missing Court:\n- Court issues ex-parte (one-sided) decree after proper notices\n- Wife gets Khula without husband's signature\n- Case may be decided in 3 to 4 months in such situations\n\nMehr Issue:\n- Traditionally wife returns Mehr to get Khula\n- If Mehr was never paid — court may reduce or waive return amount\n- Court decides based on circumstances\n\nRemember: Pakistani courts have granted Khula to millions of women. Husband's refusal only delays — it never permanently stops the process.`,
    tids: ['tansikh'],
    followUp: [
      'How long does Khula take?',
      'What about Mehr after Khula?',
      'What about children after Khula?',
      'How to file Khula petition?',
    ],
  },

  // ── MEHR AFTER KHULA ─────────────────────────────────────────────────────
  mehr_khula: {
    answer: `Mehr After Khula — خلع میں مہر کا کیا ہوتا ہے\n\nTraditional Rule:\n- In Khula, wife usually returns the Mehr (dower) to husband\n- This is because she is the one initiating the separation\n- It is called "Khul" — wife gives something to be released\n\nExceptions — Mehr May NOT Be Returned:\n- Husband was cruel or abusive\n- Husband was at fault for breakdown of marriage\n- Husband never paid the Mehr in the first place\n- Sehr (deferred Mehr) that was never given cannot be "returned"\n\nWhat Court Decides:\n- Court has full discretion over Mehr return amount\n- If wife suffered abuse — court often waives Mehr return entirely\n- If husband is at fault — wife may keep Mehr AND get Khula\n- Fair amount is decided case by case\n\nPractical Advice:\n- Always document if husband was abusive or neglectful\n- If Mehr was never paid — bring Nikah Nama to court as proof\n- Lawyer can argue for reduction or waiver of Mehr return\n\nDenyable Mehr:\n- Prompt Mehr (mu'ajjal): Due immediately — already paid usually\n- Deferred Mehr (mu'ajjal): Due on divorce or death — wife keeps this`,
    tids: ['tansikh'],
    followUp: [
      'Can husband refuse Khula?',
      'How long does Khula take?',
      'What about children after Khula?',
      'How to claim maintenance after divorce?',
    ],
  },

  // ── CHILDREN AFTER KHULA ─────────────────────────────────────────────────
  children_khula: {
    answer: `Children After Khula — خلع کے بعد بچوں کا کیا ہو گا\n\nKhula and children's custody are SEPARATE legal matters. Getting Khula does NOT automatically decide custody.\n\nDefault Custody Rules (Islamic Law):\n- Mother gets sons until age 7\n- Mother gets daughters until puberty (age 12 to 13)\n- Father gets custody after these ages\n\nBUT Court Always Decides Based on Child's BEST INTEREST:\n- This overrides the default age rules\n- Child's health, education, environment all considered\n- Older children's own wishes are heard\n\nMother Loses Custody If She:\n- Remarries someone outside child's close family (mahram)\n- Is declared unfit (addiction, abuse, neglect)\n- Takes child abroad without court permission\n\nFather MUST ALWAYS Pay Maintenance:\n- Regardless of who has custody\n- Covers food, education, clothing, medical expenses\n- Court enforces this — can garnish salary or seize property\n\nDuring Khula Case:\n- Ask your lawyer to file custody petition at same time\n- Court can grant interim (temporary) custody quickly\n- Children's welfare is paramount — courts protect them`,
    tids: ['custody','tansikh'],
    followUp: [
      'How to file child custody petition?',
      'What if father does not pay maintenance?',
      'Can mother take child abroad?',
      'What is joint custody?',
    ],
  },

  // ── CHILD CUSTODY ────────────────────────────────────────────────────────
  custody: {
    answer: `Child Custody — حضانت\n\nDefault Rules Under Islamic Law:\n- Mother gets sons until age 7\n- Mother gets daughters until puberty (age 12-13)\n- Father gets custody after these ages\n\nBUT: Court ALWAYS decides based on child's best interest — this overrides all rules.\n\nMother Loses Custody If:\n- She remarries outside child's close family\n- Declared unfit (addiction, abuse)\n- Takes child abroad without court permission\n\nFather Must ALWAYS Pay (regardless of custody):\n- Monthly food, clothing, education expenses\n- All medical expenses\n\nHow to File:\n1. Petition in Family Court\n2. Attach child's B-Form and parents' CNICs\n3. Show financial ability and living environment\n4. Court may interview child if old enough`,
    tids: ['custody'],
    followUp: [
      'Can mother take child abroad without father?',
      'What if father does not pay maintenance?',
      'What is joint custody?',
      'How to change custody order?',
    ],
  },

  // ── CHILD ABROAD ─────────────────────────────────────────────────────────
  child_abroad: {
    answer: `Can Mother Take Child Abroad Without Father? — باہر ملک لے جانا\n\nShort Answer: NO — not without court permission or father's written consent.\n\nLegal Position:\n- Taking a child abroad without court permission is a serious offence\n- It can result in immediate custody being transferred to father\n- It may amount to "Child Abduction" under international law\n- Pakistan is a signatory to Hague Convention on Child Abduction\n\nHow to Take Child Abroad Legally:\n1. Get father's written notarized consent, OR\n2. File application in Family Court for permission\n3. Court grants permission if it is in child's best interest\n4. Court may attach conditions (duration, return date, contact with father)\n\nIf Child Was Already Taken Abroad Without Permission:\n- Father files urgent application in Family Court\n- Court issues immediate order for child's return\n- FIA can be requested to put child on Exit Control List (ECL)\n- International channels via Pakistani embassy can be activated\n\nNote: This applies to both parents — father also cannot take child abroad without mother's consent if mother has custody.`,
    tids: ['custody'],
    followUp: [
      'What if father does not pay maintenance?',
      'How to change custody order?',
      'What is joint custody?',
      'How to file child custody petition?',
    ],
  },

  // ── MAINTENANCE NOT PAID ─────────────────────────────────────────────────
  maintenance_not_paid: {
    answer: `Father Not Paying Child Maintenance — نفقہ نہیں دے رہا\n\nIf father has a court maintenance order but not paying:\n\nStep 1 — File Execution Application:\n- Go to same Family Court that issued maintenance order\n- File application to execute the order\n- Attach proof of non-payment (bank statement, witness statement)\n\nStep 2 — Court's Powers:\n- Deduct directly from father's salary (employer notified)\n- Freeze and seize his bank accounts\n- Attach (seize) his property and sell it\n- Imprisonment for contempt of court (last resort)\n\nStep 3 — If No Court Order Yet:\n- File fresh maintenance suit in Family Court\n- Court grants interim maintenance within 4 to 8 weeks\n- Retroactive maintenance can be claimed from date of petition\n\nAmounts Covered:\n- Monthly food and household expenses\n- School fees, books, uniform\n- Medical and health expenses\n- Basic clothing\n\nFree Legal Help:\n- Punjab Legal Aid Society: 0800-09008\n- Family courts are generally sympathetic to children's maintenance`,
    tids: ['consent','custody'],
    followUp: [
      'How much maintenance am I entitled to?',
      'Can wife claim maintenance without divorce?',
      'How to enforce maintenance order?',
      'What if husband hides income?',
    ],
  },

  // ── JOINT CUSTODY ────────────────────────────────────────────────────────
  joint_custody: {
    answer: `Joint Custody — مشترکہ حضانت\n\nPakistani law does not formally use the term "joint custody" but courts can and do create arrangements where both parents share responsibilities.\n\nWhat Joint Arrangements Look Like:\n- Child lives primarily with one parent (physical custody)\n- Both parents share major decisions (education, health, religion)\n- Regular visitation schedule for the non-custodial parent\n- Example: Weekdays with mother, weekends with father\n\nWhen Courts Arrange This:\n- Both parents are fit and capable\n- Parents live in same city\n- Parents can cooperate for child's benefit\n- Child is old enough to maintain relationship with both\n\nVisitation Rights:\n- Non-custodial parent has RIGHT to visit child\n- Court sets specific days, times, and location\n- Denying court-ordered visitation is contempt of court\n- Can result in custody transfer to the other parent\n\nBest Approach:\n- Write a detailed parenting plan with your lawyer\n- Specify holidays, school events, medical decisions\n- Put everything in writing — verbal agreements fail later`,
    tids: ['custody'],
    followUp: [
      'Can mother take child abroad?',
      'What if father does not pay maintenance?',
      'How to change custody order?',
      'What about children after Khula?',
    ],
  },

  // ── CHANGE CUSTODY ORDER ─────────────────────────────────────────────────
  change_custody: {
    answer: `How to Change Custody Order — تبدیلی حضانت\n\nCustody orders are NOT permanent. Courts can change them if circumstances change.\n\nGrounds to Change Custody:\n- Current custodial parent remarried (especially outside mahram)\n- Custodial parent has developed addiction or mental illness\n- Child is being abused or neglected\n- Child has reached the age where other parent gets custody by default\n- Custodial parent is moving to another country\n- Child themselves requests change (if old enough)\n\nProcess:\n1. File application for modification in same Family Court\n2. Explain what has changed since last order\n3. Provide evidence of changed circumstances\n4. Court may appoint welfare officer to assess child's situation\n5. Child's own statement may be taken if they are mature enough\n\nUrgent Custody Change:\n- If child is in immediate danger — file URGENT application\n- Court can grant emergency interim custody within 24 to 48 hours\n- Evidence of abuse or danger must be shown\n\nChild's Age:\n- As children grow older — their wishes carry more weight in court`,
    tids: ['custody'],
    followUp: [
      'What if father does not pay maintenance?',
      'Can mother take child abroad?',
      'What is joint custody?',
      'How to file child custody petition?',
    ],
  },

  // ── HARASSMENT ───────────────────────────────────────────────────────────
  harassment: {
    answer: `Harassment — Legal Protection — ہراسانی\n\nKey Laws:\n- Section 509 PPC: Insulting modesty — 3 years + fine\n- Section 506 PPC: Criminal threatening — 2 to 7 years\n- Workplace Harassment Act 2010: Complaint to Ombudsman\n- PECA 2016 Section 24: Cyber harassment — 3 years + Rs 1 million\n\nHow to Report:\n1. File FIR at nearest police station\n2. For workplace: Federal or Provincial Ombudsman\n3. For online: FIA Cybercrime 0800-02345 (FREE, 24/7)\n4. Apply for Court Protection Order\n\nEvidence to Collect:\n- Screenshots with timestamps\n- Call records and logs\n- Witness statements\n- Medical reports if physically harmed\n\nCourt Protection Order:\n- Judge orders harasser to stay away from you\n- Violating order = immediate arrest\n- Can be granted urgently within days`,
    tids: ['harassment'],
    followUp: [
      'How to get court protection order?',
      'What is cyber harassment law?',
      'How to report workplace harassment?',
      'What evidence is needed for harassment case?',
    ],
  },

  // ── PROTECTION ORDER ─────────────────────────────────────────────────────
  protection_order: {
    answer: `Court Protection Order — عدالتی حفاظتی حکم\n\nA protection order is a court order prohibiting the harasser from contacting, approaching, or threatening you.\n\nWho Can Apply:\n- Any person facing harassment, threats, or domestic violence\n- Can be applied for by victim or their family member\n\nHow to Get One:\n1. File application in relevant court (Family Court for domestic, Sessions Court for others)\n2. Describe the threat or harassment in detail\n3. Attach evidence — screenshots, messages, medical reports, witness names\n4. In urgent cases — court can grant INTERIM order same day\n5. Final order after full hearing (usually within 2 to 4 weeks)\n\nWhat Protection Order Contains:\n- Harasser must not come within specified distance of you\n- No phone calls, messages, or contact through any means\n- No contact through third parties\n- May include order to surrender weapons\n\nViolating the Order:\n- Immediate arrest — no bail at station level\n- Contempt of court charges\n- Additional imprisonment\n\nFor Domestic Violence:\n- Punjab Protection of Women Against Violence Act 2016\n- District Women Protection Committee oversees enforcement`,
    tids: ['harassment'],
    followUp: [
      'What is cyber harassment law?',
      'What evidence is needed for harassment case?',
      'How to report workplace harassment?',
      'What is domestic violence law?',
    ],
  },

  // ── CYBER HARASSMENT LAW ─────────────────────────────────────────────────
  cyber_harassment: {
    answer: `Cyber Harassment Law — PECA 2016 — سائبر ہراسانی\n\nSection 24 of PECA 2016 specifically covers online harassment:\n\nWhat is Covered:\n- Sending threatening or abusive messages online\n- Sharing private/intimate images without consent (Section 21 — 5 years + Rs 5 million)\n- Creating fake accounts to harass someone\n- Cyberstalking — monitoring someone's online activity to threaten them\n- Sending unsolicited sexual content\n\nPunishment:\n- Online harassment: 3 years imprisonment + Rs 1 million fine\n- Sharing intimate images: 5 years + Rs 5 million (very strict)\n- Fake accounts: 3 years + Rs 500,000\n\nHow to Report:\n- FIA Cybercrime Hotline: 0800-02345 (FREE, 24/7)\n- Online complaint: www.fia.gov.pk\n- Email: ccrc@fia.gov.pk\n- In-person: FIA Cybercrime Circle offices in all major cities\n\nEvidence to Save Immediately:\n- Screenshot everything — full screen with URL visible\n- Screenshot profile URLs and account details\n- Save all messages with dates and times\n- DO NOT delete chats — they are your evidence\n\nFor Blackmail: Do NOT pay. Report to FIA immediately. FIA regularly traces and arrests blackmailers.`,
    tids: ['harassment'],
    followUp: [
      'How to report fake Facebook account?',
      'What if someone shares my private photos?',
      'Is online blackmail a crime?',
      'How to get protection order?',
    ],
  },

  // ── WORKPLACE HARASSMENT ─────────────────────────────────────────────────
  workplace_harassment: {
    answer: `Workplace Harassment — دفتری ہراسانی\n\nGoverning Law: Protection Against Harassment of Women at the Workplace Act 2010\n\nWhat Counts as Workplace Harassment:\n- Unwanted sexual advances\n- Verbal or physical harassment\n- Creating a hostile work environment\n- Promises of promotion in exchange for sexual favors\n- Retaliation against someone who complains\n\nHow to File Complaint:\n\nStep 1 — Internal Inquiry Committee:\n- Every organization must have an Inquiry Committee\n- File written complaint to the committee\n- Committee must decide within 30 days\n\nStep 2 — Federal or Provincial Ombudsman:\n- If internal committee fails or does not exist\n- Federal Ombudsman: www.mohtasib.gov.pk\n- Provincial Ombudsmen in all 4 provinces\n- File online or visit office\n\nStep 3 — FIR at Police Station:\n- For serious cases involving assault or criminal threats\n- Section 509 PPC — up to 3 years\n\nPunishments Employer Faces:\n- Fine of Rs 50,000 to Rs 500,000\n- Termination of harasser\n- Organizational penalties\n\nYou CANNOT be fired for making a complaint — that itself is illegal.`,
    tids: ['harassment'],
    followUp: [
      'How to get court protection order?',
      'What is cyber harassment law?',
      'What evidence is needed for harassment case?',
      'What is domestic violence law?',
    ],
  },

  // ── EVIDENCE FOR HARASSMENT ──────────────────────────────────────────────
  harassment_evidence: {
    answer: `Evidence Needed for Harassment Case — ثبوت کیسے اکٹھا کریں\n\nDigital Evidence:\n- Screenshots of threatening messages (show full screen with date and URL)\n- Call logs showing repeated calls from harasser\n- Emails — take screenshots AND forward to a safe email\n- Social media posts — screenshot before they are deleted\n- WhatsApp/Telegram messages — screenshot with timestamp visible\n\nPhysical Evidence:\n- Medical examination report if you were physically harmed\n- Photographs of injuries with timestamps\n- Any objects used to threaten you\n\nWitness Evidence:\n- Names and contact numbers of anyone who witnessed harassment\n- Colleagues who heard threatening calls or saw incidents\n- Neighbors or family members who witnessed domestic incidents\n\nOfficial Records:\n- FIR copies if previously reported\n- Any previous court orders or restraining orders\n- Hospital records, police call logs\n\nImportant Tips:\n- Save everything to cloud storage (Google Drive) immediately\n- Share copies with a trusted friend or family member\n- Do NOT confront the harasser with evidence — go to police first\n- Keep a written diary of each incident with dates and exact details`,
    tids: ['harassment'],
    followUp: [
      'How to get court protection order?',
      'What is cyber harassment law?',
      'How to report workplace harassment?',
      'How to file FIR for harassment?',
    ],
  },

  // ── RIGHTS IF ARRESTED ───────────────────────────────────────────────────
  rights: {
    answer: `Your Legal Rights If Arrested — قانونی حقوق\n\nConstitutional Rights (Articles 9, 10, 10-A, 14):\n- Right to be told reason for arrest IMMEDIATELY\n- Right to remain SILENT\n- Right to contact family within 24 hours\n- Right to a lawyer immediately\n- Must be produced before Magistrate within 24 HOURS\n- Right to apply for bail\n- Right to FREE lawyer if you cannot afford one\n- TORTURE IS PROHIBITED — Anti-Torture Act 2022\n\nDuring Police Interrogation:\n- Lawyer can be present\n- You cannot be forced to confess\n- Confession to police is NOT admissible in court\n\nDuring Trial:\n- Right to know all charges\n- Right to cross-examine witnesses\n- Right to present your own defense\n- Right to appeal any conviction\n\nEmergency: 15 | Free Legal Aid: 0800-09008`,
    tids: ['bail-pre','bail-post'],
    followUp: [
      'What to do if police torture me?',
      'What is right to fair trial?',
      'How to complain against police?',
      'What is free legal aid?',
    ],
  },

  // ── POLICE TORTURE ───────────────────────────────────────────────────────
  police_torture: {
    answer: `Police Torture — What To Do — پولیس تشدد\n\nTorture is a CRIME in Pakistan under the Anti-Torture Act 2022.\n\nYour Rights:\n- Constitution Article 14: Dignity is inviolable — no torture allowed\n- Anti-Torture Act 2022: Police officer who tortures faces up to 10 years imprisonment\n- Confession obtained by torture is NOT valid in court\n\nImmediate Steps:\n1. Ask to see a doctor immediately — this is your right\n2. Demand a Medical Legal Certificate (MLC) from hospital\n3. Ensure doctor documents ALL injuries in detail\n4. Inform your lawyer immediately\n5. Have family members photograph injuries as soon as possible\n\nHow to File Complaint:\n- File FIR against torturing officer at another police station\n- Complain to DSP, SSP, or IGP\n- File Constitutional Petition in High Court under Article 199\n- Complain to National Commission on Human Rights (NCHR)\n- Pakistan Citizen Portal: www.citizenportal.gov.pk\n\nCourt Action:\n- High Court can order immediate medical examination\n- Court can order transfer of accused to another jail\n- Torturing officers can be arrested and prosecuted\n\nIMPORTANT: Get medical evidence FIRST — injuries heal, but medical records remain.`,
    tids: ['bail-post'],
    followUp: [
      'What are my rights if arrested?',
      'How to complain against police?',
      'What is right to fair trial?',
      'What is free legal aid?',
    ],
  },

  // ── FAIR TRIAL ───────────────────────────────────────────────────────────
  fair_trial: {
    answer: `Right to Fair Trial — منصفانہ مقدمے کا حق\n\nConstitution Article 10-A: Every person has the right to a fair trial.\n\nYour Rights During Trial:\n\nBefore Trial:\n- Right to know all charges against you in writing\n- Right to adequate time to prepare your defense\n- Right to hire a lawyer of your choice\n- Right to free legal aid if you cannot afford one\n\nDuring Trial:\n- Right to be present at every hearing\n- Right to hear all evidence presented against you\n- Right to cross-examine prosecution witnesses\n- Right to present your own witnesses and evidence\n- Right to remain silent — silence cannot be used against you\n- Right to an interpreter if you do not understand the language\n\nJudge's Obligations:\n- Must be impartial — no personal interest in the case\n- Must give written reasons for every decision\n- Cannot accept evidence obtained by torture\n- Must follow rules of evidence strictly\n\nAfter Trial:\n- Right to appeal conviction to higher court\n- Right to appeal sentence if too harsh\n- Right to apply for suspension of sentence during appeal\n\nViolation of Fair Trial Rights:\n- File complaint to High Court immediately\n- High Court can order retrial or acquittal`,
    tids: ['bail-pre','bail-post'],
    followUp: [
      'What are my rights if arrested?',
      'What to do if police torture me?',
      'How to complain against police?',
      'What is free legal aid?',
    ],
  },

  // ── FREE LEGAL AID ───────────────────────────────────────────────────────
  free_legal_aid: {
    answer: `Free Legal Aid in Pakistan — مفت قانونی مدد\n\nWho Is Entitled:\n- Anyone who cannot afford a lawyer\n- Women, children, disabled persons — priority\n- Prisoners who have no legal representation\n- Anyone facing serious criminal charges\n\nWhere to Get Free Legal Aid:\n\nPunjab:\n- Punjab Legal Aid Society: 0800-09008 (FREE, 24/7)\n- District Legal Empowerment Committees in all districts\n- Women's Legal Aid Clinics in Lahore, Rawalpindi, Faisalabad\n\nSindh:\n- Sindh Legal Aid Society\n- Karachi Bar Association Legal Aid\n\nKPK:\n- KPK Legal Aid Society, Peshawar\n\nFederal:\n- Supreme Court Legal Aid Office\n- NCSW Legal Aid Services for women\n\nNGO Support:\n- Aurat Foundation: Legal aid for women — www.aurat.org\n- Shirkat Gah: Women's rights organization\n- HRCP (Human Rights Commission of Pakistan): 042-35761999\n\nNote: You have a CONSTITUTIONAL RIGHT to a free lawyer. Tell the court you cannot afford one — the court must arrange one for you.`,
    tids: ['bail-pre','bail-post'],
    followUp: [
      'What are my rights if arrested?',
      'What to do if police torture me?',
      'What is right to fair trial?',
      'How to complain against police?',
    ],
  },

  // ── POLICE COMPLAINT ─────────────────────────────────────────────────────
  police_complaint: {
    answer: `Complaint Against Police — پولیس کے خلاف شکایت\n\nSteps in Order:\n\n1. Internal Hierarchy:\n- Against constable: Complain to SHO\n- Against SHO: Complain to DSP\n- Against DSP: Complain to SSP\n- Against SSP: Complain to DIG or IGP\n\n2. Government Portals:\n- Pakistan Citizen Portal: www.citizenportal.gov.pk\n- SMS to 1201 (PM Delivery Unit)\n\n3. Judicial Action:\n- Complaint before Judicial Magistrate\n- Writ Petition in High Court (Article 199)\n\n4. If Police Tortured You:\n- Demand medical exam and keep report\n- Anti-Torture Act 2022: Torture is a specific crime\n- File Constitutional Petition in High Court\n\nImportant Facts:\n- Demanding bribe = crime under Section 161 PPC\n- Filming police on duty in public is LEGAL`,
    tids: [],
    followUp: [
      'How to file High Court petition?',
      'What is Anti-Torture Act?',
      'Can a police officer be arrested?',
      'What is writ petition?',
    ],
  },

  // ── WRIT PETITION ────────────────────────────────────────────────────────
  writ_petition: {
    answer: `Writ Petition — رٹ پٹیشن\n\nA writ petition is a constitutional petition filed in High Court or Supreme Court to protect your fundamental rights.\n\nTypes of Writs Under Article 199:\n\n1. Habeas Corpus — "Produce the Body":\n- Filed when someone is illegally detained\n- Court orders person to be produced within 24 hours\n- Most urgent — court responds immediately\n\n2. Mandamus — "We Command":\n- Orders a public official to DO their legal duty\n- Example: Order police to register FIR\n- Example: Order school to give student their certificate\n\n3. Prohibition:\n- Stops a lower court from exceeding its authority\n- Filed when wrong court is hearing a case\n\n4. Certiorari:\n- Reviews and cancels unlawful decisions of lower courts\n\n5. Quo Warranto:\n- Challenges someone's right to hold a public office\n\nHow to File:\n1. Hire a High Court lawyer\n2. Lawyer drafts the writ petition\n3. File in relevant High Court registry\n4. Court may issue immediate interim order\n5. Full hearing scheduled\n\nCost: High Court lawyer fees vary — Rs 10,000 to Rs 100,000+\nFree: If you qualify for legal aid — 0800-09008`,
    tids: [],
    followUp: [
      'What is Habeas Corpus?',
      'How to complain against police?',
      'How to file FIR if police refuse?',
      'What is free legal aid?',
    ],
  },

  // ── HABEAS CORPUS ────────────────────────────────────────────────────────
  habeas_corpus: {
    answer: `Habeas Corpus — حبس بے جا\n\nHabeas Corpus means "Produce the Body" in Latin. It is the most powerful writ to protect a person from illegal detention.\n\nWhen to Use:\n- Someone has been arrested without legal reason\n- Person is being held beyond 24 hours without being produced before Magistrate\n- Person has been "disappeared" — whereabouts unknown\n- Person is being held in unofficial custody\n- Person is being held by a private party against their will\n\nHow It Works:\n1. Family member or lawyer files Habeas Corpus in High Court\n2. Court issues immediate notice to police/government\n3. Authority MUST produce the person before court within hours\n4. Court examines if detention is legal\n5. If detention is illegal — person is released immediately\n\nWho Can File:\n- The detained person themselves\n- Any family member\n- A friend\n- A lawyer on their behalf\n- Any concerned citizen\n\nSpeed: Habeas Corpus is heard URGENTLY — often same day\n\nIf Police Deny Having the Person:\n- Court can order full investigation\n- Officers can be held in contempt immediately\n- This is treated as an extremely serious matter`,
    tids: ['bail-pre'],
    followUp: [
      'What are my rights if arrested?',
      'What is writ petition?',
      'What to do if police torture me?',
      'What is free legal aid?',
    ],
  },

  // ── CYBER CRIME ──────────────────────────────────────────────────────────
  cyber: {
    answer: `Cyber Crime — PECA 2016\n\nOffences and Punishments:\n- Online Harassment (Section 24): 3 years + Rs 1 million fine\n- Sharing Intimate Images (Section 21): 5 years + Rs 5 million — very strict\n- Fake Account/Impersonation (Section 16): 3 years + Rs 500,000\n- Hacking (Section 3): 3 years + Rs 500,000\n- Online Fraud (Section 14): 3 years + Rs 500,000\n- Hate Speech Online (Section 11): 7 years + fine\n\nHow to Report:\n- FIA Cybercrime Hotline: 0800-02345 (FREE, 24/7)\n- Online: www.fia.gov.pk\n- Email: ccrc@fia.gov.pk\n\nFor Blackmail — DO NOT PAY:\n- Report to FIA immediately\n- FIA can trace and arrest blackmailers\n- Paying makes the situation worse\n\nEvidence to Save NOW:\n- Screenshot everything with date visible\n- Save all URLs and profile links\n- Change your passwords immediately`,
    tids: ['harassment'],
    followUp: [
      'How to report fake Facebook account?',
      'What if someone shares my private photos?',
      'Is online blackmail a crime?',
      'How to get content removed online?',
    ],
  },

  // ── FAKE FACEBOOK ACCOUNT ────────────────────────────────────────────────
  fake_account: {
    answer: `How to Report Fake Facebook / Social Media Account — جعلی اکاؤنٹ\n\nFake account using your name, photos, or identity is a crime under PECA 2016 Section 16 — up to 3 years + Rs 500,000 fine.\n\nStep 1 — Report to Facebook/Platform:\n- Go to the fake profile\n- Click three dots → Report → Pretending to Be Someone\n- Select "Me" — Facebook usually removes within 24 to 72 hours\n- Also report each offensive post individually\n\nStep 2 — Report to FIA Cybercrime:\n- Hotline: 0800-02345 (FREE, 24/7)\n- Online: www.fia.gov.pk/complaint\n- Email: ccrc@fia.gov.pk\n- FIA can legally demand platform to remove account AND trace the creator\n\nStep 3 — File FIR:\n- Go to local police station\n- Mention PECA 2016 Section 16 — Impersonation\n- Bring screenshots of the fake account\n\nEvidence to Save:\n- Screenshot the fake account's URL (www.facebook.com/...)\n- Screenshot all posts and messages from the fake account\n- Screenshot any messages sent to others from the fake account\n\nIf Account is Spreading False Information:\n- Also mention PECA Section 20 — defamation\n- Punishment: 3 years + Rs 1 million`,
    tids: ['harassment'],
    followUp: [
      'What if someone shares my private photos?',
      'Is online blackmail a crime?',
      'What is cyber harassment law?',
      'How to get content removed online?',
    ],
  },

  // ── PRIVATE PHOTOS SHARED ────────────────────────────────────────────────
  private_photos: {
    answer: `Someone Shared My Private Photos — ذاتی تصاویر شیئر کرنا\n\nThis is one of the STRICTEST crimes under Pakistani cyber law.\n\nLaw: PECA 2016 Section 21:\n- Sharing, displaying, or distributing intimate/private images without consent\n- Punishment: UP TO 5 YEARS imprisonment + Rs 5 million fine\n- No compromise — this is a non-compoundable offence\n\nImmediate Steps:\n1. Do NOT panic — you are the victim, not the criminal\n2. Screenshot all evidence — full URLs, accounts, messages\n3. Do NOT pay the blackmailer — ever\n4. Call FIA Cybercrime: 0800-02345 (FREE, 24/7) — available today\n5. File complaint online: www.fia.gov.pk/complaint\n\nFIA Can:\n- Trace the person who shared the content\n- Issue takedown notices to platforms immediately\n- Arrest the offender\n\nPlatform Reporting:\n- Facebook/Instagram: Report as "Nudity or Sexual Activity"\n- YouTube: Report as "Sexual Content"\n- Twitter/X: Report as "Non-Consensual Nudity"\n- Most platforms remove content within hours when properly reported\n\nYou Are Protected:\n- Your identity is kept confidential during FIA investigation\n- Women can file complaint without disclosing full identity initially\n- Lawyer not required to start FIA complaint`,
    tids: ['harassment'],
    followUp: [
      'Is online blackmail a crime?',
      'How to report fake Facebook account?',
      'What is cyber harassment law?',
      'How to get content removed online?',
    ],
  },

  // ── ONLINE BLACKMAIL ─────────────────────────────────────────────────────
  blackmail: {
    answer: `Online Blackmail — آن لائن بلیک میل\n\nBlackmailing is a serious crime — do NOT pay under any circumstances.\n\nRelevant Laws:\n- PECA 2016 Section 24: Online harassment — 3 years + Rs 1 million\n- PECA 2016 Section 21: Threatening to share private images — 5 years + Rs 5 million\n- PPC Section 503: Criminal intimidation — up to 2 years\n- PPC Section 506: Threatening — up to 7 years\n\nWhy You Must NOT Pay:\n- Payment NEVER stops blackmailer — they demand more\n- You lose money AND they still have the content\n- Paying confirms to them that you are vulnerable\n- FIA regularly catches blackmailers — report immediately\n\nWhat To Do RIGHT NOW:\n1. Screenshot everything — all messages, threats, profiles with URLs\n2. Do NOT delete any messages — they are your evidence\n3. Block the person on all platforms\n4. Call FIA Cybercrime: 0800-02345 (FREE, 24/7)\n5. File FIR at local police station\n\nFIA Action:\n- FIA has specialized Cybercrime Response Center\n- They regularly trace and arrest blackmailers\n- International cases handled through Interpol cooperation\n\nConfidentiality: FIA keeps victim's identity confidential.`,
    tids: ['harassment'],
    followUp: [
      'What if someone shares my private photos?',
      'How to report fake Facebook account?',
      'What is cyber harassment law?',
      'How to get content removed online?',
    ],
  },

  // ── CONTENT REMOVED ONLINE ───────────────────────────────────────────────
  content_removed: {
    answer: `How to Get Content Removed Online — آن لائن مواد ہٹوانا\n\nMethod 1 — Report to Platform Directly:\n- Facebook/Instagram: Three dots → Report → choose appropriate category\n- YouTube: Three dots → Report\n- Twitter/X: Three dots → Report\n- TikTok: Share → Report\n- Platforms typically act within 24 to 72 hours for clear violations\n\nMethod 2 — FIA Cybercrime (Most Powerful):\n- FIA has authority to issue legal takedown orders to platforms\n- Platforms MUST comply with FIA orders\n- Call: 0800-02345 (FREE) or file at www.fia.gov.pk\n- FIA can also geo-block content from Pakistan if platform refuses\n\nMethod 3 — Google Content Removal:\n- For search results: www.support.google.com/legal\n- Report non-consensual intimate images: specific Google form available\n- Google removes from search results (content still on original site)\n\nMethod 4 — PTA (Pakistan Telecommunication Authority):\n- PTA can block URLs in Pakistan\n- File complaint: www.pta.gov.pk\n- Content may be blocked within Pakistan even if platform refuses to remove it globally\n\nTimeline:\n- Platform self-reporting: 24 to 72 hours\n- FIA intervention: 3 to 7 days\n- PTA blocking: Within days`,
    tids: ['harassment'],
    followUp: [
      'Is online blackmail a crime?',
      'What if someone shares my private photos?',
      'How to report fake Facebook account?',
      'What is cyber harassment law?',
    ],
  },

  // ── DAR-UL-AMAN ──────────────────────────────────────────────────────────
  darulaman: {
    answer: `Dar-ul-Aman — Women Shelter Home — دارالامان\n\nGovernment shelter homes protecting women from:\n- Domestic violence\n- Forced marriage\n- Threat to life from family\n- Any unsafe home environment\n\n3 Application Types:\n\n1. Sending to Dar-ul-Aman:\n- Woman needs immediate protection\n- Emergency entry — NO court order needed\n- Woman's own consent required\n\n2. Meeting at Dar-ul-Aman:\n- Family wants to visit woman in shelter\n- Court permission required\n- Woman's consent must be verified by court\n\n3. Release from Dar-ul-Aman:\n- Court must verify woman is safe before releasing\n- Woman's own statement in court is most important\n\nEmergency:\n- Call 1043 (Punjab Women Helpline)\n- Any woman can walk in directly — FREE of charge`,
    tids: ['azad-darul','meeting-darul','sending-darul'],
    followUp: [
      'How to get woman released from Dar-ul-Aman?',
      'Can husband visit wife in Dar-ul-Aman?',
      'Is Dar-ul-Aman free of charge?',
      'What documents are needed for Dar-ul-Aman?',
    ],
  },

  // ── RELEASE FROM DARUL AMAN ──────────────────────────────────────────────
  release_darul: {
    answer: `How to Get Woman Released from Dar-ul-Aman — دارالامان سے رہائی\n\nRelease from Dar-ul-Aman is ONLY possible through court order — not by family demand.\n\nProcess:\n1. Family member files application in Family Court\n2. Court issues notice to Dar-ul-Aman and the woman\n3. Court interviews the woman PRIVATELY without family pressure\n4. Woman's own statement is the most important factor\n5. Court decides based on her safety and willingness\n\nCourt Will Release If:\n- Woman herself says she wants to leave and is safe\n- Threat or danger has been resolved\n- Safe alternative living arrangement is confirmed\n- No fear of further violence or forced marriage\n\nCourt Will NOT Release If:\n- Woman says she is afraid to leave\n- Threat to her life still exists\n- She does not have a safe place to go\n- She has not been heard independently\n\nImportant:\n- Family members CANNOT force release — court protects the woman's choice\n- Woman has full right to choose where she goes after Dar-ul-Aman\n- If she wants to go to a different family member — court can arrange this\n\nDuration: Process usually takes 1 to 3 weeks`,
    tids: ['azad-darul'],
    followUp: [
      'Can husband visit wife in Dar-ul-Aman?',
      'What is Dar-ul-Aman?',
      'Is Dar-ul-Aman free of charge?',
      'What documents are needed for Dar-ul-Aman?',
    ],
  },

  // ── HUSBAND VISIT DARUL AMAN ─────────────────────────────────────────────
  darul_visit: {
    answer: `Can Husband Visit Wife in Dar-ul-Aman? — دارالامان میں ملاقات\n\nDirect Visit by Husband: NOT ALLOWED without court permission.\n\nTo Arrange a Meeting:\n1. Husband files application for meeting in Family Court\n2. Court issues notice\n3. Court verifies that the woman CONSENTS to meeting\n4. If she consents — court grants supervised meeting\n5. Meeting takes place at Dar-ul-Aman in presence of staff — NOT in private\n\nIf Woman Does NOT Consent:\n- Court cannot force her to meet anyone\n- Her refusal is fully respected\n- No meeting is arranged\n\nSupervised Meeting Details:\n- Held in designated meeting room at Dar-ul-Aman\n- Dar-ul-Aman staff present throughout\n- Duration limited (usually 30 to 60 minutes)\n- No pressure or threats allowed — if observed, meeting ends immediately\n\nFor Children's Visitation:\n- Separate application for children to visit mother\n- Children's welfare is primary consideration\n- Usually permitted if children want to see mother\n\nUse the Meeting Dar-ul-Aman template on this platform to generate the proper court application.`,
    tids: ['meeting-darul'],
    followUp: [
      'How to get woman released from Dar-ul-Aman?',
      'What is Dar-ul-Aman?',
      'Is Dar-ul-Aman free of charge?',
      'What documents are needed for Dar-ul-Aman?',
    ],
  },

  // ── DARUL AMAN FREE ──────────────────────────────────────────────────────
  darul_free: {
    answer: `Is Dar-ul-Aman Free of Charge? — دارالامان مفت ہے\n\nYes — Dar-ul-Aman is 100% FREE for women.\n\nServices Provided FREE:\n- Safe accommodation (separate rooms available)\n- Three meals per day\n- Basic medical care and medications\n- Legal advice and assistance\n- Psychosocial counseling\n- Children's basic needs if children are with mother\n- Protection from any outside threat\n\nWho Funds It:\n- Government of Pakistan (provincial governments)\n- Punjab, Sindh, KPK, Balochistan all have their own Dar-ul-Aman\n- NGO-run shelters also exist in some cities\n\nWho Can Stay:\n- Any woman who needs protection — no income test\n- Women with children — children stay with mother\n- Women of any age\n- Women of any religion\n\nHow Long Can She Stay:\n- As long as she needs protection\n- Court may set review periods\n- No fixed maximum duration\n\nEmergency Entry:\n- No documents required for emergency entry\n- Call 1043 (Punjab) or come directly\n- Staff are trained to receive women in distress`,
    tids: ['azad-darul','sending-darul'],
    followUp: [
      'How to go to Dar-ul-Aman?',
      'What documents are needed for Dar-ul-Aman?',
      'Can husband visit wife in Dar-ul-Aman?',
      'How to get woman released from Dar-ul-Aman?',
    ],
  },

  // ── DARUL AMAN DOCUMENTS ─────────────────────────────────────────────────
  darul_docs: {
    answer: `Documents Needed for Dar-ul-Aman — ضروری کاغذات\n\nFor Emergency Entry (No Documents Required):\n- A woman in immediate danger can enter without ANY documents\n- Staff will arrange everything once she is safe\n- Just come or call 1043 — that is all that is needed\n\nDocuments That Help (bring if possible):\n- CNIC (National Identity Card) — if available\n- Children's B-Forms if children are with her\n- Any medical reports of injuries\n- Any previous FIR copies related to the situation\n- Nikah Nama if applicable\n\nDocuments NOT Required:\n- No fee or payment of any kind\n- No reference letter needed\n- No police escort required (though police can escort)\n- No court order needed for emergency shelter\n\nIf Documents Are Left at Home:\n- Staff can help arrange CNIC through NADRA later\n- Lawyer can retrieve court documents\n- Do NOT go back to dangerous situation just to get documents\n\nAfter She Arrives:\n- Dar-ul-Aman staff prepare a welfare report\n- This report is later used in court proceedings\n- Staff can also help her file FIR if she chooses`,
    tids: ['sending-darul'],
    followUp: [
      'What is Dar-ul-Aman?',
      'Is Dar-ul-Aman free of charge?',
      'How to get woman released from Dar-ul-Aman?',
      'Can husband visit wife in Dar-ul-Aman?',
    ],
  },

  // ── DOMESTIC VIOLENCE ────────────────────────────────────────────────────
  domestic_violence: {
    answer: `Domestic Violence — فوری قانونی مدد\n\nIF IN IMMEDIATE DANGER — Call 15 RIGHT NOW.\n\nLaws That Protect You:\n- Punjab Protection of Women Against Violence Act 2016\n- Sindh Domestic Violence Act 2013\n- KPK Domestic Violence Act 2021\n- PPC Sections 337, 341, 352 (Assault and Hurt)\n\nImmediate Steps:\n1. Call 15 if in immediate danger\n2. Go to trusted family member or neighbor\n3. Go to Dar-ul-Aman — no paperwork needed for emergency\n4. Get medical treatment — KEEP the report as evidence\n5. Photograph injuries with timestamps\n\nCourt Protection Order:\n- Prohibits abuser from approaching or contacting you\n- Granted within 24 hours in emergencies\n- Violating order = immediate arrest of abuser\n\nEmergency Helplines:\n- Police: 15\n- Women Helpline Punjab: 1043\n- Edhi Foundation: 115\n- Umang Helpline: 0317-4288665`,
    tids: ['harassment','sending-darul'],
    followUp: [
      'How to get protection order?',
      'How to go to Dar-ul-Aman?',
      'Can I take children when I leave?',
      'What evidence do I need for domestic violence case?',
    ],
  },

  // ── CHILDREN WHEN LEAVING ────────────────────────────────────────────────
  children_leaving: {
    answer: `Can I Take Children When Leaving Due to Domestic Violence?\n\nYes — you can take your children with you when leaving for safety.\n\nImmediate Situation:\n- If you are fleeing domestic violence — take your children with you\n- Your safety and children's safety come FIRST\n- You cannot be arrested for taking your own children to safety\n\nLegal Position:\n- Mother leaving does NOT automatically lose custody\n- Courts are sympathetic when mother leaves due to violence\n- Document the reason you left — medical reports, FIR, photos\n\nDar-ul-Aman:\n- Accepts mothers with children\n- Children's needs are provided — food, basic education\n- Children are safe within the shelter\n\nAfter You Are Safe:\n- File for custody in Family Court as soon as possible\n- File for interim (emergency) custody order\n- Interim custody is usually granted to mother quickly in domestic violence cases\n\nWhat NOT to Do:\n- Do NOT take children abroad without court permission\n- Do NOT prevent father from ALL contact (unless court has ordered this)\n- Do get a court order confirming custody as quickly as possible\n\nFree Legal Help: 0800-09008 | Women Helpline: 1043`,
    tids: ['custody','sending-darul'],
    followUp: [
      'How to go to Dar-ul-Aman?',
      'What evidence do I need for domestic violence case?',
      'How to get protection order?',
      'How to file child custody petition?',
    ],
  },

  // ── MAINTENANCE ──────────────────────────────────────────────────────────
  maintenance: {
    answer: `Maintenance (Nafaqa) — نفقہ\n\nWho is Entitled:\n- Wife: During marriage AND 3 months after divorce (Iddat)\n- Children: Son until earning independently, daughter until marriage\n- Parents: If elderly and unable to support themselves\n\nHow to Claim:\n1. Send written demand to husband — keep copy\n2. File maintenance suit in Family Court\n3. Attach Nikah Nama and show husband's income proof\n4. Court grants interim maintenance within 4 to 8 weeks\n\nIf Husband Refuses to Pay After Order:\n- Court can deduct from his salary directly\n- Court can freeze his bank accounts\n- Court can seize and sell his property\n- Willful non-payment = imprisonment for contempt\n\nChild Maintenance:\n- Father pays regardless of who has custody\n- Covers food, school fees, clothing, medical`,
    tids: ['consent'],
    followUp: [
      'How much maintenance am I entitled to?',
      'Can wife claim maintenance without divorce?',
      'How to enforce maintenance order?',
      'What if husband hides income?',
    ],
  },

  // ── HOW MUCH MAINTENANCE ─────────────────────────────────────────────────
  maintenance_amount: {
    answer: `How Much Maintenance Am I Entitled To? — نفقہ کتنا ملے گا\n\nMaintenance Amount is NOT Fixed By Law — court decides based on:\n\nFactors Court Considers:\n- Husband's income and financial capacity\n- Wife's needs and standard of living during marriage\n- Number and ages of children\n- Wife's own income (if any)\n- Cost of living in the area\n- Special needs — medical, education\n\nTypical Ranges (Pakistan 2024):\n- Urban middle class: Rs 15,000 to Rs 50,000 per month for wife\n- Rural areas: Rs 5,000 to Rs 20,000 per month\n- Each child: Rs 5,000 to Rs 25,000 per month depending on father's income\n\nWhat Wife Receives:\n- Monthly living expenses\n- Rent if she does not have accommodation\n- Utilities and food\n- Medical expenses\n- Clothing (seasonal)\n\nWhat Children Receive:\n- School fees (actual amount)\n- Food and daily expenses\n- Medical and health costs\n- Clothing\n\nHow to Maximize:\n- Bring evidence of husband's salary — bank statements, business records, tax returns\n- Keep receipts of children's school fees and medical bills\n- Court can increase maintenance later if circumstances change`,
    tids: ['consent'],
    followUp: [
      'Can wife claim maintenance without divorce?',
      'How to enforce maintenance order?',
      'What if husband hides income?',
      'What if father does not pay child maintenance?',
    ],
  },

  // ── MAINTENANCE WITHOUT DIVORCE ──────────────────────────────────────────
  maintenance_no_divorce: {
    answer: `Can Wife Claim Maintenance Without Divorce? — بغیر طلاق نفقہ\n\nYes — absolutely. Wife does NOT need to get divorced to claim maintenance.\n\nDuring Marriage:\n- Wife can claim maintenance if husband stops providing\n- File maintenance suit in Family Court while still married\n- Court grants maintenance going forward AND from date of petition\n- This is called "Conjugal Rights and Maintenance" suit\n\nIf Husband Has Abandoned Wife:\n- Wife can claim maintenance from date of abandonment\n- Court can order retroactive maintenance\n\nIf Husband Has Second Wife:\n- First wife's maintenance does NOT decrease\n- Husband must maintain BOTH wives equally\n- First wife can file maintenance suit if not being maintained properly\n\nIf Husband Refuses to Live With Wife:\n- Wife can file for "Restitution of Conjugal Rights"\n- Court orders husband to return or pay maintenance\n- If husband refuses — maintenance is compulsory\n\nDuring Iddat (After Divorce):\n- Wife is entitled to full maintenance for 3 months of Iddat\n- Husband must also pay if wife is pregnant — until delivery\n\nProcess: File maintenance suit in Family Court — same court handles it whether divorced or not.`,
    tids: ['consent'],
    followUp: [
      'How much maintenance am I entitled to?',
      'How to enforce maintenance order?',
      'What if husband hides income?',
      'How to claim maintenance after divorce?',
    ],
  },

  // ── ENFORCE MAINTENANCE ──────────────────────────────────────────────────
  enforce_maintenance: {
    answer: `How to Enforce Maintenance Order — نفقہ کا حکم نافذ کرنا\n\nIf husband has a court order but still not paying:\n\nStep 1 — File Execution Application:\n- Go to same Family Court that issued the order\n- File application for "Execution of Maintenance Decree"\n- No new case needed — same case number\n\nCourt Powers to Enforce:\n\nMethod 1 — Salary Deduction:\n- Court sends order to employer\n- Maintenance deducted from salary automatically every month\n- Employer must comply — it is a court order\n\nMethod 2 — Bank Account Freeze:\n- Court orders bank to freeze husband's account\n- Amount withdrawn and given to wife or children\n- Bank must comply within days\n\nMethod 3 — Property Attachment:\n- Court attaches husband's property\n- Property can be sold to recover maintenance arrears\n\nMethod 4 — Arrest:\n- Willful refusal to pay = Contempt of Court\n- Judge can order husband's arrest and imprisonment\n- This is last resort but courts do use it\n\nTimeline: Execution can begin immediately after order — no waiting period required.`,
    tids: ['consent'],
    followUp: [
      'What if husband hides income?',
      'How much maintenance am I entitled to?',
      'Can wife claim maintenance without divorce?',
      'What if father does not pay child maintenance?',
    ],
  },

  // ── HUSBAND HIDES INCOME ─────────────────────────────────────────────────
  husband_hides_income: {
    answer: `Husband Hiding Income to Avoid Maintenance — آمدنی چھپانا\n\nThis is a common issue — courts have experience dealing with it.\n\nHow to Prove Real Income:\n\nDocument Sources:\n- Bank statements (lawyer can request court subpoena)\n- Income tax returns (FBR records)\n- CNIC-linked assets — property, vehicles, businesses\n- Social media showing lifestyle (cars, holidays, restaurants)\n- Utility bills showing large household (contradicts claim of low income)\n\nCourt Can Order:\n- Bank to provide complete 12-month statement\n- FBR to provide tax records\n- Employer to provide salary certificate\n- Business partner statements\n\nBusiness Owners:\n- Court looks at lifestyle, not just declared income\n- Expensive car + expensive house but "low income" → court does not believe it\n- Business turnover is examined, not just "profit"\n\nProperty Check:\n- Any property registered in husband's name — Punjab: www.lrmis.gop.pk\n- Vehicle registration — husband's CNIC can be checked\n- Inherited property also counts toward ability to pay\n\nAsk Your Lawyer:\n- File application requesting court to conduct income inquiry\n- Courts frequently grant these inquiries in maintenance cases`,
    tids: ['consent'],
    followUp: [
      'How to enforce maintenance order?',
      'How much maintenance am I entitled to?',
      'Can wife claim maintenance without divorce?',
      'What if father does not pay child maintenance?',
    ],
  },

  // ── PROPERTY ─────────────────────────────────────────────────────────────
  property: {
    answer: `Property and Land Law — جائیداد\n\nIf Property Is Illegally Occupied:\n1. Get Fard (ownership record) from Patwari immediately\n2. File civil suit for possession in Civil Court\n3. Apply for Injunction (Stay Order) to stop any sale\n4. File FIR if criminal force or fraud was used\n\nInheritance Shares Under Islamic Law:\n- Wife: 1/8 if children exist, 1/4 if no children\n- Daughter: Half of son's share\n- Mother: 1/6 or 1/3 depending on situation\n- Son: Double of daughter's share\n\nCheck Land Records Online:\n- Punjab: www.lrmis.gop.pk\n- Sindh: www.sindhlands.gov.pk\n- KPK: www.kplands.gov.pk\n\nRegistry Fraud:\n- File FIR under Section 420 and 467 PPC\n- File civil suit to cancel fraudulent registry`,
    tids: ['consent'],
    followUp: [
      'How to claim inheritance?',
      'How to stop illegal property sale?',
      'What is Fard document?',
      'How to transfer property after death?',
    ],
  },

  // ── INHERITANCE ──────────────────────────────────────────────────────────
  inheritance: {
    answer: `How to Claim Inheritance — وراثت\n\nIslamic Inheritance Shares:\n- Son: Double of daughter's share\n- Daughter: Half of son's share\n- Wife: 1/8 if husband had children, 1/4 if no children\n- Mother: 1/6 with children, 1/3 without\n- Father: 1/6 with children, full estate if no children or siblings\n\nStep-by-Step Process:\n\nStep 1 — Get Succession Certificate:\n- File application in Civil Court (District Court)\n- Attach death certificate, CNIC of deceased, list of heirs\n- Court issues Succession Certificate after verifying heirs\n- Required for: bank accounts, stocks, movable assets\n\nStep 2 — Property Transfer:\n- Take Succession Certificate to Patwari\n- Apply for mutation (Intiqal) of property\n- Property records transferred to legal heirs\n\nStep 3 — If Family Members Refuse to Share:\n- File partition suit in Civil Court\n- Court divides property or orders sale and equal distribution\n\nFor Bank Accounts:\n- Bring death certificate + succession certificate to bank\n- Bank releases funds to legal heirs\n\nTimeline: Succession Certificate: 1 to 3 months | Property Transfer: 2 to 6 months`,
    tids: ['consent'],
    followUp: [
      'How to stop illegal property sale?',
      'What is Fard document?',
      'How to transfer property after death?',
      'What if family refuses to share inheritance?',
    ],
  },

  // ── STOP PROPERTY SALE ───────────────────────────────────────────────────
  stop_property_sale: {
    answer: `How to Stop Illegal Property Sale — غیر قانونی فروخت روکنا\n\nIf someone is trying to sell property that belongs to you or is disputed:\n\nStep 1 — Injunction (Stay Order) — Most Important:\n- File application in Civil Court immediately\n- Request temporary injunction to STOP the sale\n- Court can grant within hours if urgency is shown\n- Registry cannot be done until court order is lifted\n- Cost: Rs 200 to Rs 500 court fee + lawyer fee\n\nStep 2 — File Caveat at Registration Office:\n- Go to Sub-Registrar's office where property is registered\n- File a caveat notice\n- Registrar will NOT register any sale deed without notifying you first\n\nStep 3 — Criminal Action if Fraud:\n- If forged documents being used — File FIR under Section 420 (fraud) and 467 (forgery) PPC\n- Police can freeze transaction\n\nStep 4 — Check LRMIS:\n- Punjab: www.lrmis.gop.pk\n- Verify your name is on Fard\n- If name was changed fraudulently — apply for correction immediately\n\nACT FAST — once a property is registered in buyer's name in good faith, recovery becomes very difficult. Speed is critical.`,
    tids: ['consent'],
    followUp: [
      'What is Fard document?',
      'How to claim inheritance?',
      'How to transfer property after death?',
      'What is writ petition?',
    ],
  },

  // ── FARD DOCUMENT ────────────────────────────────────────────────────────
  fard: {
    answer: `What is Fard? — فرد کیا ہوتی ہے\n\nFard (also called Fard-e-Malkiat) is the official ownership record of land/property in Pakistan.\n\nWhat Fard Shows:\n- Owner's name and CNIC\n- Land size (in Marla, Kanal, Acre)\n- Location (Mouza, Khasra number)\n- Type of land (residential, agricultural, commercial)\n- Any encumbrances (mortgages, court orders)\n\nTypes of Fard:\n- Fard-e-Malkiat: Ownership record (most important)\n- Fard-e-Badar: Shows who is in physical possession\n- Fard-e-Intiqal: Mutation/transfer record\n\nHow to Get Fard:\n- Visit the local Patwari (land record officer) in your area\n- Punjab Online: www.lrmis.gop.pk → enter Khasra number\n- Arazi Record Centers (ARC) in Punjab — walk-in service\n- Fee: Rs 50 to Rs 200 typically\n\nWhy Fard is Important:\n- Required for buying and selling property\n- Required for court cases involving property\n- Required for bank loans against property\n- First thing to check if you suspect fraud\n\nIf Your Name is Not on Fard Despite Owning Property:\n- File application for Mutation (Intiqal) at Patwari office\n- Bring original sale deed and CNICs`,
    tids: ['consent'],
    followUp: [
      'How to claim inheritance?',
      'How to stop illegal property sale?',
      'How to transfer property after death?',
      'What is writ petition?',
    ],
  },

  // ── TRANSFER PROPERTY AFTER DEATH ────────────────────────────────────────
  property_transfer_death: {
    answer: `How to Transfer Property After Death — وفات کے بعد جائیداد منتقلی\n\nStep-by-Step Process:\n\nStep 1 — Death Certificate:\n- Get death certificate from Union Council within 30 days of death\n- Obtain multiple certified copies — you will need several\n\nStep 2 — Succession Certificate (for movable assets):\n- File petition in Civil Court\n- Attach: Death certificate, CNIC of deceased, list of all legal heirs\n- Court publishes notice for 30 days (for objections)\n- Court issues Succession Certificate if no dispute\n- Timeline: 1 to 3 months\n- Use for: Bank accounts, stocks, vehicles, pension\n\nStep 3 — Mutation of Property (Intiqal):\n- Go to local Patwari with: Death certificate, CNICs of all heirs, original property documents\n- Apply for Intiqal (mutation) in heirs' names\n- Patwari records names of all legal heirs on Fard\n- Tehsildar approves the mutation\n- Timeline: 2 to 8 weeks typically\n\nStep 4 — If Any Heir Disputes:\n- File partition suit in Civil Court\n- Court divides property fairly\n- Property may be sold and proceeds distributed if physical division is not possible\n\nCost: Court fee minimal + lawyer fee if needed\nFree: Mutation at Patwari level has nominal government fee only`,
    tids: ['consent'],
    followUp: [
      'How to claim inheritance?',
      'What is Fard document?',
      'How to stop illegal property sale?',
      'What is Succession Certificate?',
    ],
  },

  // ── SECOND MARRIAGE ──────────────────────────────────────────────────────
  second_marriage: {
    answer: `Second Marriage Law in Pakistan — دوسری شادی\n\nMuslim Family Laws Ordinance 1961 (Section 6) governs second marriage.\n\nWhat Is Required:\n- Written permission from Arbitration Council (Union Council)\n- First wife must be notified and given chance to present her case\n- Council examines if second marriage is "necessary and just"\n- Only THEN can man legally remarry\n\nIf Man Marries Without Permission:\n- Punishable under law: Up to 1 year imprisonment + Rs 5,000 fine\n- Also liable to pay entire prompt Mehr to first wife immediately\n- Second wife's rights are NOT affected — Nikah is still valid\n\nFirst Wife's Rights:\n- Must be informed and consulted\n- Can present objections to Arbitration Council\n- Can apply for divorce (Khula/Talaq) if she does not accept second marriage\n- Her maintenance cannot be reduced\n\nSecond Wife's Rights:\n- Equal maintenance and accommodation\n- Her children have full inheritance rights\n- She cannot be treated less fairly than first wife\n\nNote: Court regularly prosecutes men who marry secretly. First wife should file complaint at Union Council immediately if she discovers unauthorized second marriage.`,
    tids: ['second-marriage'],
    followUp: [
      'Can first wife stop second marriage?',
      'Is second marriage without permission illegal?',
      'What are first wife rights after second marriage?',
      'How to file complaint against unauthorized second marriage?',
    ],
  },

  // ── STOP SECOND MARRIAGE ─────────────────────────────────────────────────
  stop_second_marriage: {
    answer: `Can First Wife Stop Second Marriage? — پہلی بیوی دوسری شادی روک سکتی ہے\n\nLegal Position:\n- First wife CANNOT permanently prevent second marriage in Islamic Law\n- However, she has strong rights to be informed and consulted\n\nWhat First Wife CAN Do:\n\n1. Complaint to Arbitration Council:\n- Go to Union Council where husband is registered\n- File objection before Arbitration Council\n- Council must hear her before granting permission\n- Council may refuse permission if second marriage is unjust\n\n2. If Husband Already Married Secretly:\n- File criminal complaint — up to 1 year jail for husband\n- Husband must pay full Mehr to first wife immediately\n- First wife can claim divorce with full financial rights\n\n3. Nikah Nama Clause:\n- If first wife's Nikah Nama included a clause delegating divorce right (Tafweed-e-Talaq) in case of second marriage\n- She can AUTOMATICALLY divorce without court\n- This clause must have been signed at time of Nikah\n\n4. Maintenance Enforcement:\n- If second wife gets more maintenance — first wife can go to court\n- Both wives must be treated equally in maintenance\n\nPractical Advice: Many women in this situation choose to seek Khula — they receive full financial rights and freedom.`,
    tids: ['second-marriage'],
    followUp: [
      'Is second marriage without permission illegal?',
      'What are first wife rights after second marriage?',
      'How to get Khula divorce?',
      'How to file complaint against unauthorized second marriage?',
    ],
  },

  // ── GENERAL ──────────────────────────────────────────────────────────────
  general: {
    answer: `InCrime Legal AI — میں آپ کی مدد کر سکتا ہوں\n\nCriminal Law:\n- Bail applications (pre-arrest and post-arrest)\n- FIR filing and what to do if police refuse\n- Theft, Robbery, Dacoity\n- Harassment and protection orders\n- Cyber Crime (PECA 2016)\n- Challan and court procedures\n\nFamily Law:\n- Nikah and marriage registration\n- Divorce — Talaq and Khula\n- Child custody and guardianship\n- Maintenance (Nafaqa)\n- Dar-ul-Aman applications\n- Second marriage law\n\nRights and General:\n- Constitutional fundamental rights\n- Rights if arrested or detained\n- Police complaint procedures\n- Free legal aid contacts\n- Property and inheritance law\n\nType your specific question in English or Urdu.`,
    tids: ['bail-pre','bail-post','theft','harassment','challan','consent','attendance','nikah','custody','tansikh','second-marriage','azad-darul','meeting-darul','sending-darul'],
    followUp: [
      'How to file a bail application?',
      'How to file an FIR?',
      'How to get Khula divorce?',
      'What are my rights if arrested?',
    ],
  },
};

// ─── KEYWORD MATCHING: Every follow-up question maps to correct KB entry ────
function getLocalAnswer(msg) {
  const m = msg.toLowerCase();

  // ── SURETY ──────────────────────────────────────────────────────────────
  if (m.includes('surety') || m.includes('zameen') && m.includes('bail') || m.includes('guarantor') || m.includes('zamin') || m.includes('ضامن')) return LOCAL_KB.surety;
  if (m.includes('cannot find') && m.includes('surety') || m.includes('no surety') || m.includes('surety nahi') || m.includes('personal bond') || m.includes('pr bond')) return LOCAL_KB.surety_cannot_find;

  // ── BAIL REJECTED ────────────────────────────────────────────────────────
  if ((m.includes('reject') || m.includes('refuse') || m.includes('denied') || m.includes('nahi mili')) && m.includes('bail')) return LOCAL_KB.bail_rejected;

  // ── STATUTORY BAIL ───────────────────────────────────────────────────────
  if (m.includes('statutory bail') || m.includes('automatic bail') || (m.includes('challan') && m.includes('bail')) || m.includes('section 167')) return LOCAL_KB.statutory_bail;

  // ── BAIL AFTER CHALLAN ───────────────────────────────────────────────────
  if (m.includes('bail after challan') || (m.includes('challan') && m.includes('bail apply'))) return LOCAL_KB.bail_after_challan;

  // ── FIR vs CHALLAN ───────────────────────────────────────────────────────
  if ((m.includes('difference') || m.includes('fark')) && m.includes('fir') && m.includes('challan')) return LOCAL_KB.fir_vs_challan;

  // ── CHALLAN ──────────────────────────────────────────────────────────────
  if (m.includes('what is challan') || m.includes('challan kya') || m.includes('charge sheet') || (m.includes('challan') && !m.includes('bail'))) return LOCAL_KB.challan;

  // ── POLICE REFUSE FIR ────────────────────────────────────────────────────
  if ((m.includes('refuse') || m.includes('nahi') || m.includes('denied') || m.includes('inkar')) && (m.includes('fir') || m.includes('register'))) return LOCAL_KB.fir_refuse;
  if (m.includes('police refuse') || m.includes('sho refuse') || m.includes('polis ne')) return LOCAL_KB.fir_refuse;
  if (m.includes('should i do if police refuse')) return LOCAL_KB.fir_refuse;

  // ── FIR CANCEL ───────────────────────────────────────────────────────────
  if ((m.includes('cancel') || m.includes('withdraw') || m.includes('wapas')) && m.includes('fir')) return LOCAL_KB.fir_cancel;
  if (m.includes('can fir be') || m.includes('case settle') || m.includes('case band')) return LOCAL_KB.fir_cancel;
  if (m.includes('crimes can be settled') || m.includes('compoundable') || m.includes('diyat')) return LOCAL_KB.fir_cancel;

  // ── FIR COPY ─────────────────────────────────────────────────────────────
  if (m.includes('fir copy') || m.includes('copy of fir') || (m.includes('get fir') && !m.includes('how to file'))) return LOCAL_KB.fir_copy;

  // ── NBW / WARRANT ────────────────────────────────────────────────────────
  if (m.includes('nbw') || m.includes('non-bailable warrant') || m.includes('non bailable warrant') || (m.includes('warrant') && m.includes('non'))) return LOCAL_KB.nbw;
  if ((m.includes('cancel') || m.includes('cancel')) && m.includes('warrant')) return LOCAL_KB.cancel_warrant;

  // ── MISS COURT ───────────────────────────────────────────────────────────
  if (m.includes('miss court') || m.includes('court miss') || m.includes('absent court') || m.includes('peshi nahi') || m.includes('if i miss')) return LOCAL_KB.miss_court;

  // ── ATTENDANCE EXCUSED ───────────────────────────────────────────────────
  if (m.includes('attendance excused') || m.includes('peshi maaf') || m.includes('excuse absence') || m.includes('excuse from court')) return LOCAL_KB.attendance_excused;

  // ── POLICE COMPLAINT ─────────────────────────────────────────────────────
  if (m.includes('police') && (m.includes('complaint') || m.includes('corrupt') || m.includes('against') || m.includes('galat') || m.includes('sho ko'))) return LOCAL_KB.police_complaint;
  if (m.includes('complain against') && m.includes('police')) return LOCAL_KB.police_complaint;
  if (m.includes('how to file complaint against')) return LOCAL_KB.police_complaint;

  // ── POLICE TORTURE ───────────────────────────────────────────────────────
  if (m.includes('torture') || m.includes('tashaddud') || m.includes('anti-torture') || m.includes('anti torture') || (m.includes('police') && m.includes('beat'))) return LOCAL_KB.police_torture;
  if (m.includes('what to do if police torture')) return LOCAL_KB.police_torture;

  // ── WRIT PETITION ────────────────────────────────────────────────────────
  if (m.includes('writ petition') || m.includes('writ') && m.includes('court') || m.includes('ratt petition')) return LOCAL_KB.writ_petition;

  // ── HABEAS CORPUS ────────────────────────────────────────────────────────
  if (m.includes('habeas corpus') || m.includes('habeas') || m.includes('illegal detention') || m.includes('forcibly detained')) return LOCAL_KB.habeas_corpus;

  // ── FAIR TRIAL ───────────────────────────────────────────────────────────
  if (m.includes('fair trial') || m.includes('right to trial') || m.includes('article 10-a') || m.includes('trial rights')) return LOCAL_KB.fair_trial;

  // ── FREE LEGAL AID ───────────────────────────────────────────────────────
  if (m.includes('free legal') || m.includes('free lawyer') || m.includes('mufat lawyer') || m.includes('legal aid') || m.includes('0800-09008')) return LOCAL_KB.free_legal_aid;

  // ── KHULA TIME ───────────────────────────────────────────────────────────
  if ((m.includes('how long') || m.includes('kitna waqt') || m.includes('time') || m.includes('duration') || m.includes('kitny din')) && (m.includes('khula') || m.includes('divorce'))) return LOCAL_KB.khula_time;

  // ── HUSBAND REFUSE KHULA ─────────────────────────────────────────────────
  if ((m.includes('husband refuse') || m.includes('refuses khula') || m.includes('khula refuse') || m.includes('khula nahi deta') || m.includes('if husband refuses')) && (m.includes('khula') || m.includes('divorce'))) return LOCAL_KB.husband_refuse_khula;
  if (m.includes('can husband refuse')) return LOCAL_KB.husband_refuse_khula;

  // ── MEHR AFTER KHULA ─────────────────────────────────────────────────────
  if (m.includes('mehr') || m.includes('mehar') || m.includes('dower')) return LOCAL_KB.mehr_khula;

  // ── CHILDREN AFTER KHULA ─────────────────────────────────────────────────
  if ((m.includes('children') || m.includes('bachay') || m.includes('bache') || m.includes('kids')) && (m.includes('khula') || m.includes('divorce') || m.includes('after'))) return LOCAL_KB.children_khula;

  // ── CHILD ABROAD ─────────────────────────────────────────────────────────
  if ((m.includes('abroad') || m.includes('bahar') || m.includes('foreign') || m.includes('take child')) && (m.includes('child') || m.includes('bache') || m.includes('custody'))) return LOCAL_KB.child_abroad;
  if (m.includes('can mother take child abroad')) return LOCAL_KB.child_abroad;

  // ── MAINTENANCE NOT PAID (children) ─────────────────────────────────────
  if ((m.includes('not pay') || m.includes('nahi deta') || m.includes('refuses to pay') || m.includes('maintenance nahi')) && (m.includes('father') || m.includes('maintenance') || m.includes('child'))) return LOCAL_KB.maintenance_not_paid;

  // ── JOINT CUSTODY ────────────────────────────────────────────────────────
  if (m.includes('joint custody') || m.includes('shared custody') || m.includes('mushtraka hazanat')) return LOCAL_KB.joint_custody;

  // ── CHANGE CUSTODY ───────────────────────────────────────────────────────
  if ((m.includes('change') || m.includes('modify') || m.includes('badal') || m.includes('tabdeel')) && m.includes('custody')) return LOCAL_KB.change_custody;

  // ── PROTECTION ORDER ─────────────────────────────────────────────────────
  if (m.includes('protection order') || m.includes('restraining order') || m.includes('hifazti hukum') || (m.includes('court order') && m.includes('harass'))) return LOCAL_KB.protection_order;
  if (m.includes('how to get court protection') || m.includes('stay away order')) return LOCAL_KB.protection_order;

  // ── CYBER HARASSMENT LAW ─────────────────────────────────────────────────
  if (m.includes('cyber harassment law') || m.includes('peca') || m.includes('section 24') || (m.includes('cyber') && m.includes('law'))) return LOCAL_KB.cyber_harassment;
  if (m.includes('what is cyber harassment')) return LOCAL_KB.cyber_harassment;

  // ── WORKPLACE HARASSMENT ─────────────────────────────────────────────────
  if (m.includes('workplace') || m.includes('work place') || m.includes('office') && m.includes('harass') || m.includes('ombudsman') || m.includes('harassment at work')) return LOCAL_KB.workplace_harassment;

  // ── HARASSMENT EVIDENCE ──────────────────────────────────────────────────
  if (m.includes('evidence') && (m.includes('harass') || m.includes('case') || m.includes('abuse'))) return LOCAL_KB.harassment_evidence;
  if (m.includes('what evidence') || m.includes('kya saboot') || m.includes('proof needed')) return LOCAL_KB.harassment_evidence;

  // ── FAKE ACCOUNT ─────────────────────────────────────────────────────────
  if (m.includes('fake account') || m.includes('fake profile') || m.includes('impersonation') || m.includes('jali account') || (m.includes('facebook') && m.includes('fake'))) return LOCAL_KB.fake_account;
  if (m.includes('report fake facebook') || m.includes('fake id report')) return LOCAL_KB.fake_account;

  // ── PRIVATE PHOTOS ───────────────────────────────────────────────────────
  if (m.includes('private photo') || m.includes('intimate image') || m.includes('private video') || m.includes('share my photo') || m.includes('raz ki tasveer') || m.includes('someone shares my')) return LOCAL_KB.private_photos;

  // ── BLACKMAIL ────────────────────────────────────────────────────────────
  if (m.includes('blackmail') || m.includes('blakmeil') || (m.includes('online') && m.includes('threaten')) || m.includes('is online blackmail')) return LOCAL_KB.blackmail;

  // ── CONTENT REMOVED ──────────────────────────────────────────────────────
  if (m.includes('content removed') || m.includes('remove content') || m.includes('delete online') || m.includes('hatao online') || m.includes('get content removed')) return LOCAL_KB.content_removed;

  // ── RELEASE DARUL AMAN ───────────────────────────────────────────────────
  if ((m.includes('release') || m.includes('rihai') || m.includes('azad') || m.includes('released from')) && (m.includes('darul') || m.includes('dar ul') || m.includes('shelter'))) return LOCAL_KB.release_darul;

  // ── VISIT DARUL AMAN ─────────────────────────────────────────────────────
  if ((m.includes('visit') || m.includes('milna') || m.includes('meeting') || m.includes('can husband visit')) && (m.includes('darul') || m.includes('dar ul') || m.includes('shelter'))) return LOCAL_KB.darul_visit;

  // ── DARUL FREE ───────────────────────────────────────────────────────────
  if ((m.includes('free') || m.includes('mufat') || m.includes('cost') || m.includes('charge') || m.includes('fee')) && (m.includes('darul') || m.includes('shelter'))) return LOCAL_KB.darul_free;

  // ── DARUL DOCS ───────────────────────────────────────────────────────────
  if (m.includes('document') && (m.includes('darul') || m.includes('shelter')) || m.includes('what documents') && m.includes('darul')) return LOCAL_KB.darul_docs;

  // ── DOMESTIC VIOLENCE ────────────────────────────────────────────────────
  if (m.includes('domestic violence') || m.includes('marta hai') || m.includes('maar peet') || m.includes('ghar mein') && (m.includes('mara') || m.includes('maarta'))) return LOCAL_KB.domestic_violence;

  // ── CHILDREN LEAVING DUE TO DV ──────────────────────────────────────────
  if ((m.includes('take children') || m.includes('bache le jao') || m.includes('kids when leaving') || m.includes('can i take')) && (m.includes('leav') || m.includes('violence') || m.includes('escape'))) return LOCAL_KB.children_leaving;

  // ── MAINTENANCE AMOUNT ───────────────────────────────────────────────────
  if ((m.includes('how much') || m.includes('kitna') || m.includes('amount') || m.includes('entitled to')) && m.includes('maintenance')) return LOCAL_KB.maintenance_amount;
  if (m.includes('how much maintenance')) return LOCAL_KB.maintenance_amount;

  // ── MAINTENANCE WITHOUT DIVORCE ──────────────────────────────────────────
  if ((m.includes('without divorce') || m.includes('bina talaq') || m.includes('still married') || m.includes('during marriage')) && m.includes('maintenance')) return LOCAL_KB.maintenance_no_divorce;
  if (m.includes('can wife claim maintenance without')) return LOCAL_KB.maintenance_no_divorce;

  // ── ENFORCE MAINTENANCE ──────────────────────────────────────────────────
  if ((m.includes('enforce') || m.includes('nafiz') || m.includes('force him to pay') || m.includes('collect maintenance')) && m.includes('maintenance')) return LOCAL_KB.enforce_maintenance;
  if (m.includes('how to enforce maintenance')) return LOCAL_KB.enforce_maintenance;

  // ── HUSBAND HIDES INCOME ─────────────────────────────────────────────────
  if (m.includes('hides income') || m.includes('hide income') || m.includes('chupa raha') || (m.includes('husband') && m.includes('income') && (m.includes('prove') || m.includes('real')))) return LOCAL_KB.husband_hides_income;

  // ── INHERITANCE ──────────────────────────────────────────────────────────
  if (m.includes('claim inheritance') || m.includes('warasat') || m.includes('succession') || m.includes('how to claim') && m.includes('inherit')) return LOCAL_KB.inheritance;
  if (m.includes('family refuses') && m.includes('inheritance') || m.includes('refused share')) return LOCAL_KB.inheritance;

  // ── STOP PROPERTY SALE ───────────────────────────────────────────────────
  if ((m.includes('stop') || m.includes('prevent') || m.includes('rok') || m.includes('illegal sale')) && (m.includes('property') || m.includes('zameen') || m.includes('plot'))) return LOCAL_KB.stop_property_sale;

  // ── FARD ─────────────────────────────────────────────────────────────────
  if (m.includes('fard') || m.includes('fard-e-malkiat') || m.includes('ownership record') || (m.includes('patwari') && m.includes('document'))) return LOCAL_KB.fard;

  // ── PROPERTY AFTER DEATH ─────────────────────────────────────────────────
  if ((m.includes('transfer') || m.includes('after death') || m.includes('wafat') || m.includes('intiqal')) && (m.includes('property') || m.includes('zameen'))) return LOCAL_KB.property_transfer_death;

  // ── SECOND MARRIAGE ──────────────────────────────────────────────────────
  if (m.includes('second marriage') || m.includes('dusri shadi') || m.includes('polygamy') || m.includes('do shadian')) return LOCAL_KB.second_marriage;
  if (m.includes('stop second marriage') || m.includes('can first wife stop')) return LOCAL_KB.stop_second_marriage;
  if (m.includes('is second marriage without permission') || m.includes('without permission illegal')) return LOCAL_KB.second_marriage;

  // ── PRE-ARREST BAIL ──────────────────────────────────────────────────────
  if ((m.includes('pre') || m.includes('anticipatory') || m.includes('se pehle') || m.includes('pehle ki')) && m.includes('bail')) return LOCAL_KB.bail_pre;
  if (m.includes('how to file pre-arrest') || m.includes('pre arrest bail kaise')) return LOCAL_KB.bail_pre;

  // ── POST-ARREST BAIL ─────────────────────────────────────────────────────
  if ((m.includes('post') || m.includes('after arrest') || m.includes('ke baad') || m.includes('after being arrested')) && m.includes('bail')) return LOCAL_KB.bail_post;
  if (m.includes('how to file post-arrest') || m.includes('post arrest bail kaise')) return LOCAL_KB.bail_post;

  // ── BAIL (general) ───────────────────────────────────────────────────────
  if (m.includes('bail')) return LOCAL_KB.bail;

  // ── FIR (general) ────────────────────────────────────────────────────────
  if (m.includes('fir') || m.includes('first information') || m.includes('muqadma') || m.includes('ایف آئی آر')) return LOCAL_KB.fir;
  if (m.includes('theft') || m.includes('chori') || m.includes('stolen') || m.includes('robbery') || m.includes('snatch') || m.includes('dacoity')) return { ...LOCAL_KB.fir, tids: ['theft'] };

  // ── KHULA / DIVORCE (general) ────────────────────────────────────────────
  if (m.includes('khula') || m.includes('divorce') || m.includes('talaq') || m.includes('طلاق') || m.includes('خلع')) return LOCAL_KB.khula;

  // ── NIKAH ────────────────────────────────────────────────────────────────
  if (m.includes('nikah') || (m.includes('marriage') && !m.includes('second')) || m.includes('shadi register') || m.includes('nikkah')) return { answer: LOCAL_KB.general.answer, tids: ['nikah'], followUp: ['What is Mehr?', 'How to register Nikah?', 'What if Nikah Nama is lost?', 'What is Tansikh Nikah?'] };

  // ── CUSTODY (general) ────────────────────────────────────────────────────
  if (m.includes('custody') || m.includes('hazanat') || m.includes('bachay') || m.includes('حضانت')) return LOCAL_KB.custody;

  // ── RIGHTS (general) ─────────────────────────────────────────────────────
  if (m.includes('rights') || m.includes('arrested') || m.includes('griftari') || m.includes('haqooq') || m.includes('fundamental right')) return LOCAL_KB.rights;

  // ── MAINTENANCE (general) ────────────────────────────────────────────────
  if (m.includes('maintenance') || m.includes('nafaqa') || m.includes('kharcha') || m.includes('guzara') || m.includes('نفقہ')) return LOCAL_KB.maintenance;

  // ── PROPERTY (general) ──────────────────────────────────────────────────
  if (m.includes('property') || m.includes('zameen') || m.includes('inheritance') || m.includes('jaidad') || m.includes('qabza')) return LOCAL_KB.property;

  // ── HARASSMENT (general) ─────────────────────────────────────────────────
  if (m.includes('harassment') || m.includes('harass') || m.includes('blackmail') || m.includes('threat') || m.includes('tang')) return LOCAL_KB.harassment;

  // ── CYBER (general) ──────────────────────────────────────────────────────
  if (m.includes('cyber') || m.includes('online') || m.includes('facebook') || m.includes('hacking') || m.includes('internet crime')) return LOCAL_KB.cyber;

  // ── DARUL AMAN (general) ─────────────────────────────────────────────────
  if (m.includes('darul') || m.includes('dar ul') || m.includes('dar-ul') || m.includes('shelter') || m.includes('دارالامان')) return LOCAL_KB.darulaman;

  // ── DIFFERENCE PRE vs POST BAIL ──────────────────────────────────────────
  if (m.includes('difference') && m.includes('bail') && (m.includes('pre') || m.includes('post'))) return LOCAL_KB.bail_pre;

  // ── CITIZEN PORTAL ───────────────────────────────────────────────────────
  if (m.includes('citizen portal') || m.includes('citizenportal') || m.includes('pakistan portal') || m.includes('1201')) return LOCAL_KB.fir_refuse;

  // ── CONSENT / COMPROMISE ─────────────────────────────────────────────────
  if (m.includes('consent') || m.includes('compromise') || m.includes('sulah') || m.includes('settle case')) return LOCAL_KB.fir_cancel;

  return LOCAL_KB.general;
}

// ─── FORMAT BOT MESSAGE ──────────────────────────────────────────────────────
function formatMessage(text, darkMode) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 5 }} />;
    if (line.match(/^[A-Z\u0600-\u06FF][A-Z\s\-\/\u0600-\u06FF]+:?\s*$/) && line.length < 70 && !line.startsWith('-')) {
      return <div key={i} style={{ fontWeight: 700, color: C.primary, marginTop: 12, marginBottom: 3, fontSize: 12.5 }}>{line}</div>;
    }
    if (line.startsWith('- ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 4 }}>
          <span style={{ color: C.gold, fontWeight: 800, flexShrink: 0 }}>•</span>
          <span style={{ fontSize: 13.5, lineHeight: 1.65 }}>{line.slice(2)}</span>
        </div>
      );
    }
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\.\s/)[1];
      const rest = line.replace(/^\d+\.\s/, '');
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 4 }}>
          <span style={{ color: C.gold, fontWeight: 800, flexShrink: 0, minWidth: 20 }}>{num}.</span>
          <span style={{ fontSize: 13.5, lineHeight: 1.65 }}>{rest}</span>
        </div>
      );
    }
    if (line.startsWith('Step ') || line.match(/^(Warning|Note|Important):/)) {
      return <div key={i} style={{ fontSize: 13.5, fontWeight: 600, color: line.startsWith('Warning') ? '#c0392b' : C.primary, marginTop: 4, marginBottom: 2 }}>{line}</div>;
    }
    return <div key={i} style={{ fontSize: 13.5, lineHeight: 1.7, marginBottom: 2 }}>{line}</div>;
  });
}

// ─── TEMPLATE CARD ───────────────────────────────────────────────────────────
function TemplateCard({ t, onGo }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onGo(t.route)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 13px', borderRadius: 10, cursor: 'pointer', marginBottom: 6,
        background: hov ? C.primary : '#fff',
        border: `1.5px solid ${hov ? C.primary : '#e4e8ef'}`,
        transition: 'all 0.18s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontSize: 19 }}>{t.emoji}</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: hov ? '#fff' : C.primary }}>{t.label}</div>
          <div style={{ fontSize: 11.5, color: hov ? 'rgba(255,255,255,0.6)' : '#999', fontFamily: 'serif', direction: 'rtl' }}>{t.urdu}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          fontSize: 11, padding: '2px 7px', borderRadius: 8, fontWeight: 600,
          background: t.cat === 'criminal' ? (hov ? 'rgba(255,80,80,0.2)' : '#fff0f0') : (hov ? 'rgba(80,200,80,0.2)' : '#f0fff4'),
          color: t.cat === 'criminal' ? (hov ? '#ffaaaa' : '#c62828') : (hov ? '#aaffaa' : '#2e7d32'),
        }}>
          {t.cat === 'criminal' ? 'Criminal' : 'Family'}
        </span>
        <FiArrowRight size={14} color={hov ? '#fff' : C.gold} />
      </div>
    </div>
  );
}

// ─── TEMPLATE BOX ────────────────────────────────────────────────────────────
function TemplateBox({ tids, onGo }) {
  const [expanded, setExpanded] = useState(false);
  const list = byId(tids);
  if (!list.length) return null;
  const shown = expanded ? list : list.slice(0, 3);
  return (
    <div style={{
      marginTop: 10, padding: '13px 14px', borderRadius: 12,
      background: 'linear-gradient(135deg,#fffbea,#fff)',
      border: `2px solid rgba(201,162,39,0.3)`,
      boxShadow: '0 2px 12px rgba(201,162,39,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FiFileText size={14} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>
            {list.length === 1 ? '✅ Relevant Template Found!' : `✅ ${list.length} Relevant Templates Found!`}
          </div>
          <div style={{ fontSize: 11.5, color: '#888' }}>Click to open and fill your application</div>
        </div>
      </div>
      {shown.map(t => <TemplateCard key={t.id} t={t} onGo={onGo} />)}
      {list.length > 3 && (
        <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', marginTop: 4, padding: '7px', background: 'none', border: `1px dashed ${C.gold}`, borderRadius: 8, cursor: 'pointer', color: C.primary, fontSize: 12.5, fontWeight: 600 }}>
          {expanded ? '▲ Show Less' : `▼ Show ${list.length - 3} More`}
        </button>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Chatbot() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('incrime_chats')) || []; } catch { return []; }
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggTids, setSuggTids] = useState([]);
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);
  const textareaRef = useRef(null);

  const bg       = dark ? '#0f1115' : C.light;
  const cardBg   = dark ? '#1a1d24' : C.white;
  const txtColor = dark ? '#e5e7eb' : '#1a1a1a';
  const border   = dark ? '#2d3142' : '#e4e8ef';

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  const persist = (s) => { setSessions(s); localStorage.setItem('incrime_chats', JSON.stringify(s)); };

  const startNew = () => {
    setCurrentSessionId(null); setMessages([]); setInput('');
    setIsActive(false); setSuggestions([]); setSuggTids([]); setSidebarOpen(false);
  };

  const loadSession = (id) => {
    const s = sessions.find(x => x.id === id);
    if (!s) return;
    setCurrentSessionId(id); setMessages(s.messages || []);
    setSuggestions(s.suggestions || []); setSuggTids(s.suggTids || []);
    setIsActive(true); setSidebarOpen(false);
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    persist(sessions.filter(s => s.id !== id));
    if (currentSessionId === id) startNew();
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;

    setIsActive(true);
    const sessId = currentSessionId || Date.now();
    if (!currentSessionId) setCurrentSessionId(sessId);

    const userMsg = { role: 'user', text: msg, time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setInput('');
    setSuggestions([]);
    setSuggTids([]);
    setIsTyping(true);

    let updatedSessions = [...sessions];
    let sess = updatedSessions.find(x => x.id === sessId);
    if (!sess) {
      sess = { id: sessId, title: msg.slice(0, 38) + (msg.length > 38 ? '…' : ''), messages: [] };
      updatedSessions = [sess, ...updatedSessions];
    }
    sess.messages = [...(sess.messages || []), userMsg];
    persist(updatedSessions);

    const detectedTemplates = detectTemplates(msg);
    const localResult = getLocalAnswer(msg);

    let botText = localResult.answer;
    let botSuggs = localResult.followUp || [];
    let botTids = localResult.tids || [];

    const allTids = [...new Set([...botTids, ...detectedTemplates.map(t => t.id)])];

    try {
      const { data } = await axios.post('/api/chatbot/message', { message: msg });
      botText = data.response;
      botSuggs = data.suggestions && data.suggestions.length ? data.suggestions : localResult.followUp || [];
    } catch {
      // Use local fallback silently
    }

    const botMsg = { role: 'bot', text: botText, time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }), tids: allTids };
    const finalMsgs = [...nextMsgs, botMsg];
    setMessages(finalMsgs);
    setSuggestions(botSuggs);
    setSuggTids(allTids);
    setIsTyping(false);

    sess.messages = [...(sess.messages || []), botMsg];
    sess.suggestions = botSuggs;
    sess.suggTids = allTids;
    persist(updatedSessions.map(s => s.id === sessId ? sess : s));
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported in this browser'); return; }
    const r = new SR();
    r.lang = 'en-US';
    r.onstart = () => setIsListening(true);
    r.onresult = (e) => { setInput(e.results[0][0].transcript); r.stop(); };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.start();
  };

  const goTo = (route) => navigate(route);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: bg, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', color: txtColor }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #c0c8d8; border-radius: 4px; }
        .ci:focus { outline: none; }
        .tb:hover { background: ${C.primary} !important; color: #fff !important; }
        .sb:hover { background: ${C.primary} !important; color: #fff !important; border-color: ${C.primary} !important; }
        .send:hover:not(:disabled) { background: #1a4763 !important; transform: scale(1.05); }
        .si:hover { background: rgba(13,42,58,0.07) !important; }
        .eq:hover { border-color: ${C.primary} !important; background: ${dark ? '#1e2130' : '#f0f3f8'} !important; }
        @keyframes dot { 0%,80%,100%{transform:scale(0.55);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        @keyframes pop { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slide { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .ma { animation: pop 0.22s ease; }
        .ta { animation: slide 0.32s ease; }
      `}</style>

      <Navbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 998 }} />}

        {/* ── Sidebar ── */}
        <aside style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: 268, background: C.primary, color: '#fff', display: 'flex', flexDirection: 'column', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.28s cubic-bezier(.4,0,.2,1)', zIndex: 999, paddingTop: 64 }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={startNew} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: C.gold, color: C.primary, border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              <FiPlus size={15} /> New Chat
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {sessions.length === 0
              ? <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 32 }}><FiMessageSquare size={26} style={{ display: 'block', margin: '0 auto 8px' }} />No history yet</div>
              : sessions.map(s => (
                <div key={s.id} className="si" onClick={() => loadSession(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: currentSessionId === s.id ? 'rgba(255,255,255,0.13)' : 'transparent', transition: 'background 0.15s' }}>
                  <FiMessageSquare size={13} style={{ flexShrink: 0, opacity: 0.65 }} />
                  <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.88 }}>{s.title}</span>
                  <button onClick={(e) => deleteSession(s.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 2 }}><FiTrash2 size={12} /></button>
                </div>
              ))
            }
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setDark(!dark)} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: 8, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}>
              {dark ? <FiSun size={14} /> : <FiMoon size={14} />} {dark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Topbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: cardBg, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, padding: 4, display: 'flex' }}><FiMenu size={20} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, background: C.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdBalance size={17} color={C.gold} /></div>
              <span style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>InCrime Legal AI</span>
              <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>● Online</span>
            </div>
            {isActive && (
              <button onClick={startNew} style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${border}`, color: C.primary, padding: '5px 13px', borderRadius: 6, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiPlus size={13} /> New Chat
              </button>
            )}
          </div>

          {/* ── Welcome Screen ── */}
          {!isActive && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px' }}>
              <div style={{ maxWidth: 680, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <div style={{ width: 68, height: 68, background: C.primary, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(13,42,58,0.25)' }}>
                    <MdBalance size={34} color={C.gold} />
                  </div>
                  <h2 style={{ fontSize: 23, fontWeight: 800, color: C.primary, margin: '0 0 8px' }}>InCrime Legal AI</h2>
                  <p style={{ color: '#667085', fontSize: 14.5, lineHeight: 1.65, maxWidth: 460, margin: '0 auto' }}>
                    Ask me anything about Pakistani law — I'll guide you and <strong>show the right legal template automatically.</strong>
                  </p>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Quick Topics</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 9 }}>
                    {QUICK_TOPICS.map(({ icon: Icon, label, q }) => (
                      <button key={label} className="tb" onClick={() => sendMessage(q)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', background: cardBg, border: `1.5px solid ${border}`, borderRadius: 10, cursor: 'pointer', color: txtColor, fontSize: 13, fontWeight: 500, transition: 'all 0.18s', textAlign: 'left' }}>
                        <Icon size={15} color={C.gold} style={{ flexShrink: 0 }} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Example Questions</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {EXAMPLE_QS.map(q => (
                      <button key={q} className="eq" onClick={() => sendMessage(q)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 15px', background: cardBg, border: `1px solid ${border}`, borderRadius: 10, cursor: 'pointer', color: txtColor, fontSize: 13.5, textAlign: 'left', transition: 'all 0.18s' }}>
                        <span>{q}</span>
                        <FiChevronRight size={14} color="#bbb" style={{ flexShrink: 0, marginLeft: 8 }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Chat Messages ── */}
          {isActive && (
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', background: dark ? '#13161d' : '#f4f6f9' }}>
              <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {messages.map((msg, i) => (
                  <div key={i} className="ma" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.role === 'bot' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                        <div style={{ width: 26, height: 26, background: C.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdBalance size={13} color={C.gold} /></div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>InCrime AI</span>
                      </div>
                    )}

                    <div style={{ maxWidth: '84%', padding: '11px 15px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px', background: msg.role === 'user' ? C.primary : cardBg, color: msg.role === 'user' ? '#fff' : txtColor, boxShadow: '0 1px 5px rgba(0,0,0,0.07)', border: msg.role === 'bot' ? `1px solid ${border}` : 'none' }}>
                      {msg.role === 'bot'
                        ? formatMessage(msg.text, dark)
                        : <span style={{ fontSize: 14, lineHeight: 1.65 }}>{msg.text}</span>
                      }
                    </div>

                    {msg.role === 'bot' && msg.tids && msg.tids.length > 0 && (
                      <div className="ta" style={{ maxWidth: '84%', width: '100%', marginTop: 6 }}>
                        <TemplateBox tids={msg.tids} onGo={goTo} />
                      </div>
                    )}

                    {msg.time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, color: '#b0b8c8', fontSize: 11 }}>
                        <FiClock size={10} /> {msg.time}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="ma" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ width: 26, height: 26, background: C.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MdBalance size={13} color={C.gold} /></div>
                    <div style={{ background: cardBg, border: `1px solid ${border}`, padding: '12px 16px', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                      {[0, 1, 2].map(d => <span key={d} style={{ width: 7, height: 7, background: C.gold, borderRadius: '50%', display: 'inline-block', animation: `dot 1.2s ${d * 0.2}s infinite` }} />)}
                    </div>
                  </div>
                )}

                {(suggestions.length > 0 || suggTids.length > 0) && !isTyping && (
                  <div className="ma" style={{ paddingLeft: 34 }}>
                    {suggestions.length > 0 && (
                      <>
                        <p style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 7, fontWeight: 600 }}>Related questions:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: suggTids.length ? 12 : 0 }}>
                          {suggestions.map((s, i) => (
                            <button key={i} className="sb" onClick={() => sendMessage(s)} style={{ background: cardBg, border: `1.5px solid ${border}`, color: C.primary, padding: '6px 13px', borderRadius: 20, cursor: 'pointer', fontSize: 12.5, transition: 'all 0.18s', fontWeight: 500 }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {suggTids.length > 0 && (
                      <>
                        <p style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 7, fontWeight: 600 }}>Quick template access:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                          {byId(suggTids).map(t => (
                            <button key={t.id} onClick={() => goTo(t.route)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1.5px solid ${C.gold}55`, color: C.primary, padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12.5, fontWeight: 500, transition: 'all 0.18s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.borderColor = C.gold; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = `${C.gold}55`; }}
                            >
                              <span>{t.emoji}</span> {t.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Input Box ── */}
          <div style={{ padding: '11px 16px 13px', background: cardBg, borderTop: `1px solid ${border}`, flexShrink: 0 }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: dark ? '#1e2130' : '#f1f4f9', border: `2px solid ${C.primary}30`, borderRadius: 14, padding: '8px 10px' }}>
                <textarea
                  ref={textareaRef}
                  className="ci"
                  value={input}
                  onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                  onKeyDown={handleKey}
                  rows={1}
                  placeholder="Ask a legal question in English or Urdu..."
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, padding: '4px 6px', resize: 'none', maxHeight: 120, color: txtColor, fontFamily: 'inherit', lineHeight: 1.6 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingBottom: 2, flexShrink: 0 }}>
                  <button onClick={handleVoice} style={{ background: isListening ? '#fee2e2' : 'none', border: 'none', cursor: 'pointer', color: isListening ? '#dc2626' : '#9ca3af', padding: 6, borderRadius: 8, display: 'flex', transition: 'all 0.2s' }}>
                    {isListening ? <FiMicOff size={16} /> : <FiMic size={16} />}
                  </button>
                  <button className="send" onClick={() => sendMessage()} disabled={!input.trim() || isTyping} style={{ background: input.trim() && !isTyping ? C.primary : '#d1d5db', color: '#fff', width: 36, height: 36, borderRadius: 10, border: 'none', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <FiSend size={15} />
                  </button>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#b0b8c8', margin: '6px 0 0' }}>
                InCrime provides general legal information only. Consult a licensed advocate for professional legal advice.
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
