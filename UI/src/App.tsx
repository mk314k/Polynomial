import { useMemo, useState } from 'react';
import './App.css';
import {
  formatNum,
  parsePolynomialInput,
} from './polyEngine';
import { PRESETS, PresetExample } from './presets';
import { PreliminariesPage } from './PreliminariesPage';
import { ResearchManuscriptSection } from './ResearchManuscript';

type ActiveMethod = 'pfp' | 'newton' | 'secant' | 'bisection';
type TopPage = 'paper-and-lab' | 'preliminaries';

function App() {
  const [topPage, setTopPage] = useState<TopPage>('paper-and-lab');
  const [exprInput, setExprInput] = useState<string>(PRESETS[1].expr);
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[1].id);
  const [activeMethod, setActiveMethod] = useState<ActiveMethod>('pfp');
  const [showD1, setShowD1] = useState<boolean>(true);
  const [showD2, setShowD2] = useState<boolean>(true);
  const [showPsi, setShowPsi] = useState<boolean>(false);

  const [newtonX0, setNewtonX0] = useState<number>(-1.5);
  const [secantX0, setSecantX0] = useState<number>(-2.0);
  const [secantX1, setSecantX1] = useState<number>(-0.8);
  const [bisectL, setBisectL] = useState<number>(-2.0);
  const [bisectR, setBisectR] = useState<number>(-0.7);

  const poly = useMemo(() => parsePolynomialInput(exprInput), [exprInput]);
  const pfp = useMemo(() => poly.factorize(), [poly]);

  const nearestTrueRoot = useMemo(() => {
    if (pfp.roots.length === 0) return undefined;
    let best = pfp.roots[0].root;
    let bestDist = Math.abs(best - newtonX0);
    for (const r of pfp.roots) {
      const d = Math.abs(r.root - newtonX0);
      if (d < bestDist) {
        bestDist = d;
        best = r.root;
      }
    }
    return best;
  }, [pfp.roots, newtonX0]);

  const newtonSteps = useMemo(
    () => poly.runNewton(newtonX0, nearestTrueRoot),
    [poly, newtonX0, nearestTrueRoot],
  );
  const secantSteps = useMemo(
    () => poly.runSecant(secantX0, secantX1, nearestTrueRoot),
    [poly, secantX0, secantX1, nearestTrueRoot],
  );
  const bisectionSteps = useMemo(
    () => poly.runBisection(bisectL, bisectR, nearestTrueRoot),
    [poly, bisectL, bisectR, nearestTrueRoot],
  );

  const selectPreset = (preset: PresetExample) => {
    setActivePresetId(preset.id);
    setExprInput(preset.expr);
    setNewtonX0(preset.newtonX0);
    setSecantX0(preset.secantX0);
    setSecantX1(preset.secantX1);
    setBisectL(preset.bisectL);
    setBisectR(preset.bisectR);
  };

  // Compute plot viewport bounds based on roots & critical points
  const plotGeometry = useMemo(() => {
    const W = 740;
    const H = 400;
    const padL = 54;
    const padR = 26;
    const padT = 26;
    const padB = 38;
    const pw = W - padL - padR;
    const ph = H - padT - padB;

    const keyXs: number[] = [
      ...pfp.roots.map((r) => r.root),
      ...pfp.criticalPoints.map((c) => c.root),
      ...pfp.inflectionPoints,
      newtonX0,
    ];
    let xMin = keyXs.length > 0 ? Math.min(...keyXs) - 1.4 : -3;
    let xMax = keyXs.length > 0 ? Math.max(...keyXs) + 1.4 : 3;
    if (xMax - xMin < 3) {
      const mid = 0.5 * (xMin + xMax);
      xMin = mid - 2;
      xMax = mid + 2;
    }

    const d1Poly = poly.derivative(1);
    const d2Poly = poly.derivative(2);

    const sampleCount = 240;
    const ySamples: number[] = [0];
    for (let i = 0; i <= sampleCount; i++) {
      const x = xMin + ((xMax - xMin) * i) / sampleCount;
      const y = poly.eval(x);
      if (Number.isFinite(y)) ySamples.push(y);
    }
    ySamples.sort((a, b) => a - b);
    const loIdx = Math.floor(ySamples.length * 0.06);
    const hiIdx = Math.floor(ySamples.length * 0.94);
    let yMin = Math.min(-1, ySamples[loIdx] ?? -4);
    let yMax = Math.max(1, ySamples[hiIdx] ?? 4);
    const yPad = Math.max(0.8, 0.18 * (yMax - yMin));
    yMin -= yPad;
    yMax += yPad;

    const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * pw;
    const sy = (y: number) => padT + ((yMax - y) / (yMax - yMin)) * ph;

    const buildPolyline = (fn: (x: number) => number | null): string[] => {
      const segments: string[] = [];
      let current: string[] = [];
      for (let i = 0; i <= sampleCount; i++) {
        const x = xMin + ((xMax - xMin) * i) / sampleCount;
        const y = fn(x);
        if (y !== null && Number.isFinite(y) && y >= yMin - (yMax - yMin) && y <= yMax + (yMax - yMin)) {
          current.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
        } else {
          if (current.length > 1) segments.push(current.join(' '));
          current = [];
        }
      }
      if (current.length > 1) segments.push(current.join(' '));
      return segments;
    };

    const pSegments = buildPolyline((x) => poly.eval(x));
    const d1Segments = showD1 ? buildPolyline((x) => d1Poly.eval(x)) : [];
    const d2Segments = showD2 ? buildPolyline((x) => d2Poly.eval(x)) : [];
    const psiSegments = showPsi ? buildPolyline((x) => poly.psi(x)) : [];

    const xTicks: number[] = [];
    const xStep = xMax - xMin <= 6 ? 0.5 : xMax - xMin <= 14 ? 1 : 2;
    let xv = Math.ceil(xMin / xStep) * xStep;
    while (xv <= xMax + 1e-9) {
      xTicks.push(Number(xv.toFixed(4)));
      xv += xStep;
    }

    const yTicks: number[] = [];
    const ySpan = yMax - yMin;
    const yStep = ySpan <= 4 ? 0.5 : ySpan <= 12 ? 1 : ySpan <= 30 ? 5 : 10;
    let yv = Math.ceil(yMin / yStep) * yStep;
    while (yv <= yMax + 1e-9) {
      yTicks.push(Number(yv.toFixed(4)));
      yv += yStep;
    }

    return {
      W,
      H,
      padL,
      padT,
      pw,
      ph,
      xMin,
      xMax,
      yMin,
      yMax,
      sx,
      sy,
      pSegments,
      d1Segments,
      d2Segments,
      psiSegments,
      xTicks,
      yTicks,
    };
  }, [poly, pfp, showD1, showD2, showPsi, newtonX0]);

  const activePreset = PRESETS.find((p) => p.id === activePresetId);

  return (
    <div className="lab-page">
      {/* Academic Paper Masthead */}
      <header className="paper-masthead">
        <div className="journal-meta">
          <span>MATHEMATICS OF COMPUTATION &middot; NUMERICAL ANALYSIS MONOGRAPH</span>
          <span>NOVEMBER 2023 &middot; EXPANDED JANUARY 2025</span>
        </div>

        <h1 className="paper-title">
          Iterative Root-Finding Methods and the Polynomial Factorization Procedure
        </h1>

        <div className="paper-authors">
          <strong>Kartikesh Mishra</strong>
          <span className="mentor-line">
            Mentors: Dominique Maldague &amp; Thomas Pickering &nbsp;|&nbsp;{' '}
            <a href="./paper.pdf" target="_blank" rel="noreferrer" className="pdf-link">
              [Download Full Manuscript PDF]
            </a>
          </span>
        </div>

        <div className="paper-abstract">
          <strong>Abstract.</strong> This work implements and analyzes Newton&apos;s method, the secant
          method, and the bisection method to approximate real roots of univariate polynomials. We
          compare convergence orders, basins of attraction, and failure modes through theoretical
          and computational analysis: Newton&apos;s method achieves quadratic convergence (<em>q = 2</em>)
          for simple roots and linear convergence (<em>q = 1 &minus; 1/k</em>) for multiplicity{' '}
          <em>k &gt; 1</em>; the secant method converges with order equal to the golden ratio (
          <em>&phi; = (1+&radic;5)/2 &approx; 1.618</em>); and bisection guarantees linear interval
          halving (<em>q = 1</em>). Combining Cauchy &amp; Fujiwara root bounds, critical-point
          partitioning, inflection-guided Newton initialization, and bottom-up dynamic programming
          across the derivative tower, we introduce the{' '}
          <strong>Polynomial Factorization Procedure (PFP)</strong>—an <em>O(n²)</em> algorithm that
          deterministically isolates all real roots of any polynomial along with their exact
          multiplicities.
        </div>

        <nav className="page-nav-bar" aria-label="Document Sections">
          <button
            type="button"
            className={`page-nav-btn ${topPage === 'paper-and-lab' ? 'active' : ''}`}
            onClick={() => setTopPage('paper-and-lab')}
          >
            I. Research Manuscript &amp; Interactive Companion
          </button>
          <button
            type="button"
            className={`page-nav-btn ${topPage === 'preliminaries' ? 'active' : ''}`}
            onClick={() => setTopPage('preliminaries')}
          >
            II. Preliminaries &amp; Mathematical Foundations (From Scratch)
          </button>
        </nav>
      </header>

      {topPage === 'preliminaries' ? (
        <>
          <div className="section-banner">
            <span className="section-roman">PRELIMINARIES.</span> FOUNDATIONAL ALGEBRA &amp; REAL ANALYSIS REFERENCE
          </div>
          <PreliminariesPage />
        </>
      ) : (
        <>
      {/* Section I: Interactive Computational Companion */}
      <div className="section-banner">
        <span className="section-roman">PART I.</span> INTERACTIVE COMPUTATIONAL COMPANION &amp; PFP VERIFICATION BENCHMARK
      </div>

      {/* Polynomial Input & Paper Presets Bar */}
      <section className="control-ribbon">
        <div className="input-row">
          <label htmlFor="poly-expr-input" className="input-label">
            Polynomial <em>p(x)</em> =
          </label>
          <input
            id="poly-expr-input"
            type="text"
            className="poly-input"
            value={exprInput}
            onChange={(e) => {
              setExprInput(e.target.value);
              setActivePresetId('custom');
            }}
            placeholder="e.g. x^3 - 3x^2 + 3  or  1, -3, 0, 3"
          />
          <div className="factored-banner">
            <span className="factored-tag">PFP Factorization:</span>
            <code className="factored-code">p(x) = {pfp.factored}</code>
          </div>
          <div className="factored-banner">
            <span className="factored-tag">Bounds (Mₚ / M&infin; / M_F):</span>
            <code className="factored-code">
              {formatNum(pfp.cauchyBound, 2)} / {formatNum(pfp.linfBound, 2)} / {formatNum(pfp.fujiwaraBound, 2)} &rarr; &plusmn;{formatNum(pfp.tightBound, 2)}
            </code>
          </div>
        </div>

        <div className="presets-row">
          <span className="presets-label">Paper Examples:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-chip ${activePresetId === preset.id ? 'active' : ''}`}
              onClick={() => selectPreset(preset)}
            >
              <span className="preset-tag">{preset.tag}</span>
              <span className="preset-math">{preset.label}</span>
            </button>
          ))}
        </div>

        {activePreset && (
          <div className="preset-note">
            <strong>Manuscript Reference:</strong> {activePreset.description}
          </div>
        )}
      </section>

      {/* Main Two-Column Workspace */}
      <div className="lab-grid">
        {/* Left Column: Interactive SVG Curve & Basin Plotter */}
        <section className="panel plot-panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Critical-Point Partition &amp; Trajectory Visualizer</h2>
              <p className="panel-caption">
                p(x) = {pfp.expression} &nbsp;&middot;&nbsp; p&apos;(x) = {pfp.derivative1} &nbsp;&middot;&nbsp; p&apos;&apos;(x) = {pfp.derivative2}
              </p>
            </div>
            <div className="layer-toggles">
              <label className="toggle-pill">
                <input type="checkbox" checked={showD1} onChange={(e) => setShowD1(e.target.checked)} />
                <span className="swatch swatch-d1" /> p&apos;(x)
              </label>
              <label className="toggle-pill">
                <input type="checkbox" checked={showD2} onChange={(e) => setShowD2(e.target.checked)} />
                <span className="swatch swatch-d2" /> p&apos;&apos;(x)
              </label>
              <label className="toggle-pill">
                <input type="checkbox" checked={showPsi} onChange={(e) => setShowPsi(e.target.checked)} />
                <span className="swatch swatch-psi" /> &Psi;ₚ(x)
              </label>
            </div>
          </div>

          <div className="svg-wrap">
            <svg
              viewBox={`0 0 ${plotGeometry.W} ${plotGeometry.H}`}
              className="poly-svg"
              role="img"
              aria-label="Polynomial curve, critical points, inflection points, and roots"
            >
              <defs>
                <clipPath id="curve-clip">
                  <rect
                    x={plotGeometry.padL}
                    y={plotGeometry.padT}
                    width={plotGeometry.pw}
                    height={plotGeometry.ph}
                  />
                </clipPath>
              </defs>

              <rect
                x={plotGeometry.padL}
                y={plotGeometry.padT}
                width={plotGeometry.pw}
                height={plotGeometry.ph}
                fill="#faf6ee"
                stroke="#d8ccb8"
                strokeWidth="1.2"
                rx="6"
              />

              {/* Grid lines */}
              {plotGeometry.xTicks.map((xv) => {
                const px = plotGeometry.sx(xv);
                return (
                  <g key={`xt-${xv}`}>
                    <line
                      x1={px}
                      y1={plotGeometry.padT}
                      x2={px}
                      y2={plotGeometry.padT + plotGeometry.ph}
                      stroke="#ebe3d5"
                      strokeWidth="1"
                    />
                    <text
                      x={px}
                      y={plotGeometry.padT + plotGeometry.ph + 18}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#6e5d4f"
                    >
                      {xv}
                    </text>
                  </g>
                );
              })}

              {plotGeometry.yTicks.map((yv) => {
                const py = plotGeometry.sy(yv);
                return (
                  <g key={`yt-${yv}`}>
                    <line
                      x1={plotGeometry.padL}
                      y1={py}
                      x2={plotGeometry.padL + plotGeometry.pw}
                      y2={py}
                      stroke="#ebe3d5"
                      strokeWidth="1"
                    />
                    <text
                      x={plotGeometry.padL - 8}
                      y={py + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="#6e5d4f"
                    >
                      {yv}
                    </text>
                  </g>
                );
              })}

              {/* Coordinate Axes */}
              {plotGeometry.yMin <= 0 && plotGeometry.yMax >= 0 && (
                <line
                  x1={plotGeometry.padL}
                  y1={plotGeometry.sy(0)}
                  x2={plotGeometry.padL + plotGeometry.pw}
                  y2={plotGeometry.sy(0)}
                  stroke="#473a2f"
                  strokeWidth="1.6"
                />
              )}
              {plotGeometry.xMin <= 0 && plotGeometry.xMax >= 0 && (
                <line
                  x1={plotGeometry.sx(0)}
                  y1={plotGeometry.padT}
                  x2={plotGeometry.sx(0)}
                  y2={plotGeometry.padT + plotGeometry.ph}
                  stroke="#473a2f"
                  strokeWidth="1.4"
                />
              )}

              {/* Critical Point Partition Vertical Guides */}
              {pfp.criticalPoints.map((cp, idx) => {
                const cx = plotGeometry.sx(cp.root);
                return (
                  <g key={`cp-line-${idx}`} clipPath="url(#curve-clip)">
                    <line
                      x1={cx}
                      y1={plotGeometry.padT}
                      x2={cx}
                      y2={plotGeometry.padT + plotGeometry.ph}
                      stroke="#d97706"
                      strokeWidth="1.4"
                      strokeDasharray="5,4"
                    />
                  </g>
                );
              })}

              {/* Derivative & Psi Curves */}
              {plotGeometry.d2Segments.map((pts, idx) => (
                <polyline
                  key={`d2-${idx}`}
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="1.8"
                  strokeDasharray="4,3"
                  points={pts}
                  clipPath="url(#curve-clip)"
                />
              ))}
              {plotGeometry.d1Segments.map((pts, idx) => (
                <polyline
                  key={`d1-${idx}`}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  points={pts}
                  clipPath="url(#curve-clip)"
                />
              ))}
              {plotGeometry.psiSegments.map((pts, idx) => (
                <polyline
                  key={`psi-${idx}`}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.1"
                  points={pts}
                  clipPath="url(#curve-clip)"
                />
              ))}

              {/* Main Polynomial p(x) Curve */}
              {plotGeometry.pSegments.map((pts, idx) => (
                <polyline
                  key={`p-${idx}`}
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="3"
                  points={pts}
                  clipPath="url(#curve-clip)"
                />
              ))}

              {/* Newton Tangent Trajectory Overlay when Newton tab is selected */}
              {activeMethod === 'newton' &&
                newtonSteps.slice(0, 4).map((st) => {
                  const x0Px = plotGeometry.sx(st.x);
                  const y0Px = plotGeometry.sy(st.fx);
                  const x1Px = plotGeometry.sx(st.nextX);
                  const yZero = plotGeometry.sy(0);
                  return (
                    <g key={`nt-step-${st.step}`} clipPath="url(#curve-clip)">
                      <line
                        x1={x0Px}
                        y1={yZero}
                        x2={x0Px}
                        y2={y0Px}
                        stroke="#dc2626"
                        strokeWidth="1.3"
                        strokeDasharray="3,3"
                      />
                      <line
                        x1={x0Px}
                        y1={y0Px}
                        x2={x1Px}
                        y2={yZero}
                        stroke="#dc2626"
                        strokeWidth="2"
                      />
                      <circle cx={x0Px} cy={y0Px} r="4" fill="#dc2626" />
                    </g>
                  );
                })}

              {/* Critical Points Markers */}
              {pfp.criticalPoints.map((cp, idx) => {
                const cx = plotGeometry.sx(cp.root);
                const cy = plotGeometry.sy(poly.eval(cp.root));
                return (
                  <g key={`cp-pt-${idx}`} clipPath="url(#curve-clip)">
                    <circle cx={cx} cy={cy} r="5" fill="#d97706" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={cx + 6} y={cy - 8} fontSize="11" fontWeight="700" fill="#b45309">
                      c={formatNum(cp.root, 2)}
                    </text>
                  </g>
                );
              })}

              {/* Inflection Points Markers */}
              {pfp.inflectionPoints.map((ip, idx) => {
                const ix = plotGeometry.sx(ip);
                const iy = plotGeometry.sy(poly.eval(ip));
                return (
                  <g key={`ip-pt-${idx}`} clipPath="url(#curve-clip)">
                    <rect
                      x={ix - 4.5}
                      y={iy - 4.5}
                      width="9"
                      height="9"
                      rx="2"
                      fill="#7c3aed"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text x={ix + 7} y={iy + 14} fontSize="11" fontWeight="700" fill="#6d28d9">
                      &gamma;={formatNum(ip, 2)}
                    </text>
                  </g>
                );
              })}

              {/* Real Roots Markers */}
              {pfp.roots.map((rt, idx) => {
                const rx = plotGeometry.sx(rt.root);
                const ry = plotGeometry.sy(0);
                return (
                  <g key={`rt-pt-${idx}`} clipPath="url(#curve-clip)">
                    <circle
                      cx={rx}
                      cy={ry}
                      r={rt.multiplicity > 1 ? 7 : 5.5}
                      fill="#15803d"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={rx}
                      y={ry - 11}
                      textAnchor="middle"
                      fontSize="11.5"
                      fontWeight="800"
                      fill="#166534"
                    >
                      &alpha;={formatNum(rt.root, 3)} (m={rt.multiplicity})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Root & Critical Point Summary Cards */}
          <div className="structural-cards">
            <div className="struct-box">
              <span className="struct-head">Real Roots &alpha;ᵢ (with Multiplicity mᵢ)</span>
              <div className="badge-list">
                {pfp.roots.length === 0 ? (
                  <span className="empty-chip">No real roots</span>
                ) : (
                  pfp.roots.map((r, i) => (
                    <span key={i} className="math-chip root-chip">
                      &alpha;_{i + 1} = {formatNum(r.root, 5)}{' '}
                      <strong>(m = {r.multiplicity})</strong>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="struct-box">
              <span className="struct-head">Critical Points cᵢ (p&apos;(cᵢ) = 0) &amp; Inflections &gamma;ᵢ (p&apos;&apos;(&gamma;ᵢ) = 0)</span>
              <div className="badge-list">
                {pfp.criticalPoints.map((c, i) => (
                  <span key={`c-${i}`} className="math-chip crit-chip">
                    c_{i + 1} = {formatNum(c.root, 4)}
                  </span>
                ))}
                {pfp.inflectionPoints.map((g, i) => (
                  <span key={`g-${i}`} className="math-chip infl-chip">
                    &gamma;_{i + 1} = {formatNum(g, 4)}
                  </span>
                ))}
                {pfp.criticalPoints.length === 0 && pfp.inflectionPoints.length === 0 && (
                  <span className="empty-chip">Monotone linear polynomial</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Method Explorer & Convergence Tables */}
        <section className="panel analysis-panel">
          <div className="method-tabs">
            <button
              type="button"
              className={`method-tab ${activeMethod === 'pfp' ? 'active' : ''}`}
              onClick={() => setActiveMethod('pfp')}
            >
              PFP Factorization (§5)
            </button>
            <button
              type="button"
              className={`method-tab ${activeMethod === 'newton' ? 'active' : ''}`}
              onClick={() => setActiveMethod('newton')}
            >
              Newton (§2 · q=2)
            </button>
            <button
              type="button"
              className={`method-tab ${activeMethod === 'secant' ? 'active' : ''}`}
              onClick={() => setActiveMethod('secant')}
            >
              Secant (§3 · q=&phi;)
            </button>
            <button
              type="button"
              className={`method-tab ${activeMethod === 'bisection' ? 'active' : ''}`}
              onClick={() => setActiveMethod('bisection')}
            >
              Bisection (§4 · q=1)
            </button>
          </div>

          {activeMethod === 'pfp' && (
            <div className="tab-body">
              <div className="algo-explainer">
                <h3>Algorithm 5: Polynomial Factorization Procedure</h3>
                <p>
                  Partitions the Cauchy root bound <code>[-Mₚ, Mₚ]</code> by consecutive critical points{' '}
                  <code>c₁ &lt; &hellip; &lt; cₖ</code>. Multiple roots are detected directly at{' '}
                  <code>p(cᵢ) = 0</code> (with multiplicity <code>mᵢ + 1</code>), while each sign-changing
                  monotone interval <code>(cᵢ, cᵢ₊₁)</code> uses inflection points <code>&gamma; &in; Dᵢ</code>{' '}
                  (Algorithm 2) to pick a guaranteed-convergent Newton starting guess where{' '}
                  <code>sign(p(x₀)) = sign(p&apos;&apos;(x₀))</code>.
                </p>
              </div>

              <div className="table-scroll">
                <table className="iter-table">
                  <thead>
                    <tr>
                      <th>Monotone Interval</th>
                      <th>p(a), p(b) Signs</th>
                      <th>Inflections Dᵢ</th>
                      <th>Alg. 2 Init x₀</th>
                      <th>Converged Simple Root</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pfp.intervals.map((iv, idx) => (
                      <tr key={idx} className={iv.hasSignChange ? 'row-active' : 'row-muted'}>
                        <td>
                          [{formatNum(iv.left, 2)}, {formatNum(iv.right, 2)}]
                        </td>
                        <td>
                          ({iv.fLeft >= 0 ? '+' : '-'}, {iv.fRight >= 0 ? '+' : '-'})
                        </td>
                        <td>
                          {iv.inflectionsInBracket.length > 0
                            ? iv.inflectionsInBracket.map((g) => formatNum(g, 2)).join(', ')
                            : '—'}
                        </td>
                        <td>{iv.initialGuess !== null ? formatNum(iv.initialGuess, 4) : 'Skipped'}</td>
                        <td>
                          {iv.convergedRoot !== null ? (
                            <strong className="root-highlight">
                              &alpha; = {formatNum(iv.convergedRoot, 6)} ({iv.iterations} steps)
                            </strong>
                          ) : (
                            'No sign change'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMethod === 'newton' && (
            <div className="tab-body">
              <div className="param-bar">
                <label>
                  Initial Guess <code>x₀</code>:
                  <input
                    type="number"
                    step="0.25"
                    value={newtonX0}
                    onChange={(e) => setNewtonX0(Number(e.target.value))}
                  />
                </label>
                <span className="formula-badge">xₙ₊₁ = xₙ &minus; p(xₙ) / p&apos;(xₙ)</span>
              </div>

              <div className="table-scroll">
                <table className="iter-table">
                  <thead>
                    <tr>
                      <th>Step n</th>
                      <th>xₙ</th>
                      <th>p(xₙ)</th>
                      <th>p&apos;(xₙ)</th>
                      <th>|eₙ| = |xₙ &minus; &alpha;|</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newtonSteps.map((st) => (
                      <tr key={st.step}>
                        <td>{st.step}</td>
                        <td>{st.x.toFixed(6)}</td>
                        <td>{st.fx.toExponential(3)}</td>
                        <td>{st.dfx.toFixed(4)}</td>
                        <td>{st.error.toExponential(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMethod === 'secant' && (
            <div className="tab-body">
              <div className="param-bar">
                <label>
                  Guess <code>x₀</code>:
                  <input
                    type="number"
                    step="0.25"
                    value={secantX0}
                    onChange={(e) => setSecantX0(Number(e.target.value))}
                  />
                </label>
                <label>
                  Guess <code>x₁</code>:
                  <input
                    type="number"
                    step="0.25"
                    value={secantX1}
                    onChange={(e) => setSecantX1(Number(e.target.value))}
                  />
                </label>
                <span className="formula-badge">Order &phi; = (1+&radic;5)/2 &approx; 1.618</span>
              </div>

              <div className="table-scroll">
                <table className="iter-table">
                  <thead>
                    <tr>
                      <th>Step n</th>
                      <th>xₙ₋₁</th>
                      <th>xₙ</th>
                      <th>xₙ₊₁</th>
                      <th>p(xₙ)</th>
                      <th>|eₙ|</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secantSteps.map((st) => (
                      <tr key={st.step}>
                        <td>{st.step}</td>
                        <td>{st.xPrev.toFixed(5)}</td>
                        <td>{st.xCurr.toFixed(6)}</td>
                        <td>{st.nextX.toFixed(6)}</td>
                        <td>{st.fxCurr.toExponential(3)}</td>
                        <td>{st.error.toExponential(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMethod === 'bisection' && (
            <div className="tab-body">
              <div className="param-bar">
                <label>
                  Left <code>l₀</code>:
                  <input
                    type="number"
                    step="0.25"
                    value={bisectL}
                    onChange={(e) => setBisectL(Number(e.target.value))}
                  />
                </label>
                <label>
                  Right <code>r₀</code>:
                  <input
                    type="number"
                    step="0.25"
                    value={bisectR}
                    onChange={(e) => setBisectR(Number(e.target.value))}
                  />
                </label>
                <span className="formula-badge">xₙ = (lₙ + rₙ) / 2 &middot; Order 1</span>
              </div>

              <div className="table-scroll">
                <table className="iter-table">
                  <thead>
                    <tr>
                      <th>Step n</th>
                      <th>lₙ</th>
                      <th>rₙ</th>
                      <th>Midpoint xₙ</th>
                      <th>p(xₙ)</th>
                      <th>|eₙ|</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bisectionSteps.map((st) => (
                      <tr key={st.step}>
                        <td>{st.step}</td>
                        <td>{st.left.toFixed(5)}</td>
                        <td>{st.right.toFixed(5)}</td>
                        <td>{st.mid.toFixed(6)}</td>
                        <td>{st.fMid.toExponential(3)}</td>
                        <td>{st.error.toExponential(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Section II: Complete Research Manuscript */}
      <div className="section-banner">
        <span className="section-roman">PART II.</span> RESEARCH MANUSCRIPT — THEORETICAL ANALYSIS, PROOFS &amp; ALGORITHMS (CLICK TO EXPAND PROOFS)
      </div>

      <ResearchManuscriptSection />
        </>
      )}
    </div>
  );
}

export default App;
