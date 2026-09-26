"""Requirement and Technical Parameter Extractor (MaanakSetu V1).

Extracts structured technical requirements, canonicalized engineering parameters,
product domains, and application contexts from tender specifications.
"""

from __future__ import annotations

import re
from typing import Any, List, Optional, Tuple, Union

from maanaksetu.domain.models import (
    DocumentSegment,
    ParameterConstraint,
    Requirement,
    RequirementBundle,
)
from maanaksetu.domain.states import ParameterCondition
from maanaksetu.engine.discovery.exact import extract_is_codes

# ═════════════════════════════════════════════════════════════════════════════
# Parameter Extraction Patterns
# ═════════════════════════════════════════════════════════════════════════════

# Yield Stress / Yield Strength: e.g. "yield stress of 450 MPa", "yield strength min 500 N/mm2", "450 MPa yield stress"
YIELD_STRESS_PATTERNS = [
    re.compile(
        r"(?:yield\s*stress|yield\s*strength|YS)(?:(?:\s+of|\s+shall\s+be|\s+to\s+be|\s+having)?(?:\s+not\s+less\s+than|\s+minimum|\s+min|\s+at\s+least|\s*:)?)?\s*(-?\d+(?:\.\d+)?)\s*(?:MPa|N/mm[2²]|megapascals?)?",
        re.IGNORECASE,
    ),
    re.compile(
        r"(-?\d+(?:\.\d+)?)\s*(?:MPa|N/mm[2²])\s*(?:yield\s*stress|yield\s*strength)",
        re.IGNORECASE,
    ),
]

# Elongation: e.g. "elongation of 12%", "minimum elongation 14.5 percent", "12% elongation"
ELONGATION_PATTERNS = [
    re.compile(
        r"(?:elongation|EL)(?:(?:\s+of|\s+shall\s+be|\s+to\s+be|\s+having)?(?:\s+not\s+less\s+than|\s+minimum|\s+min|\s+at\s+least|\s*:)?)?\s*(\d+(?:\.\d+)?)\s*(?:%|percent)",
        re.IGNORECASE,
    ),
    re.compile(
        r"(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:elongation)",
        re.IGNORECASE,
    ),
]

# Tensile / Yield ratio (UTS / YS): e.g. "UTS/YS ratio 1.25", "UTS / YS >= 1.25"
UTS_YS_PATTERN = re.compile(
    r"(?:UTS\s*/\s*YS|tensile\s*to\s*yield\s*ratio)(?:(?:\s+of|\s+shall\s+be|\s+to\s+be)?(?:\s+not\s+less\s+than|\s+minimum|\s+min|\s*>=|\s*:)?)?\s*(\d+(?:\.\d+)?)",
    re.IGNORECASE,
)

# Compressive Strength: e.g. "28-day compressive strength of 35 MPa", "compressive strength 43 N/mm2", "35 MPa compressive strength"
COMPRESSIVE_PATTERNS = [
    re.compile(
        r"(?:(?:28[\s-]day\s*)?compressive\s*strength|28[\s-]day\s*strength)(?:(?:\s+of|\s+shall\s+be|\s+to\s+be|\s+having)?(?:\s+not\s+less\s+than|\s+minimum|\s+min|\s+at\s+least|\s*:)?)?\s*(\d+(?:\.\d+)?)\s*(?:MPa|N/mm[2²])?",
        re.IGNORECASE,
    ),
    re.compile(
        r"(\d+(?:\.\d+)?)\s*(?:MPa|N/mm[2²])\s*(?:28[\s-]day\s*)?compressive\s*strength",
        re.IGNORECASE,
    ),
]

# Ingress Protection (IP Rating): e.g. "IP65", "IP66", "IP 67", "IP54"
IP_PATTERN = re.compile(
    r"\bIP\s*([0-9]{2})\b",
    re.IGNORECASE,
)

# Wattage: e.g. "120W", "150 Watt", "90 Watts"
WATTAGE_PATTERN = re.compile(
    r"\b(\d+(?:\.\d+)?)\s*(?:W|Watt|Watts)\b",
    re.IGNORECASE,
)

# Total Losses: e.g. "losses not exceeding 80W at 50%", "max total loss 270 W"
LOSS_50_PATTERN = re.compile(
    r"(?:total\s*loss(?:es)?|losses)[^.\n]{0,80}?(?:at\s*50%\s*load|50%\s*load)[^.\n]{0,80}?(?:not\s*exceeding|max|maximum|:)?\s*(-?\d+(?:\.\d+)?)\s*(?:W|watts?)",
    re.IGNORECASE,
)
LOSS_100_PATTERN = re.compile(
    r"(?:total\s*loss(?:es)?|losses)[^.\n]{0,80}?(?:at\s*100%\s*load|100%\s*load|full\s*load)[^.\n]{0,80}?(?:not\s*exceeding|max|maximum|:)?\s*(-?\d+(?:\.\d+)?)\s*(?:W|watts?)",
    re.IGNORECASE,
)

# Setting Time: e.g. "initial setting time not less than 30 minutes"
SETTING_TIME_PATTERN = re.compile(
    r"(?:initial\s*setting\s*time)\s*(?:not\s*less\s*than|minimum|min|at\s*least|:)?\s*(\d+(?:\.\d+)?)\s*(?:min|minutes?)",
    re.IGNORECASE,
)

# Soundness: e.g. "soundness not exceeding 10 mm"
SOUNDNESS_PATTERN = re.compile(
    r"(?:soundness)\s*(?:not\s*exceeding|maximum|max|less\s*than|:)?\s*(\d+(?:\.\d+)?)\s*(?:mm)",
    re.IGNORECASE,
)

# Grades: Steel, Cement, Concrete
STEEL_GRADE_PATTERN = re.compile(r"\bFe[\s-]?(\d{3}[A-Z]?)\b", re.IGNORECASE)
CEMENT_GRADE_PATTERN = re.compile(r"\b(33|43|53)[\s-]grade\b|\bOPC[\s-]?(33|43|53)\b", re.IGNORECASE)
CONCRETE_GRADE_PATTERN = re.compile(r"\bM[\s-]?(\d{2})\b", re.IGNORECASE)


def detect_condition(surrounding_text: str) -> ParameterCondition:
    """Infer parameter condition bound from context."""
    s = surrounding_text.lower()
    if any(k in s for k in ("minimum", "min", "at least", "not less than", ">=", "greater than")):
        return ParameterCondition.MIN
    if any(k in s for k in ("maximum", "max", "not exceeding", "not more than", "<=", "less than")):
        return ParameterCondition.MAX
    if "between" in s:
        return ParameterCondition.RANGE
    return ParameterCondition.EXACT


def extract_parameters(text: str) -> List[ParameterConstraint]:
    """Extract and normalize all technical parameter constraints from specification text."""
    constraints: List[ParameterConstraint] = []
    seen_params = set()

    # 1. Yield Stress
    for pat in YIELD_STRESS_PATTERNS:
        m = pat.search(text)
        if m and "yield_stress" not in seen_params:
            val = float(m.group(1))
            cond = detect_condition(m.group(0))
            constraints.append(
                ParameterConstraint(
                    name="yield_stress",
                    value=val,
                    unit="MPa",
                    condition=cond,
                    raw_text=m.group(0).strip(),
                )
            )
            seen_params.add("yield_stress")
            break

    # 2. Elongation
    for pat in ELONGATION_PATTERNS:
        m = pat.search(text)
        if m and "elongation" not in seen_params:
            val = float(m.group(1))
            cond = detect_condition(m.group(0))
            constraints.append(
                ParameterConstraint(
                    name="elongation",
                    value=val,
                    unit="%",
                    condition=cond,
                    raw_text=m.group(0).strip(),
                )
            )
            seen_params.add("elongation")
            break

    # 3. UTS / YS Ratio
    m = UTS_YS_PATTERN.search(text)
    if m and "uts_ys_ratio" not in seen_params:
        val = float(m.group(1))
        constraints.append(
            ParameterConstraint(
                name="uts_ys_ratio",
                value=val,
                unit="ratio",
                condition=detect_condition(m.group(0)),
                raw_text=m.group(0).strip(),
            )
        )
        seen_params.add("uts_ys_ratio")

    # 4. Compressive Strength
    for pat in COMPRESSIVE_PATTERNS:
        m = pat.search(text)
        if m and "compressive_strength_28_day" not in seen_params:
            val = float(m.group(1))
            cond = detect_condition(m.group(0))
            constraints.append(
                ParameterConstraint(
                    name="compressive_strength_28_day",
                    value=val,
                    unit="MPa",
                    condition=cond,
                    raw_text=m.group(0).strip(),
                )
            )
            seen_params.add("compressive_strength_28_day")
            break

    # 5. IP Rating
    m = IP_PATTERN.search(text)
    if m and "ingress_protection" not in seen_params:
        rating_num = int(m.group(1))
        constraints.append(
            ParameterConstraint(
                name="ingress_protection",
                value=float(rating_num),
                unit="IP",
                condition=ParameterCondition.MIN,
                raw_text=m.group(0).strip(),
            )
        )
        seen_params.add("ingress_protection")

    # 6. Wattage
    m = WATTAGE_PATTERN.search(text)
    if m and "wattage" not in seen_params:
        val = float(m.group(1))
        constraints.append(
            ParameterConstraint(
                name="wattage",
                value=val,
                unit="W",
                condition=ParameterCondition.EXACT,
                raw_text=m.group(0).strip(),
            )
        )
        seen_params.add("wattage")

    # 7. Total Losses
    m = LOSS_50_PATTERN.search(text)
    if m and "max_total_loss_at_50_pct" not in seen_params:
        val = float(m.group(1))
        constraints.append(
            ParameterConstraint(
                name="max_total_loss_at_50_pct",
                value=val,
                unit="W",
                condition=ParameterCondition.MAX,
                raw_text=m.group(0).strip(),
            )
        )
        seen_params.add("max_total_loss_at_50_pct")

    m = LOSS_100_PATTERN.search(text)
    if m and "max_total_loss_at_100_pct" not in seen_params:
        val = float(m.group(1))
        constraints.append(
            ParameterConstraint(
                name="max_total_loss_at_100_pct",
                value=val,
                unit="W",
                condition=ParameterCondition.MAX,
                raw_text=m.group(0).strip(),
            )
        )
        seen_params.add("max_total_loss_at_100_pct")

    # 8. Setting Time
    m = SETTING_TIME_PATTERN.search(text)
    if m and "initial_setting_time" not in seen_params:
        val = float(m.group(1))
        constraints.append(
            ParameterConstraint(
                name="initial_setting_time",
                value=val,
                unit="minutes",
                condition=detect_condition(m.group(0)),
                raw_text=m.group(0).strip(),
            )
        )
        seen_params.add("initial_setting_time")

    # 9. Soundness
    m = SOUNDNESS_PATTERN.search(text)
    if m and "soundness" not in seen_params:
        val = float(m.group(1))
        constraints.append(
            ParameterConstraint(
                name="soundness",
                value=val,
                unit="mm",
                condition=ParameterCondition.MAX,
                raw_text=m.group(0).strip(),
            )
        )
        seen_params.add("soundness")

    # 10. Grade Attributes
    m = STEEL_GRADE_PATTERN.search(text)
    if m:
        canonical_grade = f"Fe {m.group(1).upper()}"
        constraints.append(
            ParameterConstraint(
                name="grade",
                value=canonical_grade,
                unit=None,
                condition=ParameterCondition.EXACT,
                raw_text=m.group(0).strip(),
            )
        )

    m = CEMENT_GRADE_PATTERN.search(text)
    if m:
        grade_num = m.group(1) or m.group(2)
        canonical_grade = f"{grade_num}_grade"
        constraints.append(
            ParameterConstraint(
                name="grade",
                value=canonical_grade,
                unit=None,
                condition=ParameterCondition.EXACT,
                raw_text=m.group(0).strip(),
            )
        )

    m = CONCRETE_GRADE_PATTERN.search(text)
    if m:
        grade_str = f"M{m.group(1)}"
        constraints.append(
            ParameterConstraint(
                name="concrete_grade",
                value=grade_str,
                unit=None,
                condition=ParameterCondition.MIN,
                raw_text=m.group(0).strip(),
            )
        )

    return constraints


def detect_product_category(text: str) -> Tuple[str, Optional[str]]:
    """
    Detect the product domain and engineering application context from text.
    
    Returns:
        (product_name, application_context)
    """
    t = text.lower()

    # 1. Lighting Luminaires
    if any(w in t for w in ("led", "luminaire", "luminaires", "streetlight", "street light", "street lighting")):
        product = "led_luminaire"
        app = "street_lighting"
        if "highway" in t or "road" in t or "outdoor" in t or "illumination" in t:
            app = "street_lighting"
        return product, app

    # 2. Concrete & RCC (Composite structural specification prioritized before constituent cement)
    if any(w in t for w in ("concrete", "rcc", "plain concrete", "reinforced concrete")):
        product = "structural_concrete"
        if any(w in t for w in ("sulfate", "sulphate", "saline", "marine", "sewage")):
            app = "high_sulfate_soil"
        elif any(w in t for w in ("highway bridge", "road bridge", "bridge girder", "bridge", "flyover")):
            app = "highway_bridges"
        elif "railway bridge" in t:
            app = "railway_bridges"
        elif any(w in t for w in ("pavement", "rigid pavement", "road pavement")):
            app = "road_pavements"
        elif any(w in t for w in ("prestressed", "post-tensioned")):
            app = "prestressed_concrete"
        else:
            app = "general_building"
        return product, app

    # 3. Steel / Rebar / TMT
    if any(w in t for w in ("tmt", "rebar", "reinforcement bar", "steel bar", "deformed bar", "fe 500", "fe 415", "fe 550")):
        product = "steel_reinforcement"
        app = "general_building"
        if any(w in t for w in ("bridge", "flyover", "highway")):
            app = "highway_bridges"
        return product, app

    # 4. Cement
    if any(w in t for w in ("cement", "opc", "ppc", "portland cement")):
        product = "cement"
        app = "general_construction"
        if any(w in t for w in ("highway bridge", "road bridge", "bridge girder", "bridge", "flyover")):
            app = "highway_bridges"
        elif any(w in t for w in ("sulfate", "sulphate", "saline", "marine", "sewage")):
            app = "high_sulfate_soil"
        return product, app

    # 5. Transformers / Insulating Oils
    if any(w in t for w in ("transformer", "kva", "switchgear", "distribution transformer")):
        product = "distribution_transformer"
        app = "power_distribution"
        return product, app

    if any(w in t for w in ("insulating oil", "mineral oil", "transformer oil")):
        product = "insulating_oil"
        app = "transformer_insulation"
        return product, app

    # Fallback with domain application context detection
    app = "general_construction"
    if any(w in t for w in ("highway bridge", "road bridge", "bridge girder", "bridge deck", "bridge", "flyover")):
        app = "highway_bridges"
    elif "railway bridge" in t:
        app = "railway_bridges"
    elif any(w in t for w in ("pavement", "rigid pavement", "road pavement")):
        app = "road_pavements"
    elif any(w in t for w in ("sulfate", "sulphate", "marine", "saline", "sewage")):
        app = "high_sulfate_soil"

    return "general_material", app


def extract_requirement(
    source: Union[str, DocumentSegment],
    requirement_id: Optional[str] = None,
    segment_id: Optional[str] = None,
) -> Requirement:
    """
    Extract a fully structured Requirement from a document segment or text snippet.
    """
    if isinstance(source, DocumentSegment):
        text = source.raw_text
        seg_id = source.segment_id
    else:
        text = str(source)
        seg_id = segment_id or "SEG-1"

    import uuid
    req_id = requirement_id or f"REQ-{uuid.uuid4().hex[:8].upper()}"
    product_name, application = detect_product_category(text)
    params = extract_parameters(text)
    cited_standards = extract_is_codes(text)

    return Requirement(
        requirement_id=req_id,
        segment_id=seg_id,
        product_name=product_name,
        application=application,
        parameters=params,
        cited_standards=cited_standards,
        cited_brands=[],
        raw_text=text,
    )


# Backward compatibility alias
extract_requirement_bundle = extract_requirement

