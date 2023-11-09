from __future__ import annotations
from Interface import RationalPoly, Function

class Polynomial(Function):
    def __init__(self, coeff:list[float], reverse=True)->None:
        """AI is creating summary for __init__

        Args:
            coeff (list[float]): [description]
            reverse (bool, optional): [description]. Defaults to True.
        """
        self.coeff = coeff[::-1] if reverse else coeff
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
        res = Polynomial(coeff, reverse=False)
        for i in range(len(coeff)):
            res[i] = self[i] + p[i]
        return res

    def __sub__(self, p:Polynomial):
        if isinstance(p, (int, float)):
            res = Polynomial(self.coeff[::-1])
            res[0] -= p
            return res
            
        coeff = [0]*(max(self.degree, p.degree)+1)
        res = Polynomial(coeff, reverse=False)
        for i in range(len(coeff)):
            res[i] = self[i] - p[i]
        return res

    def __mul__(self, p:Polynomial):
        if isinstance(p, (int, float)):
            coeff = [p*c for c in self.coeff]
            res = Polynomial(coeff, reverse=False)
            return res
            
        coeff = [0]*(self.degree + p.degree + 1)
        res = Polynomial(coeff, reverse=False)
        for i in range(self.degree + 1):
            for j in range(p.degree + 1):
                res[i + j] += self[i] * p[j]
        return res

    def __div__(self, p:Polynomial):
        if isinstance(p, (int, float)):
            coeff = [c/p for c in self.coeff]
            res = Polynomial(coeff, reverse=False)
            return res
        res = RationalPoly(Polynomial([0]*max(self.degree - p.degree + 1, 1)), self, p)
        numd = self.degree
        denomd = p.degree
        if self.degree >= p.degree:
            pass

        coeff = [0]*(self.degree + p.degree + 1)
        res = Polynomial(coeff, reverse=False)
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
        coeff = [(r+1)*c for r, c in enumerate(self.coeff[1:])]
        return Polynomial(coeff, reverse=False)

    def __repr__(self):
        return self.__str__()
        # return ' + '.join([f'{c}x^{r}' for r, c in enumerate(self.coeff) if c!= 0])

    def __str__(self):
        if self.degree == 0: return f'{self.coeff[0]}'
        rep = ''
        for r, c in enumerate(self.coeff):
            sign = '+' if c>0 else '-'
            if c!=0:
                c_abs = abs(c)
                c_abs = '' if (c_abs == 1 and r>0) else f'{c_abs}'
                base = f'x^{r}' if r>0 else ''
                if r==self.degree and sign=='+':sign=''
                rep = f' {sign} {c_abs}{base}' + rep
        return rep.lstrip()
    def newton(self, x0, iteration=1):
        x=[x0]
        obj = self.derivative()
        for i in range(iteration):
            deriv = obj(x[i])
            if deriv ==0: deriv = 1e-6
            x.append(x[i] - self(x[i])/deriv)
        return x