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

    def divmod(self, divisor: Union[Polynomial, Number]) -> Tuple[Polynomial, Polynomial]:
        """ Euclidean polynomial division returning (quotient, remainder)."""
        if isinstance(divisor, (int, float)):
            if abs(float(divisor)) < 1e-15:
                raise ZeroDivisionError("Polynomial division by zero scalar")
            return (
                Polynomial([c / float(divisor) for c in self.coeff], reverse_and_copy=False),
                Polynomial([0.0], reverse_and_copy=False),
            )
        if not isinstance(divisor, Polynomial):
            raise TypeError("Divisor must be a Polynomial or scalar")
        if divisor.degree == 0 and abs(divisor.coeff[0]) < 1e-15:
            raise ZeroDivisionError("Polynomial division by zero polynomial")

        rem = list(self.coeff)
        div_deg = divisor.degree
        div_lead = divisor.coeff[-1]
        if len(rem) - 1 < div_deg:
            return Polynomial([0.0], reverse_and_copy=False), Polynomial(rem, reverse_and_copy=False)

        quot = [0.0] * (len(rem) - div_deg)
        for deg_idx in range(len(rem) - 1, div_deg - 1, -1):
            factor = rem[deg_idx] / div_lead
            q_idx = deg_idx - div_deg
            quot[q_idx] = factor
            for j in range(div_deg + 1):
                rem[q_idx + j] -= factor * divisor.coeff[j]

        return (
            Polynomial(quot, reverse_and_copy=False),
            Polynomial(rem[:div_deg] if div_deg > 0 else [0.0], reverse_and_copy=False),
        )

    def __floordiv__(self, other: Union[Polynomial, Number]) -> Polynomial:
        quot, _ = self.divmod(other)
        return quot

    def __mod__(self, other: Union[Polynomial, Number]) -> Polynomial:
        _, rem = self.divmod(other)
        return rem

    def __truediv__(self, other: Union[Polynomial, Number]) -> Union[Polynomial, RationalPoly]:
        if isinstance(other, (int, float)):
            if abs(float(other)) < 1e-15:
                raise ZeroDivisionError("Division by zero")
            return Polynomial([c / float(other) for c in self.coeff], reverse_and_copy=False)
        if isinstance(other, Polynomial):
            quot, rem = self.divmod(other)
            if rem.degree == 0 and abs(rem.coeff[0]) < 1e-11:
                return quot
            return RationalPoly(quot, rem, other)
        return NotImplemented

    def __div__(self, other: Union[Polynomial, Number]) -> Union[Polynomial, RationalPoly]:
        return self.__truediv__(other)

    def forward(self, x: float) -> float:
        """Evaluate polynomial at x using Horner's method."""
        ans = 0.0
        for c in reversed(self.coeff):
            ans = ans * float(x) + c
        return ans

    def derivative(self, order: int = 1) -> Polynomial:
        """Compute exact analytical derivative of given order."""
        if order < 0:
            raise ValueError("Derivative order must be non-negative")
        poly = self
        for _ in range(order):
            if poly.degree == 0:
                return Polynomial([0.0], reverse_and_copy=False)
            next_coeff = [(r + 1) * c for r, c in enumerate(poly.coeff[1:])]
            poly = Polynomial(next_coeff, reverse_and_copy=False)
        return poly

    def root_bound(self) -> float:
        """
        Cauchy L1 Bound M_p on root magnitudes (Proposition 2.1):
        M_p = max(1, sum_{r=0}^{n-1} |a_r / a_n|).
        """
        if self.degree <= 0:
            return 1.0
        lead = abs(self.coeff[-1])
        if lead < 1e-15:
            return 1.0
        coeff_sum = sum(abs(c) / lead for c in self.coeff[:-1])
        return max(1.0, coeff_sum)

    def cauchy_linf_bound(self) -> float:
        """
        Cauchy L_infinity Bound M_inf on root magnitudes (Proposition 6.1):
        M_inf = 1 + max_{0 <= r <= n-1} |a_r / a_n|.
        """
        if self.degree <= 0:
            return 1.0
        lead = abs(self.coeff[-1])
        if lead < 1e-15:
            return 1.0
        max_ratio = max(abs(c) / lead for c in self.coeff[:-1])
        return 1.0 + max_ratio

    def fujiwara_bound(self) -> float:
        """
        Fujiwara Radical Bound M_F on root magnitudes (Proposition 6.1):
        M_F = 2 * max(|a_{n-1}/a_n|, |a_{n-2}/a_n|^{1/2}, ..., |a_0/(2*a_n)|^{1/n}).
        """
        n = self.degree
        if n <= 0:
            return 1.0
        lead = abs(self.coeff[-1])
        if lead < 1e-15:
            return 1.0
        terms: List[float] = []
        for k in range(1, n):
            ratio = abs(self.coeff[n - k]) / lead
            terms.append(ratio ** (1.0 / k))
        const_ratio = abs(self.coeff[0]) / (2.0 * lead)
        terms.append(const_ratio ** (1.0 / n))
        return max(1.0, 2.0 * max(terms))

    def tight_root_bound(self) -> float:
        """
        Optimal composite root bound min(M_p, M_inf, M_F) (Proposition 6.1).
        """
        return min(self.root_bound(), self.cauchy_linf_bound(), self.fujiwara_bound())

    def __repr__(self) -> str:
        return self.__str__()

    def __str__(self) -> str:
        if self.degree == 0:
            return _format_num(self.coeff[0])
        terms: List[str] = []
        for r in range(self.degree, -1, -1):
            c = self.coeff[r]
            if abs(c) <= 1e-12:
                continue
            sign = "-" if c < 0 else "+"
            c_abs = abs(c)
            coeff_str = "" if (abs(c_abs - 1.0) < 1e-9 and r > 0) else _format_num(c_abs)
            if r == 0:
                var_str = ""
            elif r == 1:
                var_str = "x"
            else:
                var_str = f"x^{r}"
            term_body = f"{coeff_str}{var_str}"
            if not terms:
                terms.append(f"-{term_body}" if sign == "-" else term_body)
            else:
                terms.append(f" {sign} {term_body}")
        return "".join(terms) if terms else "0"

    def newton(
        self,
        x0: float,
        iteration: int = 24,
        tol: float = 1e-10,
    ) -> List[float]:
        """Run Newton's method starting at x0 and return the sequence of iterates."""
        x_seq: List[float] = [float(x0)]
        deriv_poly = self.derivative()
        for _ in range(iteration):
            cur = x_seq[-1]
            f_val = self(cur)
            if abs(f_val) <= tol:
                break
            d_val = deriv_poly(cur)
            if abs(d_val) < 1e-12:
                d_val = 1e-12 if d_val >= 0 else -1e-12
            nxt = cur - f_val / d_val
            x_seq.append(nxt)
            if abs(nxt - cur) <= tol and abs(self(nxt)) <= tol:
                break
        return x_seq

    def secant(
        self,
        x0: float,
        x1: float,
        iteration: int = 32,
        tol: float = 1e-10,
    ) -> List[float]:
        """Run the Secant method starting from (x0, x1) and return the sequence of iterates."""
        x_seq: List[float] = [float(x0), float(x1)]
        for _ in range(iteration):
            prev, cur = x_seq[-2], x_seq[-1]
            f_cur = self(cur)
            if abs(f_cur) <= tol:
                break
            f_prev = self(prev)
            diff = f_cur - f_prev
            if abs(diff) < 1e-12:
                cur_shifted = cur + 1e-6
                f_cur = self(cur_shifted)
                diff = f_cur - f_prev
                if abs(diff) < 1e-12:
                    break
            nxt = cur - f_cur * (cur - prev) / diff
            x_seq.append(nxt)
            if abs(nxt - cur) <= tol and abs(self(nxt)) <= tol:
                break
        return x_seq

    def bisection(
        self,
        left: float,
        right: float,
        iteration: int = 64,
        tol: float = 1e-10,
    ) -> List[float]:
        """Run the Bisection method on [left, right] and return midpoint iterates."""
        a, b = float(left), float(right)
        if a > b:
            a, b = b, a
        fa, fb = self(a), self(b)
        if abs(fa) <= tol:
            return [a]
        if abs(fb) <= tol:
            return [b]
        midpoints: List[float] = []
        for _ in range(iteration):
            mid = 0.5 * (a + b)
            midpoints.append(mid)
            fm = self(mid)
            if abs(fm) <= tol or 0.5 * (b - a) <= tol:
                break
            if (fa < 0.0 < fm) or (fa > 0.0 > fm):
                b, fb = mid, fm
            else:
                a, fa = mid, fm
        return midpoints

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
