"""Sub-tier Normative Dependency and Cascading Obsolescence Verifier (SpecGuard Core).

Rule ID: RULE-DEPENDENCY-CASCADING-OBSOLESCENCE
Technical Invariant: An active standard must not normatively rely on a withdrawn or
obsolete sub-tier standard.
"""

from __future__ import annotations

from typing import List, Set

import networkx as nx

from maanaksetu.domain.models import DependencyAlert, StandardEdition
from maanaksetu.domain.states import StandardStatus
from maanaksetu.knowledge.graph import resolve_supersession_chain


class DependenciesVerifier:
    """Traverses normative reference DAG to identify cascading obsolete sub-tier dependencies."""

    RULE_ID = "RULE-DEPENDENCY-CASCADING-OBSOLESCENCE"

    def __init__(self, graph: nx.DiGraph):
        self.graph = graph

    def verify(self, standards: List[StandardEdition]) -> List[DependencyAlert]:
        """Analyze normative reference edges for cascading obsolescence."""
        alerts: List[DependencyAlert] = []

        for std in standards:
            if std.status in (StandardStatus.WITHDRAWN, StandardStatus.SUPERSEDED):
                parents: Set[str] = set()

                # Direct predecessors of std.is_number
                if std.is_number in self.graph:
                    for pred in self.graph.predecessors(std.is_number):
                        edge_data = self.graph.get_edge_data(pred, std.is_number, default={})
                        if edge_data.get("relationship") == "NORMATIVE_REF":
                            parents.add(pred)

                # Predecessors of replacement or base standard
                replacement = resolve_supersession_chain(self.graph, std.is_number) or std.superseded_by
                candidates = [c for c in [replacement, std.is_number.split(":")[0]] if c and c in self.graph]
                for cand in candidates:
                    for pred in self.graph.predecessors(cand):
                        edge_data = self.graph.get_edge_data(pred, cand, default={})
                        if edge_data.get("relationship") == "NORMATIVE_REF":
                            parents.add(pred)

                # Prefer versioned standards over unversioned base codes
                versioned_bases = {p.split(":")[0] for p in parents if ":" in p}
                filtered_parents = {
                    p for p in parents
                    if ":" in p or p not in versioned_bases
                }

                for parent in sorted(filtered_parents, key=lambda p: (":" in p, len(p)), reverse=True):
                    alerts.append(
                        DependencyAlert(
                            parent_is=parent,
                            obsolete_sub_ref=std.is_number,
                            sub_ref_status=std.status,
                            relationship_type="NORMATIVE_REF",
                            depth=1,
                            engineering_risk=(
                                f"Parent standard '{parent}' normatively depends on '{std.is_number}' "
                                f"(or its active revision), which is obsolete. Specifying the obsolete standard "
                                f"compromises compliance with '{parent}'."
                            ),
                        )
                    )

        return alerts
