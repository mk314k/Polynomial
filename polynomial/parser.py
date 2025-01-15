"""
Polynomial parser and serializer supporting coefficient lists and algebraic strings.
"""
from __future__ import annotations
import re
from typing import Sequence, Union
from .polynomial import Polynomial

_TERM_RE = re.compile(r"([+-]?\s*(?:\d+(?:\.\d+)?|\.\d+)?)\s*x(?:\^(\d+))?|([+-]?\s*(?:\d+(?:\.\d+)?|\.\d+))")


def parse(expr: Union[str, Sequence[Union[int, float]], Polynomial]) -> Polynomial:
    """
    Parse a Polynomial from:
    - a `Polynomial` instance
    - a sequence of numeric coefficients `[a_n, ..., a_0]` (descending powers)
    - a comma-separated string `'a_n, ..., a_0'` or legacy `'1,a_0,...,a_n'`
    - an algebraic expression string such as `'x^3 - 3x^2 + 3'` or `'0.125x^2 - 0.5'`
    """
    if isinstance(expr, Polynomial):
        return expr
    if isinstance(expr, (list, tuple)):
        return Polynomial([float(x) for x in expr], reverse_and_copy=True)
    if not isinstance(expr, str):
        raise TypeError(f"Unsupported polynomial input type: {type(expr)!r}")

    text = expr.strip()
    if not text:
        return Polynomial([0.0])

    if "x" in text.lower():
        cleaned = text.lower().replace("**", "^").replace(" ", "")
        coeffs: dict[int, float] = {}
        idx = 0
        while idx < len(cleaned):
            match = _TERM_RE.match(cleaned, idx)
            if not match or match.start() == match.end():
                raise ValueError(f"Invalid polynomial expression near: {cleaned[idx:]!r}")
            coeff_part, exp_part, const_part = match.groups()
            if const_part is not None:
                coeffs[0] = coeffs.get(0, 0.0) + float(const_part)
            else:
                deg = int(exp_part) if exp_part is not None else 1
                if coeff_part in ("", "+"):
                    c_val = 1.0
                elif coeff_part == "-":
                    c_val = -1.0
                else:
                    c_val = float(coeff_part)
                coeffs[deg] = coeffs.get(deg, 0.0) + c_val
            idx = match.end()
        max_deg = max(coeffs.keys(), default=0)
        asc = [coeffs.get(d, 0.0) for d in range(max_deg + 1)]
        return Polynomial(asc, reverse_and_copy=False)

    parts = [p.strip() for p in text.split(",") if p.strip() != ""]
    if not parts:
        return Polynomial([0.0])
    nums = [float(p) for p in parts]
    return Polynomial(nums, reverse_and_copy=True)


def unparse(poly: Polynomial) -> str:
    """Format a Polynomial into its human-readable algebraic string."""
    return str(poly)
