export type SupportedLanguage = 'en' | 'hi';

export interface Translations {
  // App & Header
  appTitle: string;
  appSubtitle: string;
  nationalAuthority: string;
  auditNewDocument: string;
  exportDossierPdf: string;
  verifyDigestBtn: string;
  demoAccount: string;
  roleProcurementOfficer: string;
  roleGeMEvaluator: string;
  roleVigilanceAuditor: string;

  // View Navigation Ribbon
  viewOverview: string;
  viewTriage: string;
  viewStandards: string;
  viewDag: string;
  viewInvariants: string;
  viewCorrigenda: string;
  viewDossier: string;

  // Gate Status
  gateStatutoryNonCompliant: string;
  gateTechnicalDefect: string;
  gateVerifiedConformant: string;
  gatePendingReview: string;

  // Intake & Analysis
  intakeBadge: string;
  intakeHeadline: string;
  intakeSubhead: string;
  documentTitleLabel: string;
  specificationTextLabel: string;
  identifyStandardsBtn: string;
  evaluatingScopeHeader: string;
  evaluatingScopeSubhead: string;
  orExploreCurated: string;
  instantAnalysis: string;

  // Results & Metrics
  standardsIdentified: string;
  actionRequired: string;
  verifiedCurrent: string;
  factualDiscrepancy: string;
  groundedFormulation: string;
  copyCitation: string;
  citationCopied: string;
  auditedExcerpt: string;
  inspectStandard: string;
  recordDetermination: string;

  // Assistant & Verification
  assistantTitle: string;
  assistantSubtitle: string;
  askAssistantPlaceholder: string;
  verificationModalTitle: string;
  verificationModalSubhead: string;
  verifyInputPlaceholder: string;
  verifyBtn: string;

  // Persona Gateway & Modal Keys
  personaGateway: string;
  statutoryMandate: string;
  selectPersona: string;
  launchDemo: string;
  validSeal: string;
  invalidSeal: string;
  enterDigest: string;
  verifyDigest: string;
  procurementAssistant: string;
  verificationTitle: string;
  verificationSubtitle: string;
}

export type Language = SupportedLanguage;

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: 'MAANAKSETU',
    appSubtitle: 'National Standards Recommendation & Verification Engine · BIS Act 2016',
    nationalAuthority: 'Bureau of Indian Standards · Government of India',
    auditNewDocument: 'Audit New Document',
    exportDossierPdf: 'Export Dossier (PDF)',
    verifyDigestBtn: 'Verify Digest',
    demoAccount: 'Demo Account',
    roleProcurementOfficer: 'Senior Procurement Officer (Civil / Highways)',
    roleGeMEvaluator: 'GeM Technical Evaluator (Electrotechnical)',
    roleVigilanceAuditor: 'Chief Vigilance Officer / CAG Auditor',

    viewOverview: 'OVERVIEW & GATE',
    viewTriage: 'CLAUSE TRIAGE',
    viewStandards: 'STANDARDS CATALOG',
    viewDag: 'NORMATIVE DAG',
    viewInvariants: 'RULES & INVARIANTS',
    viewCorrigenda: 'CORRIGENDA & PROOF',
    viewDossier: 'AUDIT DOSSIER',

    gateStatutoryNonCompliant: 'STATUTORY NON-COMPLIANT',
    gateTechnicalDefect: 'TECHNICAL DEFECT',
    gateVerifiedConformant: 'VERIFIED CONFORMANT',
    gatePendingReview: 'PENDING ADJUDICATION',

    intakeBadge: 'Domain-Agnostic Standards Intelligence',
    intakeHeadline: 'Identify Applicable Standards & Mandatory Citations',
    intakeSubhead: 'Submit any technical specification, scope of work, or tender draft. MaanakSetu maps your technical assertions directly to current gazetted Indian Standards, flags obsolete citations, and provides grounded formulation text.',
    documentTitleLabel: 'DOCUMENT / TENDER TITLE (OPTIONAL)',
    specificationTextLabel: 'SPECIFICATION TEXT & SCOPE CLAUSES',
    identifyStandardsBtn: 'Run Autonomous Standards Audit',
    evaluatingScopeHeader: 'Evaluating Technical Scope & Standards Database...',
    evaluatingScopeSubhead: 'Matching assertions against BIS Gazette editions, QCO orders, and GFR 2017 rules.',
    orExploreCurated: 'Or Explore A Curated Benchmark Scope',
    instantAnalysis: 'One-click instant analysis',

    standardsIdentified: 'Standards Identified',
    actionRequired: 'Action Required',
    verifiedCurrent: 'Verified Current',
    factualDiscrepancy: 'THE FACTUAL DISCREPANCY',
    groundedFormulation: 'GROUNDED CITATION FORMULATION (TO INCLUDE IN TENDER)',
    copyCitation: 'Copy Citation',
    citationCopied: 'Copied to Clipboard!',
    auditedExcerpt: 'AUDITED TENDER EXCERPT',
    inspectStandard: 'Inspect Standard',
    recordDetermination: 'Record Determination',

    assistantTitle: 'Procurement Assistant',
    assistantSubtitle: 'GFR 2017 & BIS Regulatory Copilot',
    askAssistantPlaceholder: 'Ask about GFR 144(i), IS codes, or tender corrigenda...',
    verificationModalTitle: 'Cryptographic Conformance Seal Verification',
    verificationModalSubhead: 'Validate the tamper-evident SHA-256 fingerprint of any audited tender dossier against the statutory ledger.',
    verifyInputPlaceholder: 'Enter 64-character SHA-256 digest or Tender ID...',
    verifyBtn: 'Verify Certificate',

    personaGateway: 'Persona & Access Gateway',
    statutoryMandate: 'Public Procurement Standards Gate · BIS Act 2016 & GFR 2017',
    selectPersona: 'Select Institutional Demonstration Role',
    launchDemo: 'Launch Workstation Demo',
    validSeal: 'Cryptographic Audit Seal Verified Valid',
    invalidSeal: 'Audit Seal Invalid or Record Not Found',
    enterDigest: 'Enter SHA-256 Digest or Document ID',
    verifyDigest: 'Verify Digest',
    procurementAssistant: 'Procurement Assistant',
    verificationTitle: 'Cryptographic Conformance Seal Verification',
    verificationSubtitle: 'Public Audit Ledger Verification under IT Act 2000 Section 3',
  },
  hi: {
    appTitle: 'मानक सेतु',
    appSubtitle: 'राष्ट्रीय मानक अनुशंसा एवं सत्यापन प्रणाली · बीआईएस अधिनियम 2016',
    nationalAuthority: 'भारतीय मानक ब्यूरो · भारत सरकार',
    auditNewDocument: 'नवीन निविदा समीक्षा',
    exportDossierPdf: 'प्रमाणित रिपोर्ट (PDF)',
    verifyDigestBtn: 'सत्यापन खोज',
    demoAccount: 'डेमो खाता',
    roleProcurementOfficer: 'वरिष्ठ खरीद अधिकारी (सिविल / राजमार्ग)',
    roleGeMEvaluator: 'GeM तकनीकी मूल्यांकनकर्ता (विद्युत)',
    roleVigilanceAuditor: 'मुख्य सतर्कता अधिकारी / सीएजी लेखा परीक्षक',

    viewOverview: 'अवलोकन एवं स्वीकृति',
    viewTriage: 'खंड समीक्षा एवं वर्गीकरण',
    viewStandards: 'मानक संदर्भ सूची',
    viewDag: 'मानक निर्भरता आरेख (DAG)',
    viewInvariants: 'नियम एवं तकनीकी सीमाएं',
    viewCorrigenda: 'शुद्धिपत्र प्रारूप एवं साक्ष्य',
    viewDossier: 'सत्यापन दस्तावेज़',

    gateStatutoryNonCompliant: 'वैधानिक रूप से गैर-अनुपालन',
    gateTechnicalDefect: 'तकनीकी त्रुटि / संशोधन अपेक्षित',
    gateVerifiedConformant: 'सत्यापित एवं अनुरूप',
    gatePendingReview: 'निर्णय लंबित',

    intakeBadge: 'राष्ट्रीय मानक बौद्धिक प्रणाली',
    intakeHeadline: 'लागू भारतीय मानक एवं अनिवार्य उद्धरण पहचानें',
    intakeSubhead: 'किसी भी तकनीकी विनिर्देश, कार्य-क्षेत्र या निविदा मसौदे को प्रस्तुत करें। मानक सेतु आपकी तकनीकी शर्तों को सीधे अद्यतन भारतीय राजपत्रित मानकों से जोड़ता है और अप्रचलित संदर्भों को इंगित करता है।',
    documentTitleLabel: 'दस्तावेज़ / निविदा शीर्षक (वैकल्पिक)',
    specificationTextLabel: 'तकनीकी विनिर्देश एवं शर्तें',
    identifyStandardsBtn: 'स्वायत्त मानक ऑडिट प्रारंभ करें',
    evaluatingScopeHeader: 'तकनीकी कार्य-क्षेत्र एवं मानक डेटाबेस का मूल्यांकन जारी...',
    evaluatingScopeSubhead: 'बीआईएस राजपत्र संस्करणों, गुणवत्ता नियंत्रण आदेशों (QCO) और जीएफआर 2017 से मिलान।',
    orExploreCurated: 'या पूर्व-कॉन्फ़िगर मानक निविदा का चयन करें',
    instantAnalysis: 'एक-क्लिक त्वरित विश्लेषण',

    standardsIdentified: 'चिह्नित मानक',
    actionRequired: 'संशोधन आवश्यक',
    verifiedCurrent: 'सत्यापित एवं अद्यतन',
    factualDiscrepancy: 'तथ्यात्मक विसंगति विवरण',
    groundedFormulation: 'मानक राजपत्रित सुधार शब्दावली (निविदा में जोड़ने हेतु)',
    copyCitation: 'उद्धरण कॉपी करें',
    citationCopied: 'क्लिपबोर्ड पर कॉपी किया गया!',
    auditedExcerpt: 'समीक्षित निविदा अंश',
    inspectStandard: 'मानक विवरण देखें',
    recordDetermination: 'अधिकारिक निर्णय दर्ज करें',

    assistantTitle: 'खरीद सहायक (Procurement Assistant)',
    assistantSubtitle: 'जीएफआर 2017 एवं बीआईएस नियामक सलाहकार',
    askAssistantPlaceholder: 'जीएफआर 144(i), मानक कोड या शुद्धिपत्र के बारे में पूछें...',
    verificationModalTitle: 'क्रिप्टोग्राफिक ऑडिट सील सत्यापन',
    verificationModalSubhead: 'वैधानिक बहीखाते के विरुद्ध किसी भी समीक्षित निविदा के SHA-256 फिंगरप्रिंट की सत्यता जांचें।',
    verifyInputPlaceholder: '64-अक्षरों का SHA-256 डाइजेस्ट या निविदा आईडी दर्ज करें...',
    verifyBtn: 'सर्टिफिकेट सत्यापित करें',

    personaGateway: 'अभिगम एवं भूमिका चयन',
    statutoryMandate: 'सार्वजनिक खरीद मानक द्वार · बीआईएस अधिनियम 2016 व जीएफआर 2017',
    selectPersona: 'संस्थागत प्रदर्शन भूमिका का चयन करें',
    launchDemo: 'डेमो वर्कस्टेशन प्रारंभ करें',
    validSeal: 'क्रिप्टोग्राफिक ऑडिट सील सत्यापित एवं प्रामाणिक',
    invalidSeal: 'ऑडिट सील अमान्य अथवा रिकॉर्ड अप्राप्त',
    enterDigest: 'SHA-256 डाइजेस्ट अथवा निविदा आईडी दर्ज करें',
    verifyDigest: 'डाइजेस्ट जांचें',
    procurementAssistant: 'खरीद सहायक (Procurement Assistant)',
    verificationTitle: 'क्रिप्टोग्राफिक ऑडिट सील सत्यापन',
    verificationSubtitle: 'सूचना प्रौद्योगिकी अधिनियम 2000 धारा 3 के अंतर्गत सार्वजनिक ऑडिट बहीखाता सत्यापन',
  },
};

export function t(key: string, lang: Language): string {
  const dict = TRANSLATIONS[lang] as any;
  if (dict && dict[key]) {
    return dict[key];
  }
  const enDict = TRANSLATIONS['en'] as any;
  if (enDict && enDict[key]) {
    return enDict[key];
  }
  return key;
}

