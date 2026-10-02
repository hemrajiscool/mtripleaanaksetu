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
    summary: 'Multi-clause review: Obsolete standard IS 269:1989, proprietary brand lock-in UltraTech/ACC under GFR 144(i), setting bounds, and active IS 456 baseline.',
    text: `Clause 4.1 (Material Quality): Ordinary Portland Cement 43 Grade for high-stress rigid pavement slabs shall strictly conform to IS 269:1989.
Clause 4.2 (Vendor Sourcing): Cement shall be procured exclusively from UltraTech or ACC brand to ensure structural durability and uniform setting time.
Clause 4.3 (Structural Design Mix): All concrete design mixes and execution shall adhere strictly to active standard IS 456:2000 Code of Practice for Plain and Reinforced Concrete.
Clause 4.4 (Setting Time Bounds): Compressive strength at 28 days shall not be less than 43 MPa, and initial setting time shall not be less than 30 minutes in accordance with Table 2 of IS 269.
Clause 4.5 (Laboratory Testing Protocol): Representative samples shall be tested for fineness and soundness per IS 4031 at a NABL-accredited or BIS-approved testing laboratory.
Clause 4.6 (Mandatory Certification): All cement bags must bear the Bureau of Indian Standards (BIS) ISI Certification Mark with a valid CML number under DPIIT Cement Quality Control Order.`,
  },
  {
    id: 'DEMO-CPWD-REBAR-02',
    name: 'CPWD-REBAR',
    title: 'CPWD Multi-Storey Administrative Complex Reinforcement',
    department: 'Central Public Works Department (CPWD)',
    domain: 'High-Rise RCC & Seismic Detailing',
    expectedGate: 'TECHNICAL_DEFECT',
    summary: 'Multi-clause review: Fe 500D rebar with non-conforming 12% elongation (fails Amd 3 14.5%), contradictory yield stress, chemistry ceilings, and Ministry of Steel QCO.',
    text: `Clause 6.1 (Reinforcing Steel Grade): Supply of Fe 500D high strength deformed steel bars and wires for concrete reinforcement conforming to IS 1786:2008.
Clause 6.2 (Ductility Parameter Bounds): Minimum percentage elongation shall not be less than 12% and yield stress shall not be less than 450 MPa for seismic ductile detailing in Zone IV foundations.
Clause 6.3 (Chemical Composition Ceilings): Total sulphur and phosphorus content combined shall not exceed 0.075 percent max in accordance with IS 1786 Table 1.
Clause 6.4 (Quality Control Order Conformance): Steel shall be procured strictly from primary producers holding a valid BIS license under the Ministry of Steel Quality Control Order.
Clause 6.5 (Bending & Re-bending Test): Cold bend and re-bend testing shall be conducted on nominal sizes per IS 1786 Clause 9.4 without surface fractures.`,
  },
  {
    id: 'DEMO-DISCOM-TRANSFORMER-03',
    name: 'DISCOM-IPRM',
    title: 'State Electricity Board Rural Distribution Electrification',
    department: 'State Power Distribution Corporation (DISCOM)',
    domain: 'Electrical Distribution Grid',
    expectedGate: 'STATUTORY_NON_COMPLIANT',
    summary: 'Multi-clause review: 100 kVA distribution transformer omitting mandatory QCO BIS Standard Mark, Table 3 loss bounds, and citing superseded IS 335:1993 oil.',
    text: `Clause 2.1 (Equipment Scope): Supply, testing, and commissioning of 100 kVA 11/0.433 kV three-phase 50 Hz outdoor type distribution transformers conforming to IS 1180 (Part 1):2014.
Clause 2.2 (Energy Efficiency Loss Ceilings): Total maximum losses at 50% load shall not exceed 95 Watts and at 100% load shall not exceed 260 Watts for Energy Efficiency Level 2.
Clause 2.3 (Insulating Medium): Transformer core and windings shall be immersed in uninhibited mineral insulating oil conforming to IS 335:1993 with breakdown voltage not less than 60 kV.
Clause 2.4 (Regulatory QCO Certification): Equipment shall carry mandatory BIS Standard Mark (Scheme-I) certification in compliance with Central Electricity Authority and Ministry of Power Quality Control Orders.
Clause 2.5 (Enclosure Ingress Protection): Tank fabrication and terminal bushings shall comply with Ingress Protection IP55 according to IS 12063.`,
  },
  {
    id: 'DEMO-AIIMS-MEDGAS-04',
    name: 'AIIMS-MEDGAS',
    title: 'AIIMS Super-Specialty Medical Gas Pipeline Infrastructure',
    department: 'Ministry of Health and Family Welfare (MoHFW)',
    domain: 'Healthcare & Critical Engineering',
    expectedGate: 'VERIFIED_CONFORMANT',
    summary: 'Multi-clause review: Clean verified baseline specifying active medical gas pipeline and structural concrete standards strictly conforming to gazetted BIS codes.',
    text: `Clause 3.1 (Medical Gas Distribution Pipeline): Supply and installation of non-ferrous medical gas distribution pipelines strictly conforming to active standards and statutory safety norms.
Clause 3.2 (Structural Support & Slab Works): Plant room foundations and supporting concrete pedestals shall strictly conform to active concrete standard IS 456:2000.
Clause 3.3 (Cement Quality): Cement for structural work shall be Ordinary Portland Cement conforming to active standard IS 269:2015 with valid ISI mark.
Clause 3.4 (Emergency Pressure Relief Valves): Dual safety relief valves shall be tested and certified strictly conforming to BIS statutory safety guidelines.`,
  },
];
