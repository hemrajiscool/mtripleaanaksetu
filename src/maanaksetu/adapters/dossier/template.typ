// Government of India / Bureau of Indian Standards (BIS) Official Audit Dossier
// Project Sovereign (MaanakSetu — SIH26108)

#let audit = json("audit.json")

#set document(
  title: "MaanakSetu Audit Dossier - " + audit.tender_id,
  author: "Bureau of Indian Standards (BIS) - Sovereign Engine",
  date: auto,
)

#set page(
  paper: "a4",
  margin: (top: 1.8cm, bottom: 2.0cm, left: 2.0cm, right: 2.0cm),
  header: context {
    if counter(page).get().first() > 1 [
      #grid(
        columns: (1fr, auto),
        align: (left, right),
        text(7.5pt, fill: rgb("#64748b"), weight: "bold")[
          GOVERNMENT OF INDIA #h(4pt) | #h(4pt) MAANAKSETU STATUTORY AUDIT DOSSIER
        ],
        text(7.5pt, fill: rgb("#64748b"))[
          Ref: #audit.tender_id
        ]
      )
      #v(-3pt)
      #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
    ]
  },
  footer: context [
    #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
    #v(-2pt)
    #grid(
      columns: (1fr, auto),
      align: (left + horizon, right + horizon),
      text(7pt, fill: rgb("#94a3b8"))[
        Confidential & Statutory • Issued under GFR 2017 Rule 173(v) • SHA-256: #audit.sha256_digest.slice(0, 16)...
      ],
      text(7.5pt, fill: rgb("#64748b"), weight: "medium")[
        Page #counter(page).display() of #context counter(page).final().first()
      ]
    )
  ]
)

#set text(
  font: ("Segoe UI", "Arial"),
  size: 9pt,
  fill: rgb("#0f172a"),
  lang: "en",
)

// ==========================================
// PAGE 1: EXECUTIVE SUMMARY & SCORECARD
// ==========================================

#align(center)[
  #block(width: 100%)[
    #text(8.5pt, weight: "bold", fill: rgb("#1e3a8a"), tracking: 1.5pt)[
      GOVERNMENT OF INDIA #h(4pt) • #h(4pt) MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
    ]
    #v(1pt)
    #text(12pt, weight: "bold", fill: rgb("#0f172a"))[
      BUREAU OF INDIAN STANDARDS (BIS)
    ]
    #v(0.5pt)
    #text(7.5pt, fill: rgb("#475569"))[
      Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002
    ]
    #v(3pt)
    #line(length: 100%, stroke: 1.5pt + rgb("#1d4ed8"))
    #v(1pt)
    #text(13pt, weight: "bold", fill: rgb("#1d4ed8"))[
      NATIONAL STATUTORY COMPLIANCE AUDIT DOSSIER
    ]
    #v(-2pt)
    #text(7.5pt, fill: rgb("#64748b"))[
      Statutory Vetting & Standards Verification under General Financial Rules (GFR) 2017, Rule 173(v)
    ]
  ]
]

#v(8pt)

// Metadata strip
#rect(
  width: 100%,
  radius: 4pt,
  fill: rgb("#f8fafc"),
  stroke: 0.75pt + rgb("#e2e8f0"),
  inset: (x: 10pt, y: 7pt)
)[
  #grid(
    columns: (1fr, 1fr, 1.2fr),
    gutter: 8pt,
    [
      #text(7pt, fill: rgb("#64748b"), weight: "bold")[TENDER REFERENCE ID]\
      #text(8.5pt, weight: "bold", fill: rgb("#0f172a"))[#audit.tender_id]
    ],
    [
      #text(7pt, fill: rgb("#64748b"), weight: "bold")[EVALUATION DATE]\
      #text(8.5pt, weight: "medium", fill: rgb("#0f172a"))[#audit.generated_at.slice(0, 10)]
    ],
    [
      #text(7pt, fill: rgb("#64748b"), weight: "bold")[DOCUMENT TITLE]\
      #text(8.5pt, weight: "medium", fill: rgb("#0f172a"))[#audit.tender_title]
    ]
  )
]

#v(10pt)

// Compliance Scorecard & KRI Section
#let score = audit.compliance_score
#let score_color = if score >= 85 { rgb("#059669") } else if score >= 60 { rgb("#d97706") } else { rgb("#dc2626") }
#let score_label = if score >= 85 { "STATUTORILY COMPLIANT" } else if score >= 60 { "AMENDMENT REQUIRED" } else { "NON-COMPLIANT / REJECT" }

#grid(
  columns: (1.1fr, 2.2fr),
  gutter: 12pt,
  [
    #rect(
      width: 100%,
      radius: 6pt,
      fill: rgb("#ffffff"),
      stroke: 1.5pt + score_color,
      inset: (x: 8pt, y: 12pt)
    )[
      #align(center + horizon)[
        #text(7pt, weight: "bold", fill: rgb("#64748b"))[COMPLIANCE SCORECARD]\
        #v(4pt)
        #text(36pt, weight: "bold", fill: score_color)[#str(score)]
        #text(14pt, fill: rgb("#94a3b8"))[/100]\
        #v(3pt)
        #rect(
          fill: score_color.lighten(85%),
          radius: 3pt,
          inset: (x: 6pt, y: 3pt)
        )[
          #text(7.5pt, weight: "bold", fill: score_color)[#score_label]
        ]
        #v(4pt)
        #text(7pt, fill: rgb("#64748b"))[
          Total Clauses: #str(audit.total_clauses_analyzed)
        ]
      ]
    ]
  ],
  [
    #rect(
      width: 100%,
      radius: 6pt,
      fill: rgb("#f8fafc"),
      stroke: 0.75pt + rgb("#e2e8f0"),
      inset: (x: 10pt, y: 10pt)
    )[
      #text(8.5pt, weight: "bold", fill: rgb("#1e3a8a"))[KEY RISK INDICATORS (KRI)]\
      #v(5pt)
      #grid(
        columns: (1fr, 1fr),
        gutter: 8pt,
        [
          #rect(width: 100%, fill: rgb("#ffffff"), stroke: 0.5pt + rgb("#e2e8f0"), radius: 3pt, inset: 6pt)[
            #text(14pt, weight: "bold", fill: if audit.violations.len() > 0 { rgb("#dc2626") } else { rgb("#059669") })[#str(audit.violations.len())]\
            #text(7pt, fill: rgb("#64748b"), weight: "bold")[STATUTORY VIOLATIONS]
          ]
        ],
        [
          #rect(width: 100%, fill: rgb("#ffffff"), stroke: 0.5pt + rgb("#e2e8f0"), radius: 3pt, inset: 6pt)[
            #text(14pt, weight: "bold", fill: if audit.cascading_dependency_alerts.len() > 0 { rgb("#d97706") } else { rgb("#059669") })[#str(audit.cascading_dependency_alerts.len())]\
            #text(7pt, fill: rgb("#64748b"), weight: "bold")[CASCADING ALERTS]
          ]
        ]
      )
      #v(6pt)
      #text(7.5pt, fill: rgb("#334155"))[
        *Legal Statutory Enforcements:* \
        • *GFR 2017 Rule 173(v)*: Prohibition against proprietary brand exclusion. \
        • *Competition Act 2002 (Sec 3/4)*: Anti-competitive vendor steering bar. \
        • *BIS Act 2016 (Sec 16)*: Mandatory Quality Control Order (QCO) conformance.
      ]
    ]
  ]
)

#v(10pt)

// Executive Summary Section
#block(width: 100%)[
  #text(10pt, weight: "bold", fill: rgb("#0f172a"))[Executive Summary & Engineering Assessment]
  #v(2pt)
  #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
  #v(3pt)
  #rect(
    width: 100%,
    radius: 4pt,
    fill: rgb("#ffffff"),
    stroke: 0.5pt + rgb("#cbd5e1"),
    inset: (x: 10pt, y: 8pt)
  )[
    #text(8pt, fill: rgb("#334155"), style: "normal")[
      #{
        if audit.summary != none and audit.summary.len() > 0 {
          audit.summary
        } else {
          "An automated regulatory audit was performed on tender " + audit.tender_id + " across technical specifications, quality control orders (QCOs), and normative reference standards. The evaluation benchmarked all technical clauses against the active Bureau of Indian Standards (BIS) knowledge graph. Specific statutory infractions, obsolete citations, and corrective redlines are detailed in the subsequent registers."
        }
      }
    ]
  ]
]

#v(8pt)

// Regulatory Mandates Banner
#rect(
  width: 100%,
  radius: 4pt,
  fill: rgb("#eff6ff"),
  stroke: 0.5pt + rgb("#bfdbfe"),
  inset: (x: 10pt, y: 7pt)
)[
  #grid(
    columns: (auto, 1fr),
    gutter: 8pt,
    align: (horizon, horizon),
    text(14pt)[🏛️],
    text(7.5pt, fill: rgb("#1e40af"))[
      *Statutory Attestation:* This document is generated autonomously by MaanakSetu (Project Sovereign). All findings are backed by the Bureau of Indian Standards Act 2016 and General Financial Rules 2017. Any deviation requires formal technical justification and competent administrative approval before publication on the Central Public Procurement Portal (CPPP).
    ]
  )
]

#pagebreak()

// ==========================================
// PAGE 2: STATUTORY VIOLATION REGISTER
// ==========================================

#text(12pt, weight: "bold", fill: rgb("#1d4ed8"))[
  SECTION 2: STATUTORY VIOLATION REGISTER
]
#v(-2pt)
#text(8pt, fill: rgb("#64748b"))[
  Comprehensive itemization of non-compliant tender clauses, statutory basis, and legal redline replacements.
]

#v(6pt)

#if audit.violations.len() == 0 [
  #rect(
    width: 100%,
    radius: 4pt,
    fill: rgb("#f0fdf4"),
    stroke: 0.75pt + rgb("#86efac"),
    inset: (x: 16pt, y: 24pt)
  )[
    #align(center)[
      #text(11pt, weight: "bold", fill: rgb("#166534"))[✓ ZERO STATUTORY VIOLATIONS DETECTED]\
      #v(6pt)
      #text(8.5pt, fill: rgb("#15803d"))[
        All analyzed clauses strictly comply with active Bureau of Indian Standards (BIS) specifications, General Financial Rules 2017 Rule 173(v), and Quality Control Orders. The tender is eligible for statutory certification.
      ]
    ]
  ]
] else [
  #table(
    columns: (0.7fr, 1fr, 1.2fr, 1.6fr, 1.5fr),
    stroke: (x, y) => if y == 0 { (bottom: 1.5pt + rgb("#1d4ed8")) } else { 0.5pt + rgb("#e2e8f0") },
    fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else if calc.even(y) { rgb("#f8fafc") } else { rgb("#ffffff") },
    inset: (x: 5pt, y: 5pt),
    align: (col, row) => if row == 0 { center + horizon } else { left + top },
    
    // Header
    text(7pt, weight: "bold", fill: rgb("#0f172a"))[Clause ID],
    text(7pt, weight: "bold", fill: rgb("#0f172a"))[Violation Type],
    text(7pt, weight: "bold", fill: rgb("#0f172a"))[Statutory Basis],
    text(7pt, weight: "bold", fill: rgb("#0f172a"))[Remediation / Redline],
    text(7pt, weight: "bold", fill: rgb("#0f172a"))[Engineering Rationale],

    // Rows
    ..audit.violations.map(viol => (
      [
        #text(7pt, weight: "bold", fill: rgb("#1e293b"))[#viol.clause_id]\
        #text(6pt, fill: rgb("#64748b"))[#viol.violation_id]
      ],
      [
        #let v_color = if viol.violation_type == "ERR_BRAND_EXCLUSION" { rgb("#b91c1c") } else if viol.violation_type == "ERR_OBSOLETE_STANDARD" { rgb("#c2410c") } else { rgb("#4338ca") }
        #rect(fill: v_color.lighten(90%), radius: 2pt, inset: (x: 3pt, y: 2pt))[
          #text(6pt, weight: "bold", fill: v_color)[#viol.violation_type]
        ]
        #v(1pt)
        #text(6pt, fill: rgb("#475569"))[*Entity:* #viol.cited_entity]
      ],
      [
        #text(6.5pt, weight: "medium", fill: rgb("#0f172a"))[#viol.legal_statute]
      ],
      [
        #text(6.5pt, fill: rgb("#15803d"), weight: "medium")[
          #{
            if viol.redline_replacement != none and viol.redline_replacement.len() > 0 {
              viol.redline_replacement
            } else if viol.replacement_standard != none {
              "Replace with active standard: " + viol.replacement_standard
            } else {
              "Remove restrictive citation."
            }
          }
        ]
      ],
      [
        #text(6.5pt, fill: rgb("#334155"))[#viol.engineering_rationale]
      ]
    )).flatten()
  )
]

#v(8pt)

#rect(
  width: 100%,
  radius: 3pt,
  fill: rgb("#fef2f2"),
  stroke: 0.5pt + rgb("#fecaca"),
  inset: (x: 8pt, y: 6pt)
)[
  #text(7pt, fill: rgb("#991b1b"))[
    *Remediation Directive:* Under GFR 2017 Rule 173(v), tenders containing restrictive brand names or withdrawn standards must issue a Corrigendum adopting the prescribed legal redline replacements prior to technical bid opening.
  ]
]

#pagebreak()

// ==========================================
// PAGE 3: DEPENDENCY MAP & ATTESTATION BLOCK
// ==========================================

#text(12pt, weight: "bold", fill: rgb("#1d4ed8"))[
  SECTION 3: NORMATIVE DEPENDENCY ANALYSIS & VERIFICATION
]
#v(-2pt)
#text(8pt, fill: rgb("#64748b"))[
  Cascading multi-hop standard dependency alerts and cryptographic attestation seal.
]

#v(6pt)

#text(9pt, weight: "bold", fill: rgb("#0f172a"))[Cascading Dependency Alert Registry]
#v(2pt)

#if audit.cascading_dependency_alerts.len() == 0 [
  #rect(
    width: 100%,
    radius: 4pt,
    fill: rgb("#f8fafc"),
    stroke: 0.5pt + rgb("#e2e8f0"),
    inset: (x: 12pt, y: 12pt)
  )[
    #text(7.5pt, fill: rgb("#475569"))[
      ✓ No cascading obsolete normative dependencies detected. All referenced parent standards resolve to active, harmonized sub-tier Indian Standards.
    ]
  ]
] else [
  #table(
    columns: (1fr, 1.1fr, 0.8fr, 2.5fr),
    stroke: (x, y) => if y == 0 { (bottom: 1.5pt + rgb("#1d4ed8")) } else { 0.5pt + rgb("#e2e8f0") },
    fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else if calc.even(y) { rgb("#f8fafc") } else { rgb("#ffffff") },
    inset: (x: 5pt, y: 5pt),
    align: (col, row) => if row == 0 { center + horizon } else { left + top },

    text(7pt, weight: "bold", fill: rgb("#0f172a"))[Parent Standard],
    text(7pt, weight: "bold", fill: rgb("#0f172a"))[Obsolete Sub-Ref],
    text(7pt, weight: "bold", fill: rgb("#0f172a"))[Status],
    text(7pt, weight: "bold", fill: rgb("#0f172a"))[Engineering & Structural Risk],

    ..audit.cascading_dependency_alerts.map(alert => (
      [#text(7pt, weight: "bold", fill: rgb("#1e293b"))[#alert.parent_is]],
      [#text(7pt, fill: rgb("#b91c1c"), weight: "bold")[#alert.obsolete_sub_ref]],
      [
        #rect(fill: rgb("#fee2e2"), radius: 2pt, inset: (x: 4pt, y: 2pt))[
          #text(6pt, weight: "bold", fill: rgb("#b91c1c"))[#alert.sub_ref_status]
        ]
      ],
      [#text(6.5pt, fill: rgb("#334155"))[#alert.engineering_risk]]
    )).flatten()
  )
]

#v(14pt)

// Cryptographic Verification Block
#rect(
  width: 100%,
  radius: 6pt,
  fill: rgb("#ffffff"),
  stroke: 1.5pt + rgb("#1d4ed8"),
  inset: (x: 12pt, y: 12pt)
)[
  #grid(
    columns: (72pt, 1fr),
    gutter: 14pt,
    align: (center + horizon, left + top),
    [
      #image("qr.png", width: 68pt)
      #v(2pt)
      #text(6pt, fill: rgb("#64748b"))[Scan to Verify Authenticity]
    ],
    [
      #text(10pt, weight: "bold", fill: rgb("#1d4ed8"))[OFFICIAL CRYPTOGRAPHIC ATTESTATION SEAL]
      #v(2pt)
      #text(7pt, fill: rgb("#475569"))[
        This audit dossier has been cryptographically generated and anchored to the Bureau of Indian Standards (BIS) knowledge repository. Any alteration of clause text, scores, or statutory findings invalidates this state digest.
      ]
      #v(5pt)
      #rect(
        width: 100%,
        fill: rgb("#f1f5f9"),
        radius: 3pt,
        inset: (x: 6pt, y: 4pt)
      )[
        #text(6.5pt, fill: rgb("#64748b"), weight: "bold")[SHA-256 TAMPER-EVIDENT DIGEST:]\
        #text(7pt, font: ("Consolas", "Courier New", "Liberation Mono"), fill: rgb("#0f172a"), weight: "bold")[
          #audit.sha256_digest
        ]
      ]
      #v(6pt)
      #grid(
        columns: (1fr, 1fr),
        gutter: 8pt,
        [
          #text(6.5pt, fill: rgb("#64748b"))[ISSUING AUTHORITY:]\
          #text(7pt, weight: "bold", fill: rgb("#0f172a"))[MaanakSetu Autonomous Engine]\
          #text(6.5pt, fill: rgb("#475569"))[SIH26108 BIS National Portal]
        ],
        [
          #text(6.5pt, fill: rgb("#64748b"))[ATTESTATION TIMESTAMP:]\
          #text(7pt, weight: "bold", fill: rgb("#0f172a"))[#audit.generated_at]\
          #text(6.5pt, fill: rgb("#059669"), weight: "bold")[✓ Cryptographically Verified]
        ]
      )
    ]
  )
]

#v(8pt)

#align(center)[
  #text(6.5pt, fill: rgb("#94a3b8"))[
    Bureau of Indian Standards • Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002 • https://standardsbis.bsbedge.com
  ]
]
