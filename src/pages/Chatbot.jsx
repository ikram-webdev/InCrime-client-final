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

// ─── LOCAL KB (instant fallback) ────────────────────────────────────────────
const LOCAL_KB = {
  bail: {
    answer: `Bail in Pakistan — ضمانت\n\nTypes of Bail:\n1. Pre-Arrest Bail (Section 498 CrPC): Filed BEFORE arrest to prevent arrest\n2. Post-Arrest Bail (Section 497 CrPC): Filed AFTER arrest to get released\n3. Interim Bail: Temporary bail during hearing\n4. Statutory Bail: Automatic if challan not filed on time\n\nWhere to File:\n- Bailable offences: Magistrate Court — bail is your RIGHT\n- Non-bailable offences: Sessions Court — judge decides\n- If refused: High Court\n\nWhat You Need:\n- FIR copy and CNIC\n- Surety (guarantor) with property documents\n- Lawyer to represent you\n\nCost: Court bail is free. Lawyer: Rs 5,000 to Rs 50,000\nFree Legal Aid: 0800-09008 (Punjab)`,
    tids: ['bail-pre','bail-post'],
    followUp: ['How to file pre-arrest bail?','What is surety in bail?','What if bail is rejected?','What is statutory bail?'],
  },
  bail_pre: {
    answer: `Pre-Arrest Bail (Anticipatory Bail) — ضمانت قبل از گرفتاری\n\nFiled BEFORE you are arrested to prevent arrest.\nGoverning Law: Section 498 CrPC\n\nWhere to File:\n- Sessions Court (first try)\n- High Court (if Sessions refuses)\n\nWhat You Need:\n- FIR number, date, police station\n- Sections (charges) you are facing\n- Surety with property documents\n- Strong grounds: false implication, no criminal record, breadwinner of family\n\nProcess:\n1. Hire lawyer immediately\n2. File petition in Sessions Court\n3. Interim bail usually granted same day\n4. Final hearing within 3 to 7 days\n5. If Sessions Court refuses — High Court within 24 hours\n\nWarning: Bail can be cancelled if you miss court dates or tamper with evidence.`,
    tids: ['bail-pre'],
    followUp: ['What is surety in bail?','What if bail is rejected?','What is post-arrest bail?','How to file post-arrest bail?'],
  },
  bail_post: {
    answer: `Post-Arrest Bail — ضمانت بعد از گرفتاری\n\nFiled AFTER arrest to get released from custody.\nGoverning Law: Section 497 CrPC\n\nTwo Categories:\n1. Bailable Offences: Bail is your LEGAL RIGHT — Magistrate must give it\n2. Non-Bailable Offences: Sessions Judge decides based on arguments\n\nRequired Documents:\n- FIR copy (get free from police station)\n- Arrest memo, CNIC of accused and surety\n- Property documents of surety\n- Medical certificate if health issue\n\nTimeline:\n- Must appear before Magistrate within 24 hours of arrest\n- Bail hearing: 2 to 7 days\n\nStatutory Bail: If police do not file challan within 14 days for bailable offence — you have automatic right to bail.`,
    tids: ['bail-post'],
    followUp: ['What is surety in bail?','What is statutory bail?','What if bail is rejected?','What is pre-arrest bail?'],
  },
  fir: {
    answer: `FIR — First Information Report — ایف آئی آر\n\nFIR officially starts a criminal case. It is FREE to register.\nLaw: Section 154 CrPC — police MUST register FIR.\n\nHow to File:\n1. Go to nearest police station\n2. Meet the SHO (Station House Officer)\n3. Tell complete incident with dates, times, location\n4. Give names or description of accused\n5. Police must give you a FREE certified copy\n\nIf Police REFUSE:\n1. Complain to DSP (senior officer)\n2. File application before Judicial Magistrate (Section 22-A)\n3. Complain to SSP by registered post\n4. Use Pakistan Citizen Portal: www.citizenportal.gov.pk\n5. File writ petition in High Court\n\nEmergency: Call 15`,
    tids: ['theft'],
    followUp: ['What if police refuse FIR?','Can FIR be cancelled?','How to get FIR copy?','What is challan?'],
  },
  fir_refuse: {
    answer: `Police Refusing FIR — What To Do\n\nSection 154 CrPC: Police are LEGALLY OBLIGATED to register FIR.\n\nSteps in Order:\n\nStep 1 — Go to Senior Officer:\n- Complain to DSP (Deputy Superintendent of Police)\n- DSP can ORDER the SHO to register FIR immediately\n\nStep 2 — Judicial Magistrate:\n- File application under Section 22-A CrPC\n- Magistrate will direct police to register FIR\n- Most effective and commonly used method\n\nStep 3 — Written Complaint:\n- Send by registered post to SSP and DIG\n- Keep postal receipt as proof\n\nStep 4 — Government Portals:\n- Pakistan Citizen Portal: www.citizenportal.gov.pk\n- SMS to 1201 (PM Portal)\n\nStep 5 — High Court:\n- File writ petition under Article 199\n- Court orders police within 24 hours`,
    tids: ['theft'],
    followUp: ['How to file Magistrate application?','What is writ petition?','How to complain against SHO?','What is Pakistan Citizen Portal?'],
  },
  khula: {
    answer: `Khula Divorce — خلع\n\nKhula is the wife's right to end the marriage through Family Court.\n\nGrounds for Khula:\n- Cruelty or domestic violence\n- Husband not providing maintenance\n- Desertion (husband missing or absent)\n- Addiction to drugs or alcohol\n- Husband in prison\n- Incompatibility\n\nProcess:\n1. File Khula petition in Family Court\n2. Usually wife returns the Mehr amount\n3. Court attempts reconciliation first\n4. If no reconciliation — Khula decree issued\n5. Timeline: 3 to 6 months typically\n\nHusband CANNOT block Khula permanently — court will grant it.\nAfter Khula:\n- Wife observes Iddat for 3 months\n- Children's custody decided separately`,
    tids: ['tansikh'],
    followUp: ['How long does Khula take?','Can husband refuse Khula?','What about Mehr after Khula?','What about children after Khula?'],
  },
  custody: {
    answer: `Child Custody — حضانت\n\nDefault Rules Under Islamic Law:\n- Mother gets sons until age 7\n- Mother gets daughters until puberty (age 12-13)\n- Father gets custody after these ages\n\nBUT: Court ALWAYS decides based on child's best interest — this overrides all rules.\n\nMother Loses Custody If:\n- She remarries outside child's close family\n- Declared unfit (addiction, abuse)\n- Takes child abroad without court permission\n\nFather Must ALWAYS Pay (regardless of custody):\n- Monthly food, clothing, education expenses\n- All medical expenses\n\nHow to File:\n1. Petition in Family Court\n2. Attach child's B-Form and parents' CNICs\n3. Show financial ability and living environment\n4. Court may interview child if old enough`,
    tids: ['custody'],
    followUp: ['Can mother take child abroad without father?','What if father does not pay maintenance?','What is joint custody?','How to change custody order?'],
  },
  harassment: {
    answer: `Harassment — Legal Protection — ہراسانی\n\nKey Laws:\n- Section 509 PPC: Insulting modesty — 3 years + fine\n- Section 506 PPC: Criminal threatening — 2 to 7 years\n- Workplace Harassment Act 2010: Complaint to Ombudsman\n- PECA 2016 Section 24: Cyber harassment — 3 years + Rs 1 million\n\nHow to Report:\n1. File FIR at nearest police station\n2. For workplace: Federal or Provincial Ombudsman\n3. For online: FIA Cybercrime 0800-02345 (FREE, 24/7)\n4. Apply for Court Protection Order\n\nEvidence to Collect:\n- Screenshots with timestamps\n- Call records and logs\n- Witness statements\n- Medical reports if physically harmed\n\nCourt Protection Order:\n- Judge orders harasser to stay away from you\n- Violating order = immediate arrest\n- Can be granted urgently within days`,
    tids: ['harassment'],
    followUp: ['How to get court protection order?','What is cyber harassment law?','How to report workplace harassment?','What evidence is needed?'],
  },
  rights: {
    answer: `Your Legal Rights If Arrested — قانونی حقوق\n\nConstitutional Rights (Articles 9, 10, 10-A, 14):\n- Right to be told reason for arrest IMMEDIATELY\n- Right to remain SILENT\n- Right to contact family within 24 hours\n- Right to a lawyer immediately\n- Must be produced before Magistrate within 24 HOURS\n- Right to apply for bail\n- Right to FREE lawyer if you cannot afford one\n- TORTURE IS PROHIBITED — Anti-Torture Act 2022\n\nDuring Police Interrogation:\n- Lawyer can be present\n- You cannot be forced to confess\n- Confession to police is NOT admissible in court\n\nDuring Trial:\n- Right to know all charges\n- Right to cross-examine witnesses\n- Right to present your own defense\n- Right to appeal any conviction\n\nEmergency: 15 | Free Legal Aid: 0800-09008`,
    tids: ['bail-pre','bail-post'],
    followUp: ['What to do if police torture me?','What is right to fair trial?','How to complain against police?','What is free legal aid?'],
  },
  cyber: {
    answer: `Cyber Crime — PECA 2016\n\nOffences and Punishments:\n- Online Harassment (Section 24): 3 years + Rs 1 million fine\n- Sharing Intimate Images (Section 21): 5 years + Rs 5 million — very strict\n- Fake Account/Impersonation (Section 16): 3 years + Rs 500,000\n- Hacking (Section 3): 3 years + Rs 500,000\n- Online Fraud (Section 14): 3 years + Rs 500,000\n- Hate Speech Online (Section 11): 7 years + fine\n\nHow to Report:\n- FIA Cybercrime Hotline: 0800-02345 (FREE, 24/7)\n- Online: www.fia.gov.pk\n- Email: ccrc@fia.gov.pk\n\nFor Blackmail — DO NOT PAY:\n- Report to FIA immediately\n- FIA can trace and arrest blackmailers\n- Paying makes the situation worse\n\nEvidence to Save NOW:\n- Screenshot everything with date visible\n- Save all URLs and profile links\n- Change your passwords immediately`,
    tids: ['harassment'],
    followUp: ['How to report fake Facebook account?','What if someone shares my private photos?','Is online blackmail a crime?','How to get content removed online?'],
  },
  darulaman: {
    answer: `Dar-ul-Aman — Women Shelter Home — دارالامان\n\nGovernment shelter homes protecting women from:\n- Domestic violence\n- Forced marriage\n- Threat to life from family\n- Any unsafe home environment\n\n3 Application Types:\n\n1. Sending to Dar-ul-Aman:\n- Woman needs immediate protection\n- Emergency entry — NO court order needed\n- Woman's own consent required\n\n2. Meeting at Dar-ul-Aman:\n- Family wants to visit woman in shelter\n- Court permission required\n- Woman's consent must be verified by court\n\n3. Release from Dar-ul-Aman:\n- Court must verify woman is safe before releasing\n- Woman's own statement in court is most important\n\nEmergency:\n- Call 1043 (Punjab Women Helpline)\n- Any woman can walk in directly — FREE of charge`,
    tids: ['azad-darul','meeting-darul','sending-darul'],
    followUp: ['How to get woman released from Dar-ul-Aman?','Can husband visit wife there?','Is Dar-ul-Aman free?','What documents are needed?'],
  },
  domestic_violence: {
    answer: `Domestic Violence — فوری قانونی مدد\n\nIF IN IMMEDIATE DANGER — Call 15 RIGHT NOW.\n\nLaws That Protect You:\n- Punjab Protection of Women Against Violence Act 2016\n- Sindh Domestic Violence Act 2013\n- KPK Domestic Violence Act 2021\n- PPC Sections 337, 341, 352 (Assault and Hurt)\n\nImmediate Steps:\n1. Call 15 if in immediate danger\n2. Go to trusted family member or neighbor\n3. Go to Dar-ul-Aman — no paperwork needed for emergency\n4. Get medical treatment — KEEP the report as evidence\n5. Photograph injuries with timestamps\n\nCourt Protection Order:\n- Prohibits abuser from approaching or contacting you\n- Granted within 24 hours in emergencies\n- Violating order = immediate arrest of abuser\n\nEmergency Helplines:\n- Police: 15\n- Women Helpline Punjab: 1043\n- Edhi Foundation: 115\n- Umang Helpline: 0317-4288665`,
    tids: ['harassment','sending-darul'],
    followUp: ['How to get protection order?','How to go to Dar-ul-Aman?','Can I take children when I leave?','What evidence do I need?'],
  },
  police_refuse: {
    answer: `Police Refusing FIR — What To Do\n\nSection 154 CrPC: Police are LEGALLY OBLIGATED to register FIR.\n\nSteps in Order:\n\nStep 1 — Go to Senior Officer:\n- Complain to DSP (Deputy Superintendent of Police)\n- DSP can ORDER the SHO to register FIR immediately\n\nStep 2 — Judicial Magistrate:\n- File application under Section 22-A CrPC\n- Magistrate will direct police to register FIR\n- Most effective and commonly used method\n\nStep 3 — Written Complaint:\n- Send by registered post to SSP and DIG\n\nStep 4 — Government Portals:\n- Pakistan Citizen Portal: www.citizenportal.gov.pk\n- SMS to 1201 (PM Portal)\n\nStep 5 — High Court:\n- File writ petition under Article 199\n- Court orders police within 24 hours\n\nAlways note officer name, badge number, date, and time of refusal.`,
    tids: ['theft'],
    followUp: ['How to file Magistrate application?','What is writ petition?','How to complain against SHO?','What is Pakistan Citizen Portal?'],
  },
  police_complaint: {
    answer: `Complaint Against Police — پولیس کے خلاف شکایت\n\nSteps in Order:\n\n1. Internal Hierarchy:\n- Against constable: Complain to SHO\n- Against SHO: Complain to DSP\n- Against DSP: Complain to SSP\n- Against SSP: Complain to DIG or IGP\n\n2. Government Portals:\n- Pakistan Citizen Portal: www.citizenportal.gov.pk\n- SMS to 1201 (PM Delivery Unit)\n\n3. Judicial Action:\n- Complaint before Judicial Magistrate\n- Writ Petition in High Court (Article 199)\n\n4. If Police Tortured You:\n- Demand medical exam and keep report\n- Anti-Torture Act 2022: Torture is a specific crime\n- File Constitutional Petition in High Court\n\nImportant Facts:\n- Demanding bribe = crime under Section 161 PPC\n- Filming police on duty in public is LEGAL`,
    tids: [],
    followUp: ['How to file High Court petition?','What is Anti-Torture Act?','Can a police officer be arrested?','What is writ petition?'],
  },
  maintenance: {
    answer: `Maintenance (Nafaqa) — نفقہ\n\nWho is Entitled:\n- Wife: During marriage AND 3 months after divorce (Iddat)\n- Children: Son until earning independently, daughter until marriage\n- Parents: If elderly and unable to support themselves\n\nHow to Claim:\n1. Send written demand to husband — keep copy\n2. File maintenance suit in Family Court\n3. Attach Nikah Nama and show husband's income proof\n4. Court grants interim maintenance within 4 to 8 weeks\n\nIf Husband Refuses to Pay After Order:\n- Court can deduct from his salary directly\n- Court can freeze his bank accounts\n- Court can seize and sell his property\n- Willful non-payment = imprisonment for contempt\n\nChild Maintenance:\n- Father pays regardless of who has custody\n- Covers food, school fees, clothing, medical`,
    tids: ['consent'],
    followUp: ['How much maintenance am I entitled to?','Can wife claim without divorce?','How to enforce maintenance order?','What if husband hides income?'],
  },
  property: {
    answer: `Property and Land Law — جائیداد\n\nIf Property Is Illegally Occupied:\n1. Get Fard (ownership record) from Patwari immediately\n2. File civil suit for possession in Civil Court\n3. Apply for Injunction (Stay Order) to stop any sale\n4. File FIR if criminal force or fraud was used\n\nInheritance Shares Under Islamic Law:\n- Wife: 1/8 if children exist, 1/4 if no children\n- Daughter: Half of son's share\n- Mother: 1/6 or 1/3 depending on situation\n- Son: Double of daughter's share\n\nCheck Land Records Online:\n- Punjab: www.lrmis.gop.pk\n- Sindh: www.sindhlands.gov.pk\n- KPK: www.kplands.gov.pk\n\nRegistry Fraud:\n- File FIR under Section 420 and 467 PPC\n- File civil suit to cancel fraudulent registry`,
    tids: ['consent'],
    followUp: ['How to claim inheritance?','How to stop illegal property sale?','What is Fard document?','How to transfer property after death?'],
  },
  general: {
    answer: `InCrime Legal AI — میں آپ کی مدد کر سکتا ہوں\n\nCriminal Law:\n- Bail applications (pre-arrest and post-arrest)\n- FIR filing and what to do if police refuse\n- Theft, Robbery, Dacoity\n- Harassment and protection orders\n- Cyber Crime (PECA 2016)\n- Challan and court procedures\n\nFamily Law:\n- Nikah and marriage registration\n- Divorce — Talaq and Khula\n- Child custody and guardianship\n- Maintenance (Nafaqa)\n- Dar-ul-Aman applications\n- Second marriage law\n\nRights and General:\n- Constitutional fundamental rights\n- Rights if arrested or detained\n- Police complaint procedures\n- Free legal aid contacts\n- Property and inheritance law\n\nType your specific question in English or Urdu.`,
    tids: ['bail-pre','bail-post','theft','harassment','challan','consent','attendance','nikah','custody','tansikh','second-marriage','azad-darul','meeting-darul','sending-darul'],
    followUp: ['How to file a bail application?','How to file an FIR?','How to get Khula divorce?','What are my rights if arrested?'],
  },
};

function getLocalAnswer(msg) {
  const m = msg.toLowerCase();
  if (m.includes('refuse') && (m.includes('fir') || m.includes('police'))) return LOCAL_KB.fir_refuse;
  if (m.includes('police') && (m.includes('complaint') || m.includes('corrupt') || m.includes('torture') || m.includes('galat'))) return LOCAL_KB.police_complaint;
  if ((m.includes('pre') || m.includes('anticipatory') || m.includes('se pehle')) && m.includes('bail')) return LOCAL_KB.bail_pre;
  if ((m.includes('post') || m.includes('after') || m.includes('ke baad')) && m.includes('bail')) return LOCAL_KB.bail_post;
  if (m.includes('bail')) return LOCAL_KB.bail;
  if (m.includes('fir') || m.includes('first information') || m.includes('muqadma')) return LOCAL_KB.fir;
  if (m.includes('theft') || m.includes('chori') || m.includes('stolen') || m.includes('robbery') || m.includes('snatch')) return { ...LOCAL_KB.fir, tids: ['theft'] };
  if (m.includes('challan') || m.includes('charge sheet')) return { answer: LOCAL_KB.general.answer, tids: ['challan'], followUp: ['What is challan?','Difference FIR and challan?','How to apply bail after challan?'] };
  if (m.includes('attendance') || m.includes('peshi') || m.includes('excused') || m.includes('absent') || m.includes('warrant')) return { answer: LOCAL_KB.general.answer, tids: ['attendance'], followUp: ['What is NBW?','How to cancel warrant?','What if I miss court?'] };
  if (m.includes('consent') || m.includes('compromise') || m.includes('sulah') || m.includes('settle')) return { answer: LOCAL_KB.general.answer, tids: ['consent'], followUp: ['What crimes can be settled?','How to withdraw FIR?','What is Diyat?'] };
  if (m.includes('khula') || m.includes('divorce') || m.includes('talaq')) return LOCAL_KB.khula;
  if (m.includes('nikah') || (m.includes('marriage') && !m.includes('second')) || m.includes('shadi')) return { answer: LOCAL_KB.general.answer, tids: ['nikah'], followUp: ['What is Mehr?','How to register Nikah?','What if Nikah Nama is lost?'] };
  if (m.includes('second marriage') || m.includes('dusri shadi') || m.includes('polygamy')) return { answer: LOCAL_KB.general.answer, tids: ['second-marriage'], followUp: ['Can first wife stop second marriage?','Is second marriage without permission illegal?'] };
  if (m.includes('custody') || m.includes('hazanat') || m.includes('bachay')) return LOCAL_KB.custody;
  if (m.includes('tansikh') || m.includes('annulment')) return { answer: LOCAL_KB.general.answer, tids: ['tansikh'], followUp: ['What are grounds for annulment?','How long does it take?'] };
  if (m.includes('domestic violence') || m.includes('marta') || m.includes('maar peet')) return LOCAL_KB.domestic_violence;
  if (m.includes('darul') || m.includes('dar ul') || m.includes('shelter')) return LOCAL_KB.darulaman;
  if (m.includes('harassment') || m.includes('blackmail') || m.includes('threat') || m.includes('tang')) return LOCAL_KB.harassment;
  if (m.includes('cyber') || m.includes('online') || m.includes('facebook') || m.includes('peca') || m.includes('hacking')) return LOCAL_KB.cyber;
  if (m.includes('rights') || m.includes('arrested') || m.includes('griftari') || m.includes('haqooq')) return LOCAL_KB.rights;
  if (m.includes('maintenance') || m.includes('nafaqa') || m.includes('kharcha') || m.includes('guzara')) return LOCAL_KB.maintenance;
  if (m.includes('property') || m.includes('zameen') || m.includes('inheritance') || m.includes('jaidad') || m.includes('qabza')) return LOCAL_KB.property;
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

// ─── TEMPLATE CARD (inside bot message) ─────────────────────────────────────
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

// ─── TEMPLATE BOX (shown below bot answer) ──────────────────────────────────
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

    // Detect templates from message
    const detectedTemplates = detectTemplates(msg);
    const localResult = getLocalAnswer(msg);

    let botText = localResult.answer;
    let botSuggs = localResult.followUp || [];
    let botTids = localResult.tids || [];

    // Merge detected templates with local KB templates
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

                    {/* Message bubble */}
                    <div style={{ maxWidth: '84%', padding: '11px 15px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px', background: msg.role === 'user' ? C.primary : cardBg, color: msg.role === 'user' ? '#fff' : txtColor, boxShadow: '0 1px 5px rgba(0,0,0,0.07)', border: msg.role === 'bot' ? `1px solid ${border}` : 'none' }}>
                      {msg.role === 'bot'
                        ? formatMessage(msg.text, dark)
                        : <span style={{ fontSize: 14, lineHeight: 1.65 }}>{msg.text}</span>
                      }
                    </div>

                    {/* ✅ TEMPLATE BOX — below every bot message that has templates */}
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

                {/* Typing dots */}
                {isTyping && (
                  <div className="ma" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ width: 26, height: 26, background: C.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MdBalance size={13} color={C.gold} /></div>
                    <div style={{ background: cardBg, border: `1px solid ${border}`, padding: '12px 16px', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                      {[0, 1, 2].map(d => <span key={d} style={{ width: 7, height: 7, background: C.gold, borderRadius: '50%', display: 'inline-block', animation: `dot 1.2s ${d * 0.2}s infinite` }} />)}
                    </div>
                  </div>
                )}

                {/* ✅ SUGGESTIONS + TEMPLATE PILLS */}
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

                    {/* ✅ QUICK TEMPLATE PILLS in suggestions */}
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
