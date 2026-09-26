"""NetworkX normative dependency and supersession DAG engine."""

from __future__ import annotations

from collections import deque
import json
import sqlite3
from typing import Any, Dict, List, Optional, Set

import networkx as nx

from maanaksetu.domain.models import DependencyAlert
from maanaksetu.domain.states import StandardStatus


def load_normative_graph(db: sqlite3.Connection) -> nx.DiGraph:
    """
    Load the complete standards reference graph from SQLite into memory.

    Nodes: Standards (is_number, title, year, status, key_parameters, etc.)
    Edges:
      - SUPERSEDES: (superseded_is -> superseding_is)
      - NORMATIVE_REF: (citing_is -> cited_is)
    """
    graph = nx.DiGraph()

    # 1. Add nodes from standards_catalog
    cursor = db.execute(
        """
        SELECT is_number, title, year, status, gazette_date, withdrawal_date,
               superseded_by, key_parameters, is_qco_mandatory, scope_text
        FROM standards_catalog;
        """
    )
    for row in cursor.fetchall():
        key_params = {}
        if row["key_parameters"]:
            try:
                key_params = (
                    json.loads(row["key_parameters"])
                    if isinstance(row["key_parameters"], str)
                    else row["key_parameters"]
                )
            except Exception:
                key_params = {}

        graph.add_node(
            row["is_number"],
            title=row["title"],
            year=row["year"],
            status=StandardStatus(row["status"]),
            gazette_date=row["gazette_date"],
            withdrawal_date=row["withdrawal_date"],
            superseded_by=row["superseded_by"],
            key_parameters=key_params,
            is_qco_mandatory=bool(row["is_qco_mandatory"]),
            scope_text=row["scope_text"],
        )

    # 2. Add supersedes edges: superseded_is -> superseding_is
    cursor = db.execute("SELECT superseding_is, superseded_is, year FROM supersedes_edges;")
    for row in cursor.fetchall():
        graph.add_edge(
            row["superseded_is"],
            row["superseding_is"],
            relationship="SUPERSEDES",
            year=row["year"],
        )

    # 3. Add normative references: citing_is -> cited_is
    cursor = db.execute("SELECT citing_is, cited_is, clause_ref FROM normative_references;")
    for row in cursor.fetchall():
        graph.add_edge(
            row["citing_is"],
            row["cited_is"],
            relationship="NORMATIVE_REF",
            clause_ref=row["clause_ref"],
        )

    return graph


def resolve_supersession_chain(
    graph: nx.DiGraph,
    is_number: str,
) -> Optional[str]:
    """
    Follow supersession edges from an obsolete standard forward to the active replacement.
    Detects cycles and returns None if a cycle is encountered or no active standard is reached.
    """
    if is_number not in graph:
        return None

    current = is_number
    visited: Set[str] = set()

    while current:
        if current in visited:
            return None  # Cycle protection
        visited.add(current)

        node_data = graph.nodes.get(current, {})
        status = node_data.get("status")
        if status == StandardStatus.ACTIVE:
            return current

        # Find successor via SUPERSEDES edge
        next_standard = None
        for successor in graph.successors(current):
            edge_data = graph.get_edge_data(current, successor, default={})
            if edge_data.get("relationship") == "SUPERSEDES":
                next_standard = successor
                break

        # Fallback to node attribute superseded_by
        if not next_standard:
            next_standard = node_data.get("superseded_by")

        current = next_standard

    return None


def find_cascading_obsolescence(
    graph: nx.DiGraph,
    is_number: str,
    max_depth: int = 3,
) -> List[DependencyAlert]:
    """
    Perform BFS traversal along normative reference edges to detect
    any obsolete standards in the sub-dependency chain.
    """
    if is_number not in graph:
        return []

    alerts: List[DependencyAlert] = []
    visited: Set[str] = {is_number}
    queue: deque[tuple[str, int]] = deque([(is_number, 0)])

    while queue:
        current_node, depth = queue.popleft()

        if depth >= max_depth:
            continue

        for successor in graph.successors(current_node):
            edge_data = graph.get_edge_data(current_node, successor, default={})
            if edge_data.get("relationship") != "NORMATIVE_REF":
                continue

            successor_data = graph.nodes.get(successor, {})
            status = successor_data.get("status")

            if status in (StandardStatus.SUPERSEDED, StandardStatus.WITHDRAWN):
                replacement = resolve_supersession_chain(graph, successor)
                status_val = status.value if isinstance(status, StandardStatus) else status
                risk_msg = (
                    f"Normative sub-reference '{successor}' cited by '{current_node}' "
                    f"has status {status_val}. "
                    f"Active replacement: '{replacement or 'None'}'. "
                    f"Using obsolete specifications compromises engineering integrity."
                )
                alerts.append(
                    DependencyAlert(
                        parent_is=is_number,
                        obsolete_sub_ref=successor,
                        sub_ref_status=(
                            status if isinstance(status, StandardStatus) else StandardStatus(status)
                        ),
                        relationship_type="NORMATIVE_REF",
                        depth=depth + 1,
                        engineering_risk=risk_msg,
                    )
                )

            if successor not in visited:
                visited.add(successor)
                queue.append((successor, depth + 1))

    return alerts


def export_subgraph_for_flow(
    graph: nx.DiGraph,
    root_standards: List[str],
    max_depth: int = 2,
) -> Dict[str, Any]:
    """
    Extract a sub-graph reachable from root_standards for UI visualization.
    Returns a dict with 'nodes' and 'edges'.
    """
    sub_nodes: Dict[str, Dict[str, Any]] = {}
    sub_edges: List[Dict[str, Any]] = []
    visited_edges: Set[tuple[str, str]] = set()

    for root in root_standards:
        if root not in graph:
            continue

        queue: deque[tuple[str, int]] = deque([(root, 0)])
        visited_nodes: Set[str] = {root}

        while queue:
            node_id, depth = queue.popleft()
            node_data = graph.nodes.get(node_id, {})
            status = node_data.get("status", StandardStatus.ACTIVE)
            status_val = status.value if isinstance(status, StandardStatus) else str(status)

            if node_id not in sub_nodes:
                color = "#059669" if status_val == "ACTIVE" else "#DC2626"
                node_entry = {
                    "id": node_id,
                    "label": f"{node_id} ({status_val})",
                    "title": node_data.get("title", ""),
                    "status": status_val,
                    "color": color,
                    "is_root": node_id in root_standards,
                    "data": {
                        "label": f"{node_id} ({status_val})",
                        "title": node_data.get("title", ""),
                        "status": status_val,
                        "color": color,
                    },
                    "position": {"x": 0, "y": 0},
                }
                sub_nodes[node_id] = node_entry

            if depth >= max_depth:
                continue

            for successor in graph.successors(node_id):
                edge_key = (node_id, successor)
                edge_data = graph.get_edge_data(node_id, successor, default={})
                rel = edge_data.get("relationship", "REF")

                if edge_key not in visited_edges:
                    visited_edges.add(edge_key)
                    sub_edges.append({
                        "id": f"e-{node_id}->{successor}",
                        "source": node_id,
                        "target": successor,
                        "relationship": rel,
                        "animated": rel == "SUPERSEDES",
                    })

                if successor not in visited_nodes:
                    visited_nodes.add(successor)
                    queue.append((successor, depth + 1))

    return {
        "nodes": list(sub_nodes.values()),
        "edges": sub_edges,
    }
