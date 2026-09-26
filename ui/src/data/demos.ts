export interface DemoTender {
  id: string;
  title: string;
  department: string;
  domain: string;
  expectedGate: string;
  summary: string;
  text: string;
}

export const DEMO_TENDERS: DemoTender[] = [
  {
    id: 'DEMO-NHAI-BRIDGE-01',
    title: 'NHAI 4-Lane River Crossing Bridge Deck Works',
    department: 'National Highways Authority of India (NHAI)',
    domain: 'Highway & Bridge Infrastructure',
    expectedGate: 'STATUTORY_NON_COMPLIANT',
    summary: 'Cites IS 456 for highway bridge (excluded by Clause 1.1) and mandates proprietary cement brands (violates GFR 144(i)).',
    text: `Clause 4.2: Design and construction of 4-lane prestressed concrete road bridge girders and deck slabs across river crossing conforming strictly to IS 456:2000.
The contractor shall procure structural cement exclusively from UltraTech or ACC cement plants.`,
  },
  {
    id: 'DEMO-SEISMIC-REBAR-02',
    title: 'CPWD Multi-Storey Administrative Complex Reinforcement',
    department: 'Central Public Works Department (CPWD)',
    domain: 'High-Rise RCC & Seismic Detailing',
    expectedGate: 'TECHNICAL_DEFECT',
    summary: 'Specifies 12% elongation for Fe 500D (superseded by Gazetted Amendment No. 3 requiring 14.5% minimum).',
    text: `Clause 6.1: Supply of Fe 500D high strength deformed steel bars conforming to IS 1786:2008 with minimum elongation of 12% and yield stress not less than 450 MPa for seismic ductile detailing.`,
  },
  {
    id: 'DEMO-TRANSFORMER-QCO-03',
    title: 'State Electricity Board Rural Distribution Electrification',
    department: 'State Power Distribution Corporation (DISCOM)',
    domain: 'Electrical Distribution Grid',
    expectedGate: 'STATUTORY_NON_COMPLIANT',
    summary: 'Specifies 100 kVA distribution transformer omitting mandatory Quality Control Order (QCO) BIS Standard Mark certification.',
    text: `Clause 2.4: Supply and commissioning of 100 kVA 11/0.433 kV three phase outdoor type distribution transformers with total losses at 50% load not exceeding 95 W.`,
  },
];
