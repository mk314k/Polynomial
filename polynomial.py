"""
This is the main Polynomial and related function file.
Author:mk314k
"""
from __future__ import annotations

class Function:
    """_summary_
    """

class Polynomial(Function):
    """_summary_

    Args:
        Function (_type_): _description_
    """
    def __init__(self, coeff:list[float], reverse_and_copy=True)->None:
        self.coeff = coeff[::-1] if reverse_and_copy else coeff
        self.degree = len(coeff) -1
    def __getitem__(self, r):
        if 0<=r<= self.degree:
            return self.coeff[r]
        else:
            return 0
    def __setitem__(self, r, r_c):
        if 0<=r<= self.degree:
            self.coeff[r] = r_c
        else:
            pass

    def __add__(self, p:Polynomial)->Polynomial:
        if isinstance(p, (int, float)):
            res = Polynomial(self.coeff[::-1])
            res[0] += p
            return res

        coeff = [0]*(max(self.degree, p.degree)+1)
        res = Polynomial(coeff, reverse_and_copy=False)
        for i in range(len(coeff)):
            res[i] = self[i] + p[i]
        return res

    def __sub__(self, p:Polynomial):
        if isinstance(p, (int, float)):
            res = Polynomial(self.coeff[::-1])
            res[0] -= p
            return res
        coeff = [0]*(max(self.degree, p.degree)+1)
        res = Polynomial(coeff, reverse_and_copy=False)
        for i in range(len(coeff)):
            res[i] = self[i] - p[i]
        return res

    def __mul__(self, p:Polynomial):
        if isinstance(p, (int, float)):
            coeff = [p*c for c in self.coeff]
            res = Polynomial(coeff, reverse_and_copy=False)
            return res
        coeff = [0]*(self.degree + p.degree + 1)
        res = Polynomial(coeff, reverse_and_copy=False)
        for i in range(self.degree + 1):
            for j in range(p.degree + 1):
                res[i + j] += self[i] * p[j]
        return res

    def __div__(self, p:Polynomial):
        if isinstance(p, (int, float)):
            coeff = [c/p for c in self.coeff]
            res = Polynomial(coeff, reverse_and_copy=False)
            return res
        res = RationalPoly(Polynomial([0]*max(self.degree - p.degree + 1, 1)), self, p)
        coeff = [0]*(self.degree + p.degree + 1)
        res = Polynomial(coeff, reverse_and_copy=False)
        for i in range(self.degree + 1):
            for j in range(p.degree + 1):
                res[i + j] += self[i] * p[j]
        return res


    def __call__(self, x:float)->float:
        ans = 0
        xp=1
        for c in self.coeff:
            ans = ans + c*xp
            xp = xp * x
        return ans

    def derivative(self):
        """_summary_

        Returns:
            _type_: _description_
        """
        coeff = [(r+1)*c for r, c in enumerate(self.coeff[1:])]
        return Polynomial(coeff, reverse_and_copy=False)

    def __repr__(self):
        return self.__str__()
        # return ' + '.join([f'{c}x^{r}' for r, c in enumerate(self.coeff) if c!= 0])

    def __str__(self):
        if self.degree == 0:
            return f'{self.coeff[0]}'
        rep = ''
        for r, c in enumerate(self.coeff):
            sign = '+' if c>0 else '-'
            if c!=0:
                c_abs = abs(c)
                c_abs = '' if (c_abs == 1 and r>0) else f'{c_abs}'
                base = f'x^{r}' if r>0 else ''
                if r==self.degree and sign=='+':
                    sign=''
                rep = f' {sign} {c_abs}{base}' + rep
        return rep.lstrip()

    def newton(self, x0, iteration=1):
        """_summary_

        Args:
            x0 (_type_): _description_
            iteration (int, optional): _description_. Defaults to 1.

        Returns:
            _type_: _description_
        """
        x=[x0]
        obj = self.derivative()
        for i in range(iteration):
            deriv = obj(x[i])
            if deriv ==0:
                deriv = 1e-6
            x.append(x[i] - self(x[i])/deriv)
        return x

class RationalPoly(Function):
    """_summary_

    Args:
        Function (_type_): _description_
    """
    def __init__(self,oblique:Polynomial ,numerator:Polynomial, denominator:Polynomial):
        self.num = numerator
        self.denom = denominator
        self.obl = oblique
    def __call__(self, x:float)->float:
        denom =self.denom(x)
        if denom == 0:
            denom = 1e-6
        return self.obl(x) + self.num(x)/denom
    def __repr__(self):
        return f'({self.obl}) + [{self.num}] / [{self.denom}]'
    def __add__(self, f):
        if isinstance(f, (int, float, Polynomial)):
            return RationalPoly(self.obl + f, self.num, self.denom)
        elif isinstance(f, RationalPoly):
            return RationalPoly(
                self.obl+f.obl,
                self.num * f.denom + self.denom * f.num,
                self.denom * f.denom)
    def derivative(self):
        """_summary_

        Returns:
            _type_: _description_
        """
        obl = self.obl.derivative()
        num = self.denom * self.num.derivative() - self.num * self.denom.derivative()
        denom = self.denom * self.denom
        return num/denom + obl
