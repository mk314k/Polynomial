"""
Core Polynomial, RationalPoly, and iterative root-finding / factorization algorithms.
Author: mk314k (Kartikesh Mishra)
"""
from __future__ import annotations
import math
from typing import Dict, List, Optional, Sequence, Tuple, Union

Number = Union[int, float]


def _trim_ascending(coeffs: Sequence[Number], tol: float = 1e-12) -> List[float]:
    """Remove trailing near-zero higher-degree coefficients from ascending-order list."""
    out = [float(c) for c in coeffs]
    while len(out) > 1 and abs(out[-1]) <= tol:
        out.pop()
    if not out:
        return [0.0]
    if abs(out[-1]) <= tol:
        return [0.0]
    return out


def _format_num(val: float) -> str:
    """Format a coefficient cleanly (integer if exact, otherwise concise float)."""
    if abs(val - round(val)) < 1e-9:
        return str(int(round(val)))
    return f"{val:.6g}"


class Function:
    """Base callable mathematical function supporting numerical finite differences."""

    def forward(self, x: float) -> float:
        """Evaluate the function at x."""
        return float(x)

    def __call__(self, x: float) -> float:
        return self.forward(x)

    def lderivative(self, x: float, eps: float = 1e-6) -> float:
        """Left-hand finite difference approximation of f'(x)."""
        return (self.forward(x) - self.forward(x - eps)) / eps

    def rderivative(self, x: float, eps: float = 1e-6) -> float:
        """Right-hand finite difference approximation of f'(x)."""
        return (self.forward(x + eps) - self.forward(x)) / eps

    def mderivative(self, x: float, eps: float = 1e-6) -> float:
        """Central finite difference approximation of f'(x)."""
        return (self.forward(x + eps) - self.forward(x - eps)) / (2.0 * eps)


class Polynomial(Function):
    """
    Univariate real polynomial p(x) = sum_{r=0}^n coeff[r] * x^r.

    By default (`reverse_and_copy=True`), `coeff` is passed in descending powers
    [a_n, a_{n-1}, ..., a_0] and stored internally in ascending powers [a_0, ..., a_n].
    """

    def __init__(self, coeff: Sequence[Number], reverse_and_copy: bool = True) -> None:
        raw = list(coeff[::-1]) if reverse_and_copy else list(coeff)
        self.coeff: List[float] = _trim_ascending(raw)
        self.degree: int = len(self.coeff) - 1

    def _refresh_degree(self) -> None:
        self.coeff = _trim_ascending(self.coeff)
        self.degree = len(self.coeff) - 1

    def descending_coeffs(self) -> List[float]:
        """Return coefficients from highest power a_n down to constant term a_0."""
        return list(self.coeff[::-1])

    def __getitem__(self, r: int) -> float:
        if 0 <= r <= self.degree:
            return self.coeff[r]
        return 0.0

    def __setitem__(self, r: int, val: Number) -> None:
        if r < 0:
            raise IndexError("Polynomial power index must be non-negative")
        if r > self.degree:
            self.coeff.extend([0.0] * (r - self.degree))
        self.coeff[r] = float(val)
        self._refresh_degree()

    def __eq__(self, other: object) -> bool:
        if isinstance(other, (int, float)):
            return self.degree == 0 and abs(self.coeff[0] - float(other)) < 1e-9
        if not isinstance(other, Polynomial):
            return False
        if self.degree != other.degree:
            return False
        return all(abs(a - b) < 1e-9 for a, b in zip(self.coeff, other.coeff))

    def __neg__(self) -> Polynomial:
        return Polynomial([-c for c in self.coeff], reverse_and_copy=False)

    def __add__(self, other: Union[Polynomial, Number]) -> Polynomial:
        if isinstance(other, (int, float)):
            coeff = list(self.coeff)
            coeff[0] += float(other)
            return Polynomial(coeff, reverse_and_copy=False)
        if isinstance(other, Polynomial):
            max_deg = max(self.degree, other.degree)
            coeff = [self[i] + other[i] for i in range(max_deg + 1)]
            return Polynomial(coeff, reverse_and_copy=False)
        return NotImplemented

    def __radd__(self, other: Number) -> Polynomial:
        return self.__add__(other)

    def __sub__(self, other: Union[Polynomial, Number]) -> Polynomial:
        if isinstance(other, (int, float)):
            coeff = list(self.coeff)
            coeff[0] -= float(other)
            return Polynomial(coeff, reverse_and_copy=False)
        if isinstance(other, Polynomial):
            max_deg = max(self.degree, other.degree)
            coeff = [self[i] - other[i] for i in range(max_deg + 1)]
            return Polynomial(coeff, reverse_and_copy=False)
        return NotImplemented

    def __rsub__(self, other: Number) -> Polynomial:
        return (-self).__add__(other)

    def __mul__(self, other: Union[Polynomial, Number]) -> Polynomial:
        if isinstance(other, (int, float)):
            coeff = [float(other) * c for c in self.coeff]
            return Polynomial(coeff, reverse_and_copy=False)
        if isinstance(other, Polynomial):
            coeff = [0.0] * (self.degree + other.degree + 1)
            for i in range(self.degree + 1):
                for j in range(other.degree + 1):
                    coeff[i + j] += self[i] * other[j]
            return Polynomial(coeff, reverse_and_copy=False)
        return NotImplemented

    def __rmul__(self, other: Number) -> Polynomial:
        return self.__mul__(other)

class RationalPoly(Function):
    """Rational function R(x) = oblique(x) + numerator(x) / denominator(x)."""

    def __init__(
        self,
        oblique: Polynomial,
        numerator: Polynomial,
        denominator: Polynomial,
    ) -> None:
        self.obl = oblique
        self.num = numerator
        self.denom = denominator

    def forward(self, x: float) -> float:
        denom_val = self.denom(x)
        if abs(denom_val) < 1e-12:
            denom_val = 1e-12 if denom_val >= 0 else -1e-12
        return self.obl(x) + self.num(x) / denom_val

    def __repr__(self) -> str:
        return f"({self.obl}) + [{self.num}] / [{self.denom}]"

    def __add__(self, other: Union[int, float, Polynomial, RationalPoly]) -> RationalPoly:
        if isinstance(other, (int, float, Polynomial)):
            return RationalPoly(self.obl + other, self.num, self.denom)
        if isinstance(other, RationalPoly):
            return RationalPoly(
                self.obl + other.obl,
                self.num * other.denom + self.denom * other.num,
                self.denom * other.denom,
            )
        raise TypeError("Unsupported operand for RationalPoly addition")

    def derivative(self) -> Union[Polynomial, RationalPoly]:
        """Exact quotient-rule derivative of the rational polynomial."""
        obl_d = self.obl.derivative()
        num_d = self.denom * self.num.derivative() - self.num * self.denom.derivative()
        denom_sq = self.denom * self.denom
        quotient_part = num_d / denom_sq
        if isinstance(quotient_part, RationalPoly):
            return quotient_part + obl_d
        return obl_d + quotient_part
