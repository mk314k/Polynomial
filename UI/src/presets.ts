export interface PresetExample {
  id: string;
  label: string;
  tag: string;
  expr: string;
  description: string;
  newtonX0: number;
  secantX0: number;
  secantX1: number;
  bisectL: number;
  bisectR: number;
  targetRoot: number;
}

export const PRESETS: PresetExample[] = [
  {
    id: 'paper-intro',
    label: '0.125x^2 - 0.5',
    tag: 'Paper §1 Benchmark',
    expr: '0.125x^2 - 0.5',
    description:
      'Section 1 benchmark polynomial comparing Newton (4 steps from x₀=4), Secant (6 steps from [1,4]), and Bisection (16 steps on [1,4]) converging to α = 2.',
    newtonX0: 4,
    secantX0: 1,
    secantX1: 4,
    bisectL: 1,
    bisectR: 4,
    targetRoot: 2,
  },
  {
    id: 'pfp-double-root',
    label: 'x^3 + x^2',
    tag: 'Paper §5 PFP Double Root',
    expr: 'x^3 + x^2',
    description:
      "Section 5 worked example: f'(x) = 3x² + 2x has critical points c₁ = -2/3 and c₂ = 0. Since f(0) = 0 and f''(0) ≠ 0, PFP detects α = 0 (multiplicity 2) and isolates simple root α = -1 in (-2, -2/3).",
    newtonX0: -1.5,
    secantX0: -2,
    secantX1: -0.8,
    bisectL: -2,
    bisectR: -0.7,
    targetRoot: -1,
  },
  {
    id: 'inflection-basin',
    label: 'x^3 - 3x^2 + 3',
    tag: 'Paper §3 Inflection Basin',
    expr: 'x^3 - 3x^2 + 3',
    description:
      'Figure 5 polynomial p(x) = (x-2)²(x+1) - 1 with critical points at c = 0, 2 and inflection point at γ = 1. Algorithm 2 uses γ = 1 to pick a guaranteed-convergent initial guess for α ≈ 1.347296.',
    newtonX0: 1,
    secantX0: 0.5,
    secantX1: 1.8,
    bisectL: 0.2,
    bisectR: 1.9,
    targetRoot: 1.34729636,
  },
  {
    id: 'quartic-mult',
    label: 'x^4 - 6x^3 + 9x^2 + 4x - 12',
    tag: 'Quartic (Multiplicity 2)',
    expr: 'x^4 - 6x^3 + 9x^2 + 4x - 12',
    description:
      'Quartic polynomial (x + 1)(x - 2)²(x - 3) with a tangent double root at α = 2 (where classical bisection fails due to no sign change) and simple roots at α = -1, 3.',
    newtonX0: 3.6,
    secantX0: 2.5,
    secantX1: 3.8,
    bisectL: 2.4,
    bisectR: 4.0,
    targetRoot: 3,
  },
  {
    id: 'newton-map',
    label: 'x^4 + x',
    tag: 'Paper Fig. 4 Ψₚ(x)',
    expr: 'x^4 + x',
    description:
      'Figure 4 polynomial p(x) = x⁴ + x with single critical point c₁ = -4^(-1/3) ≈ -0.6300 separating the basins of attraction for roots α₁ = -1 and α₂ = 0.',
    newtonX0: -1.4,
    secantX0: -1.6,
    secantX1: -0.8,
    bisectL: -1.8,
    bisectR: -0.65,
    targetRoot: -1,
  },
];
