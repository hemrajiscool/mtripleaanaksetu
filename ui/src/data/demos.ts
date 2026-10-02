export interface DemoTender {
  id: string;
  name: string;
  title: string;
  department: string;
  domain: string;
  expectedGate: string;
  summary: string;
  text: string;
}

export const DEMO_TENDERS: DemoTender[] = [
  {
    id: 'DEMO-NHAI-CEMENT-01',
    name: 'NHAI-CEMENT',
    title: 'NHAI Expressway Pavement & Reinforced Concrete Construction',
    department: 'Ministry of Road Transport and Highways (MoRTH)',
    domain: 'Civil / Highway Infrastructure',
    expectedGate: 'STATUTORY_NON_COMPLIANT',
    summary: 'Specifies superseded cement standard IS 269:1989 and proprietary brands UltraTech/ACC under GFR Rule 144(i).',
    text: `Clause 4.1 (Material Quality): Ordinary Portland Cement 43 Grade for high-stress rigid pavement slabs shall strictly conform to IS 269:1989.
Clause 4.2 (Vendor Sourcing): Cement shall be procured exclusively from UltraTech or ACC brand to ensure structural durability and uniform setting time.
Clause 4.3 (Structural Conformance): All concrete design mixes shall adhere to the overarching provisions of IS 456:2000 Code of Practice for Plain and Reinforced Concrete.`,
  },
  {
    id: 'DEMO-CPWD-REBAR-02',
    name: 'CPWD-REBAR',
    title: 'CPWD Multi-Storey Administrative Complex Reinforcement',
    department: 'Central Public Works Department (CPWD)',
    domain: 'High-Rise RCC & Seismic Detailing',
    expectedGate: 'TECHNICAL_DEFECT',
    summary: 'Specifies 12% elongation for Fe 500D (failing Amendment 3 requiring 14.5%) and contradictory yield stress 450 MPa.',
    text: `Clause 6.1 (Steel Reinforcement): Supply of Fe 500D high strength deformed steel bars conforming to IS 1786:2008 with minimum elongation of 12% and yield stress not less than 450 MPa for seismic ductile detailing in Zone IV foundations.`,
  },
  {
    id: 'DEMO-DISCOM-TRANSFORMER-03',
    name: 'DISCOM-IPRM',
    title: 'State Electricity Board Rural Distribution Electrification',
    department: 'State Power Distribution Corporation (DISCOM)',
    domain: 'Electrical Distribution Grid',
    expectedGate: 'STATUTORY_NON_COMPLIANT',
    summary: 'Specifies 100 kVA distribution transformer omitting mandatory Quality Control Order (QCO) BIS Standard Mark certification.',
    text: `Clause 2.4 (Transformer Equipment): Supply and commissioning of 100 kVA 11/0.433 kV three phase outdoor type distribution transformers with total losses at 50% load not exceeding 95 W.`,
  },
  {
    id: 'DEMO-AIIMS-MEDGAS-04',
    name: 'AIIMS-MEDGAS',
    title: 'AIIMS Super-Specialty Medical Gas Pipeline Infrastructure',
    department: 'Ministry of Health and Family Welfare (MoHFW)',
    domain: 'Healthcare & Critical Engineering',
    expectedGate: 'VERIFIED_CONFORMANT',
    summary: 'Clean baseline specifying active medical gas pipeline and structural concrete standards strictly conforming to BIS codes.',
    text: `Clause 3.1 (Medical Gas Distribution): Pipeline installation shall conform to IS 10322 standards with mandatory ISI certification.
Clause 3.2 (Structural Support): Ancillary equipment foundation slabs shall strictly conform to active concrete standard IS 456:2000 with cement conforming to active standard IS 269:2015.`,
  },
];
