"""Dual-Tier Audit Cache (In-Memory LRU + SQLite Persistence).

Enables sub-50ms audit replay and persistent state lookup by document ID or SHA-256 digest.
"""

from __future__ import annotations

from collections import OrderedDict
import json
from pathlib import Path
import sqlite3
import threading
import time
from typing import Optional

from maanaksetu.domain.models import AuditResult


class AuditCache:
    """Thread-safe dual-tier audit cache."""

    def __init__(
        self,
        db_path: Optional[str | Path] = None,
        max_memory_entries: int = 128,
    ):
        self.max_memory = max_memory_entries
        self._memory_cache: OrderedDict[str, AuditResult] = OrderedDict()
        self._hash_to_id: Dict[str, str] = {}
        self._lock = threading.Lock()

        # Persistent SQLite backing
        if db_path is None:
            db_path = ":memory:"
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._init_cache_table()

    def _init_cache_table(self) -> None:
        """Create persistent cache table and index."""
        with self.conn:
            self.conn.execute(
                """
                CREATE TABLE IF NOT EXISTS audit_cache (
                    document_id TEXT PRIMARY KEY,
                    sha256_digest TEXT UNIQUE,
                    payload TEXT NOT NULL,
                    created_at REAL NOT NULL
                );
                """
            )
            self.conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_cache_hash ON audit_cache(sha256_digest);"
            )

    def set(self, result: AuditResult) -> None:
        """Store an AuditResult in memory LRU and SQLite backing."""
        with self._lock:
            doc_id = result.document_id
            digest = result.sha256_digest

            # 1. Update memory LRU
            if doc_id in self._memory_cache:
                self._memory_cache.move_to_end(doc_id)
            self._memory_cache[doc_id] = result
            if digest:
                self._hash_to_id[digest] = doc_id

            # Evict LRU entries if capacity exceeded
            if len(self._memory_cache) > self.max_memory:
                evicted_id, evicted_result = self._memory_cache.popitem(last=False)
                if evicted_result.sha256_digest in self._hash_to_id:
                    del self._hash_to_id[evicted_result.sha256_digest]

            # 2. Update persistent SQLite
            try:
                payload = json.dumps(result.model_dump())
                with self.conn:
                    self.conn.execute(
                        """
                        INSERT OR REPLACE INTO audit_cache (document_id, sha256_digest, payload, created_at)
                        VALUES (?, ?, ?, ?);
                        """,
                        (doc_id, digest, payload, time.time()),
                    )
            except Exception:
                pass

    def get_by_id(self, document_id: str) -> Optional[AuditResult]:
        """Lookup AuditResult by document ID (memory first, fallback to SQLite)."""
        with self._lock:
            # Check memory
            if document_id in self._memory_cache:
                self._memory_cache.move_to_end(document_id)
                return self._memory_cache[document_id]

            # Check SQLite
            cursor = self.conn.execute(
                "SELECT payload FROM audit_cache WHERE document_id = ?;", (document_id,)
            )
            row = cursor.fetchone()
            if row:
                result = AuditResult(**json.loads(row["payload"]))
                self._memory_cache[document_id] = result
                if result.sha256_digest:
                    self._hash_to_id[result.sha256_digest] = document_id
                return result

            return None

    def get_by_digest(self, sha256_digest: str) -> Optional[AuditResult]:
        """Lookup AuditResult by SHA-256 state digest."""
        with self._lock:
            # Check hash index mapping
            doc_id = self._hash_to_id.get(sha256_digest)
            if doc_id and doc_id in self._memory_cache:
                self._memory_cache.move_to_end(doc_id)
                return self._memory_cache[doc_id]

            # Check SQLite
            cursor = self.conn.execute(
                "SELECT payload FROM audit_cache WHERE sha256_digest = ?;", (sha256_digest,)
            )
            row = cursor.fetchone()
            if row:
                result = AuditResult(**json.loads(row["payload"]))
                self._memory_cache[result.document_id] = result
                self._hash_to_id[sha256_digest] = result.document_id
                return result

            return None
