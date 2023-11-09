from Interface import Polynomial, Function
from __future__ import annotations

class RationalPoly(Function):
    def __init__(self,oblique:Polynomial ,numerator:Polynomial, denominator:Polynomial):
        self.num_poly = numerator
        self.denom_poly = denominator
        self.obl_poly = oblique
    def __call__(self, x:float)->float:
        denom = self.denom_poly(x)
        if denom == 0: denom = 1e-6
        return self.obl_poly(x) + self.num_poly(x)/denom
    def __repr__(self):
        return f'({self.obl_poly}) + [{self.num_poly}] / [{self.denom_poly}]'
    def __add__(self, f):
        if isinstance(f, (int, float, Polynomial)):
            return RationalPoly(self.obl_poly + f, self.num_poly, self.denom_poly)
    def derivative(self):
        obl = self.obl_poly.derivative()
        num = self.denom_poly * self.num_poly.derivative() - self.num_poly * self.denom_poly.derivative()
        denom = self.denom_poly * self.denom_poly
        return num/denom + obl