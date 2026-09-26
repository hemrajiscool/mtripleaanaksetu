"""TypeSafe AI (Jev Model) System One Adapter.

Enables programmable common sense and calibrated typed decisions:
- Choice: Categorization and selection with probability distributions.
- Noul: Yes/No evaluation with calibrated probabilities.
- Score: Multi-level ordinal evaluations.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple, Union
import httpx

from maanaksetu.adapters.ai.config import TYPESAFE_API_KEY, TYPESAFE_BASE_URL, TYPESAFE_DEFAULT_MODEL
from maanaksetu.domain.states import SegmentCategory

logger = logging.getLogger(__name__)


class TypeSafeClient:
    """Client for TypeSafe's System One decision models (including Jev)."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.api_key = api_key or TYPESAFE_API_KEY
        self.base_url = (base_url or TYPESAFE_BASE_URL).rstrip("/")
        self.default_model = model or TYPESAFE_DEFAULT_MODEL

    @property
    def is_configured(self) -> bool:
        """Check whether a valid API key is present."""
        return bool(self.api_key and len(self.api_key) > 10)

    async def evaluate(
        self,
        state: Union[str, Dict[str, Any], List[Any]],
        questions: Dict[str, Any],
        model: Optional[str] = None,
        timeout: float = 10.0,
    ) -> Dict[str, Any]:
        """
        Evaluate an application state against a dictionary of typed questions via System One.

        Returns the parsed response dictionary containing 'answers', 'model', and 'usage'.
        """
        if not self.is_configured:
            logger.debug("TypeSafe API key not configured; skipping evaluation.")
            return {}

        endpoint = f"{self.base_url}/systemone"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "state": state,
            "model": model or self.default_model,
            "questions": questions,
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(endpoint, headers=headers, json=payload)
                if res.status_code == 200:
                    return res.json()
                logger.warning(
                    f"TypeSafe API error: status {res.status_code}, response: {res.text[:200]}"
                )
                return {}
        except Exception as e:
            logger.warning(f"TypeSafe evaluation request failed: {e}")
            return {}

    def evaluate_sync(
        self,
        state: Union[str, Dict[str, Any], List[Any]],
        questions: Dict[str, Any],
        model: Optional[str] = None,
        timeout: float = 10.0,
    ) -> Dict[str, Any]:
        """Synchronous wrapper for evaluate."""
        if not self.is_configured:
            return {}

        endpoint = f"{self.base_url}/systemone"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "state": state,
            "model": model or self.default_model,
            "questions": questions,
        }

        try:
            with httpx.Client(timeout=timeout) as client:
                res = client.post(endpoint, headers=headers, json=payload)
                if res.status_code == 200:
                    return res.json()
                logger.warning(
                    f"TypeSafe API error: status {res.status_code}, response: {res.text[:200]}"
                )
                return {}
        except Exception as e:
            logger.warning(f"TypeSafe synchronous request failed: {e}")
            return {}

    async def classify_segment(
        self,
        text: str,
        timeout: float = 5.0,
    ) -> Tuple[Optional[SegmentCategory], float]:
        """
        Classify document segment category using Jev AI Choice question.
        Returns (SegmentCategory, confidence).
        """
        if not self.is_configured or not text.strip():
            return None, 0.0

        questions = {
            "category": {
                "type": "choice",
                "instructions": "Classify this procurement/tender document section into exactly one category.",
                "criteria": {
                    "TECHNICAL_SPECIFICATION": "Technical engineering parameters, material grades, standards, tests, dimensions, tolerances",
                    "COMMERCIAL_TERMS": "Pricing, payment milestones, liquidated damages, bank guarantee, delivery timeline",
                    "ELIGIBILITY_CRITERIA": "Bidder qualifications, turnover, past experience, registration certificates",
                    "ADMINISTRATIVE": "Tender submission instructions, notice inviting tender, opening dates, formatting rules",
                },
            }
        }

        res = await self.evaluate(state=text[:1500], questions=questions, timeout=timeout)
        answers = res.get("answers", {})
        cat_ans = answers.get("category", {})

        if cat_ans and cat_ans.get("type") == "choice":
            choice_val = cat_ans.get("choice")
            conf = float(cat_ans.get("confidence", 0.0))
            if choice_val in SegmentCategory.__members__:
                return SegmentCategory[choice_val], conf

        return None, 0.0

    async def check_condition(
        self,
        text: str,
        condition_question: str,
        timeout: float = 5.0,
    ) -> Optional[float]:
        """
        Evaluate a yes/no condition on text using Jev AI Noul question.
        Returns the calibrated probability that the condition is true (0.0 to 1.0).
        """
        if not self.is_configured or not text.strip():
            return None

        questions = {
            "condition": {
                "type": "noul",
                "instructions": condition_question,
            }
        }

        res = await self.evaluate(state=text[:1500], questions=questions, timeout=timeout)
        answers = res.get("answers", {})
        cond_ans = answers.get("condition", {})

        if cond_ans and cond_ans.get("type") == "noul":
            return float(cond_ans.get("noul", 0.0))

        return None
