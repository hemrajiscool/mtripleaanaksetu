"""12-Case Statutory and Technical Verification Evaluation Dataset (MaanakSetu MVP).

Gold standard benchmark matrix covering all 12 failure modes and invariants:
 1. Obsolete Standards (Withdrawn IS code with active superseding standard)
 2. Misapplied Scope (Highway bridge deck misapplying general building code IS 456)
 3. Missing Mandatory QCO (Procuring transformers without mandatory BIS certification)
 4. Superseded Normative Reference (Parent standard active, cited test code obsolete)
 5. Gazetted Amendment Non-Compliance (Fe 500D elongation failing Amendment 3 (2021))
 6. Contradictory Technical Parameter (Fe 500D yield stress specified at 450 MPa < 500 MPa)
 7. Unnumbered Technical Specification (LED streetlights without cited IS code)
 8. Proprietary Brand Names (Specifying UltraTech / ACC cement under GFR 144(i))
 9. Permissible Loss / Tolerance Violation (Transformer losses exceeding IS 1180 / BEE limit)
10. Environmental Condition Scope Conflict (IS 269 OPC specified in high sulfate soil)
11. Compressive Strength Grade Contradiction (43 grade cement specified with 35 MPa)
12. Valid Fully Compliant Tender (Clean baseline passing all checks)
"""

from __future__ import annotations

from typing import Any, Dict, List
from maanaksetu.domain.states import ViolationType


BENCHMARK_CASES: List[Dict[str, Any]] = [
    {
        "id": "CASE-01",
        "name": "Obsolete Standard Citation",
        "description": "Cites withdrawn cement specification IS 269:1989 superseded by IS 269:2015.",
        "text": "The contractor shall procure and supply 53 Grade Ordinary Portland Cement strictly conforming to IS 269:1989 for foundation concrete works.",
        "expected_violation_types": [ViolationType.ERR_OBSOLETE_STANDARD],
        "expected_standards": ["IS 269:1989"],
        "expected_replacement_standards": ["IS 269:2015"],
        "should_pass": False,
        "rationale": "IS 269:1989 is WITHDRAWN and superseded by IS 269:2015.",
    },
    {
        "id": "CASE-02",
        "name": "Misapplied Scope Boundary",
        "description": "Cites IS 456:2000 for highway road bridge structure, violating Clause 1.1 scope exclusions.",
        "text": "Design and construction of 4-lane prestressed concrete road bridge girders and deck slabs across river crossing conforming strictly to IS 456:2000.",
        "expected_violation_types": [ViolationType.ERR_SCOPE_CONFLICT],
        "expected_standards": ["IS 456:2000"],
        "expected_replacement_standards": ["IRC:112:2020"],
        "should_pass": False,
        "rationale": "IS 456 Clause 1.1 explicitly excludes road bridges. Highway bridges are governed by IRC:112:2020.",
    },
    {
        "id": "CASE-03",
        "name": "Missing Mandatory QCO Compliance",
        "description": "Procures outdoor distribution transformers without requiring mandatory BIS certification / ISI mark.",
        "text": "Supply and commissioning of 100 kVA 11/0.433 kV three phase outdoor type distribution transformers for rural electrification works.",
        "expected_violation_types": [ViolationType.ERR_QCO_OMISSION],
        "expected_standards": [],
        "expected_replacement_standards": ["IS 1180 (Part 1):2014"],
        "should_pass": False,
        "rationale": "Electrical Transformers (Quality Control) Order mandates that all distribution transformers bear ISI mark.",
    },
    {
        "id": "CASE-04",
        "name": "Superseded Normative Reference",
        "description": "Active parent standard IS 456:2000 cited alongside obsolete normative cement standard IS 269:1989.",
        "text": "All plain and reinforced concrete works shall conform to IS 456:2000, with cement conforming to IS 269:1989.",
        "expected_violation_types": [ViolationType.ERR_OBSOLETE_STANDARD],
        "expected_standards": ["IS 456:2000", "IS 269:1989"],
        "expected_replacement_standards": ["IS 269:2015"],
        "should_pass": False,
        "rationale": "IS 269:1989 is obsolete; parent IS 456:2000 depends normatively on active cement standard IS 269:2015.",
    },
    {
        "id": "CASE-05",
        "name": "Gazetted Amendment Non-Compliance",
        "description": "Fe 500D steel rebar specified with 12% elongation, failing Amendment No. 3 (2021) requirement of 14.5%.",
        "text": "Supply of Fe 500D high strength deformed steel bars conforming to IS 1786:2008 with minimum elongation of 12% for seismic ductile detailing.",
        "expected_violation_types": [ViolationType.ERR_AMENDMENT_MISMATCH],
        "expected_standards": ["IS 1786:2008"],
        "expected_replacement_standards": ["IS 1786:2008"],
        "should_pass": False,
        "rationale": "Amendment 3 (2021) to IS 1786:2008 updated Fe 500D minimum elongation requirement from 12% to 14.5% (effective 16%).",
    },
    {
        "id": "CASE-06",
        "name": "Contradictory Technical Parameter",
        "description": "Fe 500D specified with yield stress 450 MPa, contradicting standard mandatory minimum 500 MPa.",
        "text": "Supply of Fe 500D high strength deformed steel bars conforming to IS 1786:2008 with yield stress not less than 450 MPa.",
        "expected_violation_types": [ViolationType.ERR_CONTRADICTORY_TEST],
        "expected_standards": ["IS 1786:2008"],
        "expected_replacement_standards": ["IS 1786:2008"],
        "should_pass": False,
        "rationale": "IS 1786 Table 3 mandates minimum yield stress of 500 MPa for grade Fe 500D. 450 MPa is contradictory.",
    },
    {
        "id": "CASE-07",
        "name": "Unnumbered Technical Specification",
        "description": "No IS code cited in tender; system must proactively retrieve IS 10322 and verify parameters.",
        "text": "Supply and installation of 500 units of 120W LED street lighting luminaires, IP66, for municipal highway illumination conforming to BIS standard with ISI mark.",
        "expected_violation_types": [],
        "expected_standards": ["IS 10322 (Part 5/Sec 3):2012"],
        "expected_replacement_standards": [],
        "should_pass": True,
        "rationale": "Proactive lexical retrieval discovers IS 10322; IP66 >= IP65 mandatory min; compliant baseline.",
    },
    {
        "id": "CASE-08",
        "name": "Proprietary Brand Lock-in",
        "description": "Restricts procurement to named proprietary brands (UltraTech / ACC) in violation of GFR Rule 144(i).",
        "text": "The contractor shall procure structural cement exclusively from UltraTech or ACC cement plants.",
        "expected_violation_types": [ViolationType.ERR_BRAND_EXCLUSION],
        "expected_standards": [],
        "expected_replacement_standards": [],
        "should_pass": False,
        "rationale": "Proprietary brand names without technical justification violate GFR Rule 144(i) and CVC guidelines.",
    },
    {
        "id": "CASE-09",
        "name": "Energy Efficiency & Loss Violation",
        "description": "Transformer total loss at 50% load specified at 95W, exceeding IS 1180 maximum permissible limit of 80W.",
        "text": "Supply of 100 kVA 11 kV outdoor distribution transformers conforming to IS 1180 (Part 1):2014 with total losses at 50% load not exceeding 95 W.",
        "expected_violation_types": [ViolationType.ERR_CONTRADICTORY_TEST],
        "expected_standards": ["IS 1180 (Part 1):2014"],
        "expected_replacement_standards": ["IS 1180 (Part 1):2014"],
        "should_pass": False,
        "rationale": "IS 1180 Table 3 mandates maximum total loss at 50% load not exceeding 80 W. 95 W violates energy limit.",
    },
    {
        "id": "CASE-10",
        "name": "Environmental Scope Misapplication",
        "description": "IS 269 OPC specified for deep foundation in high sulfate soil environment, where IS 12330 is mandatory.",
        "text": "Foundation concrete work in high sulfate soil (>1.0% SO3 concentration) using 43 grade Ordinary Portland Cement conforming to IS 269:2015.",
        "expected_violation_types": [ViolationType.ERR_SCOPE_CONFLICT],
        "expected_standards": ["IS 269:2015"],
        "expected_replacement_standards": ["IS 12330:1988"],
        "should_pass": False,
        "rationale": "IS 269 OPC is excluded in high sulfate aggressive environments; Sulfate Resisting Cement IS 12330:1988 governs.",
    },
    {
        "id": "CASE-11",
        "name": "Compressive Strength Grade Contradiction",
        "description": "43-grade cement specified with 28-day compressive strength of 35 MPa, below mandatory 43 MPa.",
        "text": "Supply of 43 grade Ordinary Portland Cement conforming to IS 269:2015 having 28-day compressive strength of not less than 35 MPa.",
        "expected_violation_types": [ViolationType.ERR_CONTRADICTORY_TEST],
        "expected_standards": ["IS 269:2015"],
        "expected_replacement_standards": ["IS 269:2015"],
        "should_pass": False,
        "rationale": "IS 269:2015 Table 2 mandates 28-day compressive strength of at least 43 MPa for 43-grade cement.",
    },
    {
        "id": "CASE-12",
        "name": "Fully Valid Compliant Tender",
        "description": "Clean baseline tender meeting all statutory, scope, amendment, and technical constraint requirements.",
        "text": "Supply of Fe 500D high strength deformed TMT steel reinforcement bars conforming to IS 1786:2008 with yield stress min 500 MPa and elongation min 16% for building construction, bearing mandatory BIS ISI certification.",
        "expected_violation_types": [],
        "expected_standards": ["IS 1786:2008"],
        "expected_replacement_standards": [],
        "should_pass": True,
        "rationale": "Valid active standard, correct scope (building construction), compliant parameters, and QCO/ISI stipulation.",
    },
]
