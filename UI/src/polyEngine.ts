export interface RootEntry {
  root: number;
  multiplicity: number;
}

export interface NewtonStep {
  step: number;
  x: number;
  fx: number;
  dfx: number;
  nextX: number;
  error: number;
}

export interface SecantStep {
  step: number;
  xPrev: number;
  xCurr: number;
  fxCurr: number;
  nextX: number;
  error: number;
}

export interface BisectionStep {
  step: number;
  left: number;
  right: number;
  mid: number;
  fMid: number;
  error: number;
}

export interface PfpIntervalAnalysis {
  left: number;
  right: number;
  fLeft: number;
  fRight: number;
  hasSignChange: boolean;
  inflectionsInBracket: number[];
  initialGuess: number | null;
  convergedRoot: number | null;
  iterations: number;
}

export interface PfpResult {
  expression: string;
  derivative1: string;
  derivative2: string;
  degree: number;
  cauchyBound: number;
  linfBound: number;
  fujiwaraBound: number;
  tightBound: number;
  roots: RootEntry[];
  criticalPoints: RootEntry[];
  inflectionPoints: number[];
  intervals: PfpIntervalAnalysis[];
  factored: string;
}

const EPS = 1e-11;

export function trimAscending(coeffs: number[], tol = 1e-11): number[] {
  const out = coeffs.map((c) => (Number.isFinite(c) ? c : 0));
  while (out.length > 1 && Math.abs(out[out.length - 1]) <= tol) {
    out.pop();
  }
  if (out.length === 0 || Math.abs(out[out.length - 1]) <= tol) {
    return [0];
  }
  return out;
}

export function formatNum(val: number, digits = 4): string {
  if (!Number.isFinite(val)) return '0';
  if (Math.abs(val) < 1e-9) return '0';
  if (Math.abs(val - Math.round(val)) < 1e-7) {
    return String(Math.round(val));
  }
  return Number(val.toFixed(digits)).toString();
}

export class PolynomialModel {
  /** Stored in ascending power order: coeff[r] is the coefficient of x^r */
  public readonly coeff: number[];
  public readonly degree: number;

  constructor(coeffs: number[], descending = true) {
    const raw = descending ? [...coeffs].reverse() : [...coeffs];
    this.coeff = trimAscending(raw);
    this.degree = this.coeff.length - 1;
  }

  public static fromAscending(asc: number[]): PolynomialModel {
    return new PolynomialModel(asc, false);
  }

  public eval(x: number): number {
    let acc = 0;
    for (let i = this.coeff.length - 1; i >= 0; i--) {
      acc = acc * x + this.coeff[i];
    }
    return acc;
  }

  public derivative(order = 1): PolynomialModel {
    let cur = PolynomialModel.fromAscending(this.coeff);
    for (let k = 0; k < order; k++) {
      if (cur.degree === 0) {
        return PolynomialModel.fromAscending([0]);
      }
      const nextAsc: number[] = [];
      for (let r = 1; r <= cur.degree; r++) {
        nextAsc.push(r * cur.coeff[r]);
      }
      cur = PolynomialModel.fromAscending(nextAsc);
    }
    return cur;
  }

  /** Cauchy L1 root bound M_p = max(1, sum_{r=0}^{n-1} |a_r / a_n|) */
  public cauchyBound(): number {
    if (this.degree <= 0) return 1;
    const lead = Math.abs(this.coeff[this.degree]);
    if (lead <= EPS) return 1;
    let sum = 0;
    for (let r = 0; r < this.degree; r++) {
      sum += Math.abs(this.coeff[r]) / lead;
    }
    return Math.max(1, sum);
  }

  /** Cauchy L_infinity root bound M_inf = 1 + max_{0 <= r < n} |a_r / a_n| */
  public cauchyLinfBound(): number {
    if (this.degree <= 0) return 1;
    const lead = Math.abs(this.coeff[this.degree]);
    if (lead <= EPS) return 1;
    let maxRatio = 0;
    for (let r = 0; r < this.degree; r++) {
      const ratio = Math.abs(this.coeff[r]) / lead;
      if (ratio > maxRatio) maxRatio = ratio;
    }
    return 1 + maxRatio;
  }

  /** Fujiwara radical bound M_F = 2 * max(|a_{n-k}/a_n|^{1/k}, |a_0/(2a_n)|^{1/n}) */
  public fujiwaraBound(): number {
    const n = this.degree;
    if (n <= 0) return 1;
    const lead = Math.abs(this.coeff[n]);
    if (lead <= EPS) return 1;
    let maxTerm = 0;
    for (let k = 1; k < n; k++) {
      const ratio = Math.abs(this.coeff[n - k]) / lead;
      const term = Math.pow(ratio, 1 / k);
      if (term > maxTerm) maxTerm = term;
    }
    const constTerm = Math.pow(Math.abs(this.coeff[0]) / (2 * lead), 1 / n);
    if (constTerm > maxTerm) maxTerm = constTerm;
    return Math.max(1, 2 * maxTerm);
  }

  /** Optimal composite root bound min(M_p, M_inf, M_F) */
  public tightBound(): number {
    return Math.min(this.cauchyBound(), this.cauchyLinfBound(), this.fujiwaraBound());
  }

  /** Newton rational map Psi_p(x) = x - p(x) / p'(x) */
  public psi(x: number): number | null {
    const d1 = this.derivative(1).eval(x);
    if (Math.abs(d1) < 1e-7) return null;
    return x - this.eval(x) / d1;
  }

  public divmodLinear(root: number): { quotient: PolynomialModel; remainder: number } {
    if (this.degree === 0) {
      return { quotient: PolynomialModel.fromAscending([0]), remainder: this.coeff[0] };
    }
    const n = this.degree;
    const qDesc: number[] = new Array(n).fill(0);
    let carry = this.coeff[n];
    qDesc[0] = carry;
    for (let i = 1; i < n; i++) {
      carry = carry * root + this.coeff[n - i];
      qDesc[i] = carry;
    }
    const rem = carry * root + this.coeff[0];
    return {
      quotient: new PolynomialModel(qDesc, true),
      remainder: rem,
    };
  }

  public toString(): string {
    if (this.degree === 0) {
      return formatNum(this.coeff[0]);
    }
    const parts: string[] = [];
    for (let r = this.degree; r >= 0; r--) {
      const c = this.coeff[r];
      if (Math.abs(c) <= 1e-10) continue;
      const sign = c < 0 ? '-' : '+';
      const absC = Math.abs(c);
      const coeffStr = Math.abs(absC - 1) < 1e-8 && r > 0 ? '' : formatNum(absC);
      const varStr = r === 0 ? '' : r === 1 ? 'x' : `x^${r}`;
      const body = `${coeffStr}${varStr}`;
      if (parts.length === 0) {
        parts.push(sign === '-' ? `-${body}` : body);
      } else {
        parts.push(` ${sign} ${body}`);
      }
    }
    return parts.length > 0 ? parts.join('') : '0';
  }

  /** Algorithm 2: Inflection-Guided Initial Guess inside [c1, c2] */
}
