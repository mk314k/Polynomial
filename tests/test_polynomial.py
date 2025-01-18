"""
Unit tests for `polynomial` algebra, root-finding methods, and PFP factorization.
"""
import unittest
from polynomial import Polynomial, RationalPoly, parse, unparse


class TestPolynomialLibrary(unittest.TestCase):
    """Test suite verifying polynomial arithmetic, derivatives, root bounds, and PFP."""

    def test_arithmetic_and_division(self) -> None:
        """Verify addition, subtraction, multiplication, and Euclidean division."""
        p = Polynomial([1, -3, 2])  # x^2 - 3x + 2
        q = Polynomial([1, -1])     # x - 1
        self.assertEqual(str(p + q), "x^2 - 2x + 1")
        self.assertEqual(str(p - q), "x^2 - 4x + 3")
        self.assertEqual(str(p * q), "x^3 - 4x^2 + 5x - 2")

        quot, rem = p.divmod(q)
        self.assertEqual(str(quot), "x - 2")
        self.assertEqual(str(rem), "0")

        rat = Polynomial([1, 0, 1]) / Polynomial([1, -1])
        self.assertIsInstance(rat, RationalPoly)
        self.assertAlmostEqual(rat(2.0), 5.0 / 1.0, places=7)

    def test_parser_formats(self) -> None:
        """Verify parsing from algebraic strings, comma lists, and numeric arrays."""
        p_alg = parse("x^3 - 3x^2 + 3")
        p_csv = parse("1, -3, 0, 3")
        p_arr = parse([1, -3, 0, 3])
        self.assertEqual(p_alg, p_csv)
        self.assertEqual(p_csv, p_arr)
        self.assertEqual(unparse(p_alg), "x^3 - 3x^2 + 3")

    def test_newton_secant_bisection_convergence(self) -> None:
        """Verify convergence on the paper's benchmark f(x) = 0.125x^2 - 0.5 (root = 2)."""
        f = parse("0.125x^2 - 0.5")
        self.assertAlmostEqual(f.root_bound(), 4.0, places=6)

        n_seq = f.newton(4.0, iteration=8)
        self.assertAlmostEqual(n_seq[1], 2.5, places=6)
        self.assertAlmostEqual(n_seq[2], 2.05, places=6)
        self.assertAlmostEqual(n_seq[-1], 2.0, places=7)

        s_seq = f.secant(1.0, 4.0, iteration=10)
        self.assertAlmostEqual(s_seq[2], 1.6, places=6)
        self.assertAlmostEqual(s_seq[-1], 2.0, places=7)

        b_seq = f.bisection(1.0, 4.0, iteration=30)
        self.assertAlmostEqual(b_seq[0], 2.5, places=6)
        self.assertAlmostEqual(b_seq[-1], 2.0, places=6)

    def test_pfp_factorization_with_multiplicities(self) -> None:
        """Verify PFP recovers exact roots and multiplicities on multiple-root polynomials."""
        # Paper Section 5 example: f(x) = x^3 + x^2 = x^2(x + 1)
        f1 = parse("x^3 + x^2")
        res1 = f1.factorize()
        self.assertEqual(
            res1["roots"],
            [{"root": -1.0, "multiplicity": 1}, {"root": 0.0, "multiplicity": 2}],
        )
        self.assertEqual(res1["factored"], "(x + 1)x^2")

        # Degree 4 with double root at x = 2: (x + 1)(x - 2)^2(x - 3)
        f2 = (
            Polynomial([1, 1])
            * Polynomial([1, -2])
            * Polynomial([1, -2])
            * Polynomial([1, -3])
        )
        res2 = f2.factorize()
        self.assertEqual(
            res2["roots"],
            [
                {"root": -1.0, "multiplicity": 1},
                {"root": 2.0, "multiplicity": 2},
                {"root": 3.0, "multiplicity": 1},
            ],
        )
        self.assertEqual(res2["factored"], "(x + 1)(x - 2)^2(x - 3)")
        self.assertEqual(f2.root_bound(), 31.0)
        self.assertEqual(f2.cauchy_linf_bound(), 13.0)
        self.assertEqual(f2.fujiwara_bound(), 12.0)
        self.assertEqual(f2.tight_root_bound(), 12.0)


if __name__ == "__main__":
    unittest.main()
