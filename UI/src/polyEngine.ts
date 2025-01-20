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
  public newtonInitGuess(c1: number, c2: number, inflections: number[] = []): number {
    const a = Math.min(c1, c2);
    const b = Math.max(c1, c2);
    const d1 = this.derivative(1);
    const d2 = this.derivative(2);
    const inside = inflections
      .filter((g) => g > a + 1e-8 && g < b - 1e-8)
      .sort((x, y) => x - y);
    const pts = [a, ...inside, b];
    const slopeSign = d1.eval(0.5 * (a + b)) >= 0 ? 1 : -1;

    for (let i = 0; i < pts.length - 1; i++) {
      const left = pts[i];
      const right = pts[i + 1];
      if (this.eval(left) * this.eval(right) <= 0) {
        const concSign = d2.eval(0.5 * (left + right)) >= 0 ? 1 : -1;
        const chosen = concSign === slopeSign ? right : left;
        // Proposition 6.2: Inflection-Point Tangent Landing when chosen endpoint is a critical point
        if (Math.abs(d1.eval(chosen)) < 1e-9) {
          const other = chosen === right ? left : right;
          const d1Other = d1.eval(other);
          if (Math.abs(d1Other) > 1e-9) {
            const landed = other - this.eval(other) / d1Other;
            if (landed > left && landed < right) {
              return landed;
            }
          }
          const span = right - left;
          return chosen === right ? right - 0.05 * span : left + 0.05 * span;
        }
        return chosen;
      }
    }
    return 0.5 * (a + b);
  }

  public runNewton(x0: number, trueRoot?: number, maxSteps = 16, tol = 1e-9): NewtonStep[] {
    const d1 = this.derivative(1);
    const steps: NewtonStep[] = [];
    let cur = x0;
    for (let s = 0; s < maxSteps; s++) {
      const fx = this.eval(cur);
      const dfx = d1.eval(cur);
      const safeDfx = Math.abs(dfx) < 1e-12 ? (dfx >= 0 ? 1e-12 : -1e-12) : dfx;
      const nextX = cur - fx / safeDfx;
      const target = trueRoot ?? nextX;
      steps.push({
        step: s,
        x: cur,
        fx,
        dfx,
        nextX,
        error: Math.abs(cur - target),
      });
      if (Math.abs(fx) <= tol || Math.abs(nextX - cur) <= tol) {
        break;
      }
      cur = nextX;
    }
    if (trueRoot === undefined && steps.length > 0) {
      const finalEst = steps[steps.length - 1].nextX;
      for (const st of steps) {
        st.error = Math.abs(st.x - finalEst);
      }
    }
    return steps;
  }

  public runSecant(
    x0: number,
    x1: number,
    trueRoot?: number,
    maxSteps = 18,
    tol = 1e-9,
  ): SecantStep[] {
    const steps: SecantStep[] = [];
    let prev = x0;
    let cur = x1;
    for (let s = 0; s < maxSteps; s++) {
      const fPrev = this.eval(prev);
      let fCur = this.eval(cur);
      let diff = fCur - fPrev;
      if (Math.abs(diff) < 1e-12) {
        cur += 1e-5;
        fCur = this.eval(cur);
        diff = fCur - fPrev;
        if (Math.abs(diff) < 1e-12) break;
      }
      const nextX = cur - (fCur * (cur - prev)) / diff;
      const target = trueRoot ?? nextX;
      steps.push({
        step: s,
        xPrev: prev,
        xCurr: cur,
        fxCurr: fCur,
        nextX,
        error: Math.abs(cur - target),
      });
      if (Math.abs(fCur) <= tol || Math.abs(nextX - cur) <= tol) {
        break;
      }
      prev = cur;
      cur = nextX;
    }
    if (trueRoot === undefined && steps.length > 0) {
      const finalEst = steps[steps.length - 1].nextX;
      for (const st of steps) {
        st.error = Math.abs(st.xCurr - finalEst);
      }
    }
    return steps;
  }

  public runBisection(
    left: number,
    right: number,
    trueRoot?: number,
    maxSteps = 22,
    tol = 1e-7,
  ): BisectionStep[] {
    let a = Math.min(left, right);
    let b = Math.max(left, right);
    let fa = this.eval(a);
    const steps: BisectionStep[] = [];
    for (let s = 0; s < maxSteps; s++) {
      const mid = 0.5 * (a + b);
      const fMid = this.eval(mid);
      const target = trueRoot ?? mid;
      steps.push({
        step: s,
        left: a,
        right: b,
        mid,
        fMid,
        error: Math.abs(mid - target),
      });
      if (Math.abs(fMid) <= tol || 0.5 * (b - a) <= tol) {
        break;
      }
      if ((fa < 0 && fMid > 0) || (fa > 0 && fMid < 0)) {
        b = mid;
      } else {
        a = mid;
        fa = fMid;
      }
    }
    if (trueRoot === undefined && steps.length > 0) {
      const finalEst = steps[steps.length - 1].mid;
      for (const st of steps) {
        st.error = Math.abs(st.mid - finalEst);
      }
    }
    return steps;
  }

  /** Safeguarded Inflection-Guided Newton-Bisection solver */
  public solveBracket(
    left: number,
    right: number,
    inflections: number[] = [],
    tol = 1e-11,
  ): { root: number; initialGuess: number; iterations: number } {
    let a = Math.min(left, right);
    let b = Math.max(left, right);
    let fa = this.eval(a);
    let fb = this.eval(b);
    if (Math.abs(fa) <= tol) return { root: a, initialGuess: a, iterations: 0 };
    if (Math.abs(fb) <= tol) return { root: b, initialGuess: b, iterations: 0 };

    const initGuess = this.newtonInitGuess(a, b, inflections);
    let cur = initGuess > a && initGuess < b ? initGuess : 0.5 * (a + b);
    const d1 = this.derivative(1);
    let iters = 0;

    for (let i = 0; i < 48; i++) {
      iters = i + 1;
      const fx = this.eval(cur);
      if (Math.abs(fx) <= tol || 0.5 * (b - a) <= tol) break;

      if ((fa < 0 && fx > 0) || (fa > 0 && fx < 0)) {
        b = cur;
        fb = fx;
      } else if ((fb < 0 && fx > 0) || (fb > 0 && fx < 0)) {
        a = cur;
        fa = fx;
      }

      const dfx = d1.eval(cur);
      const cand = Math.abs(dfx) > 1e-12 ? cur - fx / dfx : 0.5 * (a + b);
      const next = cand > a && cand < b ? cand : 0.5 * (a + b);
      if (Math.abs(next - cur) <= tol && Math.abs(this.eval(next)) <= tol) {
        cur = next;
        break;
      }
      cur = next;
    }

    if (Math.abs(cur - Math.round(cur)) < 1e-6 && Math.abs(this.eval(Math.round(cur))) < 1e-9) {
      cur = Math.round(cur);
    } else if (Math.abs(cur) < 1e-10) {
      cur = 0;
    }
    return { root: cur, initialGuess: initGuess, iterations: iters };
  }

  private solveLevelWithDp(
    critEntries: RootEntry[],
    inflRoots: number[],
    tol = 1e-6,
  ): RootEntry[] {
    if (this.degree <= 0) return [];
    if (this.degree === 1) {
      const r = -this.coeff[0] / this.coeff[1];
      return [{ root: Math.abs(r) < 1e-11 ? 0 : r, multiplicity: 1 }];
    }
    if (this.degree === 2) {
      const c0 = this.coeff[0];
      const c1 = this.coeff[1];
      const c2 = this.coeff[2];
      const disc = c1 * c1 - 4 * c2 * c0;
      if (Math.abs(disc) <= 1e-9) {
        const r = -c1 / (2 * c2);
        return [{ root: Math.abs(r) < 1e-11 ? 0 : r, multiplicity: 2 }];
      }
      if (disc < 0) return [];
      const sq = Math.sqrt(disc);
      const r1 = (-c1 - sq) / (2 * c2);
      const r2 = (-c1 + sq) / (2 * c2);
      const lo = Math.min(r1, r2);
      const hi = Math.max(r1, r2);
      return [
        { root: Math.abs(lo) < 1e-11 ? 0 : lo, multiplicity: 1 },
        { root: Math.abs(hi) < 1e-11 ? 0 : hi, multiplicity: 1 },
      ];
    }

    const found: RootEntry[] = [];
    const critValues: number[] = [];

    for (const c of critEntries) {
      critValues.push(c.root);
      const scale = Math.pow(Math.max(1, Math.abs(c.root)), this.degree);
      if (Math.abs(this.eval(c.root)) <= tol * scale) {
        found.push({
          root: Math.abs(c.root) < 1e-10 ? 0 : c.root,
          multiplicity: c.multiplicity + 1,
        });
      }
    }

    let bound = this.tightBound() + 1;
    if (critValues.length > 0) {
      const maxCrit = Math.max(...critValues.map((v) => Math.abs(v)));
      bound = Math.max(bound, maxCrit + 2);
    }

    const partition = [-bound, ...critValues, bound];
    const multRoots = found.map((f) => f.root);

    for (let i = 0; i < partition.length - 1; i++) {
      const leftB = partition[i];
      const rightB = partition[i + 1];
      const span = rightB - leftB;
      if (span <= 1e-8) continue;

      const shift = Math.min(1e-5, 0.04 * span);
      const a = leftB + (multRoots.some((mr) => Math.abs(leftB - mr) <= 1e-4) ? shift : 0);
      const b = rightB - (multRoots.some((mr) => Math.abs(rightB - mr) <= 1e-4) ? shift : 0);
      if (a >= b) continue;

      const fa = this.eval(a);
      const fb = this.eval(b);
      if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) {
        const subInfl = inflRoots.filter((g) => g > a && g < b);
        const solved = this.solveBracket(a, b, subInfl);
        if (!found.some((e) => Math.abs(e.root - solved.root) <= 1e-4)) {
          found.push({ root: solved.root, multiplicity: 1 });
        }
      }
    }

    found.sort((x, y) => x.root - y.root);
    const merged: RootEntry[] = [];
    for (const item of found) {
      const last = merged[merged.length - 1];
      if (last && Math.abs(last.root - item.root) <= 1e-4) {
        last.root = 0.5 * (last.root + item.root);
        last.multiplicity = Math.max(last.multiplicity, item.multiplicity);
      } else {
        merged.push({ ...item });
      }
    }
    return merged;
  }

  /** Algorithm 3 & 5: Bottom-Up Dynamic Programming PFP (O(n^2) Root Isolation) */
  public pfpRoots(tol = 1e-6): RootEntry[] {
    if (this.degree <= 0) return [];
    if (this.degree <= 2) return this.solveLevelWithDp([], [], tol);

    const tower: PolynomialModel[] = [PolynomialModel.fromAscending(this.coeff)];
    while (tower[tower.length - 1].degree > 1) {
      tower.push(tower[tower.length - 1].derivative(1));
    }

    let rootsNext = tower[tower.length - 1].solveLevelWithDp([], [], tol);
    let rootsNext2: RootEntry[] = [];

    for (let k = tower.length - 2; k >= 0; k--) {
      const inflList = rootsNext2.map((e) => e.root);
      const currRoots = tower[k].solveLevelWithDp(rootsNext, inflList, tol);
      rootsNext2 = rootsNext;
      rootsNext = currRoots;
    }

    return rootsNext;
  }

  public factorize(): PfpResult {
    const roots = this.pfpRoots();
    const d1 = this.derivative(1);
    const d2 = this.derivative(2);
    const critEntries = this.degree >= 2 ? d1.pfpRoots() : [];
    const inflPoints = this.degree >= 3 ? d2.pfpRoots().map((e) => e.root) : [];
    const cauchy = this.cauchyBound();
    const linf = this.cauchyLinfBound();
    const fujiwara = this.fujiwaraBound();
    const tight = this.tightBound();

    const bound = Math.max(
      tight + 1,
      critEntries.length > 0 ? Math.max(...critEntries.map((c) => Math.abs(c.root))) + 2 : 2,
    );
    const partition = [-bound, ...critEntries.map((c) => c.root), bound];
    const multRoots = roots.filter((r) => r.multiplicity > 1).map((r) => r.root);

    const intervals: PfpIntervalAnalysis[] = [];
    for (let i = 0; i < partition.length - 1; i++) {
      const l = partition[i];
      const r = partition[i + 1];
      const span = r - l;
      const shift = Math.min(1e-5, 0.04 * span);
      const a = l + (multRoots.some((mr) => Math.abs(l - mr) <= 1e-4) ? shift : 0);
      const b = r - (multRoots.some((mr) => Math.abs(r - mr) <= 1e-4) ? shift : 0);
      const fa = this.eval(a);
      const fb = this.eval(b);
      const signChange = (fa < 0 && fb > 0) || (fa > 0 && fb < 0);
      const subInfl = inflPoints.filter((g) => g > a && g < b);

      if (signChange && a < b) {
        const solved = this.solveBracket(a, b, subInfl);
        intervals.push({
          left: l,
          right: r,
          fLeft: this.eval(l),
          fRight: this.eval(r),
          hasSignChange: true,
          inflectionsInBracket: subInfl,
          initialGuess: solved.initialGuess,
          convergedRoot: solved.root,
          iterations: solved.iterations,
        });
      } else {
        intervals.push({
          left: l,
          right: r,
          fLeft: this.eval(l),
          fRight: this.eval(r),
          hasSignChange: false,
          inflectionsInBracket: subInfl,
          initialGuess: null,
          convergedRoot: null,
          iterations: 0,
        });
      }
    }

    const lead = this.coeff[this.degree];
    const factors: string[] = [];
    if (Math.abs(lead - 1) > 1e-8) {
      factors.push(Math.abs(lead + 1) < 1e-8 ? '-' : formatNum(lead));
    }

    let deflated = PolynomialModel.fromAscending(this.coeff);
    for (const rEntry of roots) {
      for (let m = 0; m < rEntry.multiplicity; m++) {
        deflated = deflated.divmodLinear(rEntry.root).quotient;
      }
      let base = '';
      if (Math.abs(rEntry.root) < 1e-8) {
        base = 'x';
      } else if (rEntry.root > 0) {
        base = `(x - ${formatNum(rEntry.root)})`;
      } else {
        base = `(x + ${formatNum(Math.abs(rEntry.root))})`;
      }
      factors.push(rEntry.multiplicity > 1 ? `${base}^${rEntry.multiplicity}` : base);
    }

    if (deflated.degree > 0) {
      const leadDef = deflated.coeff[deflated.degree];
      const monicAsc = deflated.coeff.map((c) => c / leadDef);
      const monic = PolynomialModel.fromAscending(monicAsc);
      factors.push(`(${monic.toString()})`);
    }

    return {
      expression: this.toString(),
      derivative1: d1.toString(),
      derivative2: d2.toString(),
      degree: this.degree,
      cauchyBound: cauchy,
      linfBound: linf,
      fujiwaraBound: fujiwara,
      tightBound: tight,
      roots,
      criticalPoints: critEntries,
      inflectionPoints: inflPoints,
      intervals,
      factored: factors.length > 0 ? factors.join('') : this.toString(),
    };
  }
}

export function parsePolynomialInput(input: string): PolynomialModel {
  const trimmed = input.trim();
  if (!trimmed) {
    return new PolynomialModel([1, 0, -4]);
  }
  if (!trimmed.toLowerCase().includes('x')) {
    const nums = trimmed
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
    return new PolynomialModel(nums.length > 0 ? nums : [0], true);
  }

  const cleaned = trimmed.toLowerCase().replace(/\*\*/g, '^').replace(/\s+/g, '');
  const termRegex = /([+-]?(?:\d+(?:\.\d+)?|\.\d+)?)x(?:\^(\d+))?|([+-]?(?:\d+(?:\.\d+)?|\.\d+))/g;
  const map = new Map<number, number>();
  let match: RegExpExecArray | null;
  let matchedAny = false;

  while ((match = termRegex.exec(cleaned)) !== null) {
    if (match[0].length === 0) {
      termRegex.lastIndex += 1;
      continue;
    }
    matchedAny = true;
    const [, coeffPart, expPart, constPart] = match;
    if (constPart !== undefined) {
      const val = Number(constPart);
      if (Number.isFinite(val)) {
        map.set(0, (map.get(0) ?? 0) + val);
      }
    } else {
      const deg = expPart !== undefined ? parseInt(expPart, 10) : 1;
      let cVal = 1;
      if (coeffPart === '' || coeffPart === '+') cVal = 1;
      else if (coeffPart === '-') cVal = -1;
      else cVal = Number(coeffPart);
      if (Number.isFinite(cVal)) {
        map.set(deg, (map.get(deg) ?? 0) + cVal);
      }
    }
  }

  if (!matchedAny || map.size === 0) {
    return new PolynomialModel([1, 0, -4]);
  }
  const maxDeg = Math.max(...Array.from(map.keys()));
  const asc: number[] = [];
  for (let d = 0; d <= maxDeg; d++) {
    asc.push(map.get(d) ?? 0);
  }
  return PolynomialModel.fromAscending(asc);
}
