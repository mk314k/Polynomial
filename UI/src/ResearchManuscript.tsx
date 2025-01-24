import React, { useState } from 'react';

interface CollapsibleProps {
  label?: string;
  children: React.ReactNode;
}

function CollapsibleBlock({ label = 'Proof', children }: CollapsibleProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <div className="collapsible-wrap">
      <button
        type="button"
        className={`proof-toggle-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{open ? `▾ Hide ${label}` : `▸ Show ${label}`}</span>
      </button>
      {open && <div className="proof-box">{children}</div>}
    </div>
  );
}

export function ResearchManuscriptSection(): React.ReactElement {
  return (
    <article className="manuscript-body">
      {/* Section 1 */}
      <section className="paper-section" id="sec-intro">
        <h2 className="sec-heading">
          <span className="sec-num">1.</span> Introduction &amp; Classical Root-Finding Benchmarks
        </h2>
        <p className="paper-p">
          A recurring problem in numerical analysis and scientific computing is approximating the
          real roots of a univariate polynomial <span className="math-inline">p(x) = &sum; aᵣ xʳ</span>.
          Iterative root-finding methods exhibit a fundamental trade-off between asymptotic
          convergence speed and global robustness against degenerate initial guesses, vanishing
          derivatives, or periodic orbits. To compare Newton&apos;s method, the secant method, and
          the bisection method on equal footing, we first evaluate all three on the benchmark
          polynomial <span className="math-inline">f(x) = &frac18;x² &minus; &frac12;</span> with
          target root <span className="math-inline">&alpha; = 2</span>.
        </p>

        <div className="fig-grid-2">
          <figure className="paper-figure">
            <img src="./figures/NewtonEx1.png" alt="Newton convergence on 0.125x^2 - 0.5" />
            <figcaption>
              <strong>Figure 1a.</strong> Quadratic convergence of Newton&apos;s method from{' '}
              <span className="math-inline">x₀ = 4 &rarr; 2.5 &rarr; 2.05 &rarr; 2</span>.
            </figcaption>
          </figure>
          <figure className="paper-figure">
            <img src="./figures/NewtonFailure1.png" alt="Newton failure at critical point x0 = 0" />
            <figcaption>
              <strong>Figure 1b.</strong> Newton failure at the critical point{' '}
              <span className="math-inline">x₀ = 0</span> where{' '}
              <span className="math-inline">f&apos;(x₀) = 0</span> (horizontal tangent).
            </figcaption>
          </figure>
        </div>

        <CollapsibleBlock label="Secant & Bisection Benchmark Figures & Tables (Figures 2a, 2b, 3 & Table 3)">
          <div className="fig-grid-2">
            <figure className="paper-figure">
              <img src="./figures/SecantEx1.png" alt="Secant method convergence" />
              <figcaption>
                <strong>Figure 2a.</strong> Secant method convergence (order{' '}
                <span className="math-inline">&phi; &approx; 1.618</span>) from{' '}
                <span className="math-inline">(x₀, x₁) = (1, 4)</span>.
              </figcaption>
            </figure>
            <figure className="paper-figure">
              <img src="./figures/SecantFailure1.png" alt="Secant method failure" />
              <figcaption>
                <strong>Figure 2b.</strong> Secant failure when{' '}
                <span className="math-inline">f(x₀) = f(x₁)</span> produces a horizontal secant line.
              </figcaption>
            </figure>
          </div>
          <figure className="paper-figure single-fig">
            <img src="./figures/BisectionEx1.png" alt="Bisection interval halving" />
            <figcaption>
              <strong>Figure 3.</strong> Bisection interval halving on{' '}
              <span className="math-inline">[1, 4]</span> (order <span className="math-inline">q = 1</span>, requiring 16 steps vs. 4 for Newton and 6 for Secant).
            </figcaption>
          </figure>
        </CollapsibleBlock>

        <p className="paper-p">
          Even on this single quadratic benchmark <span className="math-inline">f(x) = &frac18;x² &minus; &frac12;</span>,
          a striking disparity in convergence speed emerges: Newton&apos;s method reaches six-decimal
          accuracy in just <strong>4 steps</strong>, the secant method requires <strong>6 steps</strong>,
          and the bisection method requires <strong>16 steps</strong>. Conversely, the faster methods
          introduce sharper failure modes when initialized poorly—Newton&apos;s method fails if{' '}
          <span className="math-inline">f&apos;(xₙ) = 0</span>, and the secant method fails if{' '}
          <span className="math-inline">f(xₙ) = f(xₙ₋₁)</span>—whereas bisection is guaranteed to
          converge across any sign-changing bracket. To rigorously quantify how fast an iterative
          sequence approaches a root <span className="math-inline">&alpha;</span>, we formally define
          the <em>order of convergence</em>.
        </p>

        <div className="theorem-block definition">
          <div className="thm-head">
            <strong>Definition 1.1</strong> (Order of Convergence).
          </div>
          <div className="thm-content">
            A sequence <span className="math-inline">{'{xₙ}'}</span> converging to a root{' '}
            <span className="math-inline">&alpha;</span> has <em>order of convergence</em>{' '}
            <span className="math-inline">q &ge; 1</span> if there exists an asymptotic error
            constant <span className="math-inline">&mu; &gt; 0</span> such that
            <div className="math-display">
              lim<sub>n&rarr;&infin;</sub> |x<sub>n+1</sub> &minus; &alpha;| / |x<sub>n</sub> &minus; &alpha;|<sup>q</sup> = &mu;.
            </div>
          </div>
        </div>

        <div className="paper-table-wrap">
          <div className="table-caption">
            <strong>Table 1.</strong> Asymptotic and global comparison of iterative root-finding methods.
          </div>
          <table className="paper-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Convergence Order q</th>
                <th>Asymptotic Error Law</th>
                <th>Global / Multiplicity Behavior</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Newton&apos;s Method</td>
                <td>q = 2 (simple), q = 1 (mult. k &gt; 1)</td>
                <td>|eₙ₊₁| &approx; |p&apos;&apos;(&alpha;) / 2p&apos;(&alpha;)| |eₙ|²</td>
                <td>Fails if p&apos;(xₙ) = 0; exhibits 2-cycle orbits</td>
              </tr>
              <tr>
                <td>Secant Method</td>
                <td>q = &phi; = (1+&radic;5)/2 &approx; 1.618</td>
                <td>|eₙ₊₁| &approx; |C| |eₙ| |eₙ₋₁|</td>
                <td>Derivative-free; fails if p(xₙ) = p(xₙ₋₁)</td>
              </tr>
              <tr>
                <td>Bisection Method</td>
                <td>q = 1 (linear halving)</td>
                <td>|rₙ &minus; lₙ| = |r₀ &minus; l₀| / 2ⁿ</td>
                <td>Guaranteed on sign change; misses even multiplicity</td>
              </tr>
              <tr>
                <td><strong>PFP (Ours)</strong></td>
                <td><strong>q = 2 on isolated brackets</strong></td>
                <td><strong>O(n²) Bottom-Up DP + Alg. 1</strong></td>
                <td><strong>Deterministically isolates all real roots &amp; multiplicities</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2 */}
      <section className="paper-section" id="sec-bounds">
        <h2 className="sec-heading">
          <span className="sec-num">2.</span> Polynomial Root Bounds, Critical Points &amp; Multiplicity
        </h2>
        <p className="paper-p">
          Under an affine transformation <span className="math-inline">q(x) = c &middot; p(ax + b)</span>{' '}
          with <span className="math-inline">a, c &ne; 0</span>, every root{' '}
          <span className="math-inline">&alpha;ᵢ</span> of <span className="math-inline">p</span> maps
          to a root <span className="math-inline">(&alpha;ᵢ &minus; b)/a</span> of{' '}
          <span className="math-inline">q</span>. Normalizing by the leading coefficient{' '}
          <span className="math-inline">aₙ</span> yields a compact search interval for all roots and
          critical points.
        </p>

        <div className="theorem-block proposition">
          <div className="thm-head">
            <strong>Proposition 2.1</strong> (Cauchy <span className="math-inline">&ell;₁</span> Bound on Root Magnitudes).
          </div>
          <div className="thm-content">
            Given a polynomial <span className="math-inline">p(x) = &sum;<sub>r=0</sub><sup>n</sup> aᵣ xʳ</span>{' '}
            with <span className="math-inline">aₙ &ne; 0</span>, all roots of <span className="math-inline">p</span>{' '}
            have magnitude bounded within <span className="math-inline">[&minus;Mₚ, Mₚ]</span>, where
            <div className="math-display">
              Mₚ = max&#123; 1, &sum;<sub>r=0</sub><sup>n&minus;1</sup> |aᵣ / aₙ| &#125;.
            </div>
          </div>
          <CollapsibleBlock>
            Consider the monic polynomial <span className="math-inline">q(x) = xⁿ + &sum;<sub>r=0</sub><sup>n&minus;1</sup> bᵣ xʳ</span>{' '}
            where <span className="math-inline">bᵣ = aᵣ / aₙ</span>. For any root{' '}
            <span className="math-inline">&alpha;</span> with <span className="math-inline">|&alpha;| &ge; 1</span>,
            we have <span className="math-inline">|&alpha;|ʳ &le; |&alpha;|<sup>n&minus;1</sup></span> for all{' '}
            <span className="math-inline">0 &le; r &le; n &minus; 1</span>. By the triangle inequality,
            <div className="math-display">
              |&alpha;|<sup>n</sup> = |&sum;<sub>r=0</sub><sup>n&minus;1</sup> b<sub>r</sub>&alpha;<sup>r</sup>| &le; |&alpha;|<sup>n&minus;1</sup> &sum;<sub>r=0</sub><sup>n&minus;1</sup> |b<sub>r</sub>| &rArr; |&alpha;| &le; &sum;<sub>r=0</sub><sup>n&minus;1</sup> |a<sub>r</sub> / a<sub>n</sub>|.
            </div>
            Combining with the case <span className="math-inline">|&alpha;| &lt; 1</span> yields{' '}
            <span className="math-inline">|&alpha;| &le; Mₚ</span>. &#9632;
          </CollapsibleBlock>
        </div>

        <div className="theorem-block corollary">
          <div className="thm-head">
            <strong>Corollary 2.2</strong> (Critical-Point Magnitude Bound).
          </div>
          <div className="thm-content">
            All critical points of <span className="math-inline">p(x)</span> (roots of{' '}
            <span className="math-inline">p&apos;(x)</span>) are also bounded within{' '}
            <span className="math-inline">[&minus;Mₚ, Mₚ]</span>.
          </div>
          <CollapsibleBlock>
            Applying Proposition 2.1 to <span className="math-inline">p&apos;(x) = &sum;<sub>r=1</sub><sup>n</sup> r aᵣ x<sup>r&minus;1</sup></span>{' '}
            bounds all critical points within <span className="math-inline">[&minus;M<sub>p&apos;</sub>, M<sub>p&apos;</sub>]</span>, where
            <div className="math-display">
              M<sub>p&apos;</sub> = max&#123; 1, &sum;<sub>r=1</sub><sup>n&minus;1</sup> |r a<sub>r</sub> / (n a<sub>n</sub>)| &#125; &le; max&#123; 1, &sum;<sub>r=0</sub><sup>n&minus;1</sup> |a<sub>r</sub> / a<sub>n</sub>| &#125; = M<sub>p</sub>. &#9632;
            </div>
          </CollapsibleBlock>
        </div>

        <div className="theorem-block proposition">
          <div className="thm-head">
            <strong>Proposition 2.3</strong> (Critical-Point Separation of Real Roots).
          </div>
          <div className="thm-content">
            There is always at least one critical point strictly between any two distinct real roots
            of <span className="math-inline">p(x)</span>. Consequently, if <span className="math-inline">p(x)</span>{' '}
            has <span className="math-inline">k</span> distinct real roots, it possesses at least{' '}
            <span className="math-inline">k &minus; 1</span> real critical points.
          </div>
          <CollapsibleBlock>
            Since every polynomial is continuously differentiable on <span className="math-inline">&#8477;</span>,
            for any two distinct roots <span className="math-inline">a &lt; b</span> with{' '}
            <span className="math-inline">p(a) = p(b) = 0</span>, Rolle&apos;s Theorem guarantees{' '}
            <span className="math-inline">c &in; (a, b)</span> such that{' '}
            <span className="math-inline">p&apos;(c) = (p(b) &minus; p(a))/(b &minus; a) = 0</span>.
            Applying this across <span className="math-inline">k</span> sorted roots{' '}
            <span className="math-inline">&alpha;₁ &lt; &alpha;₂ &lt; &hellip; &lt; &alpha;ₖ</span>{' '}
            yields at least <span className="math-inline">k &minus; 1</span> critical points. &#9632;
          </CollapsibleBlock>
        </div>

        <div className="theorem-block corollary">
          <div className="thm-head">
            <strong>Corollary 2.4</strong> (Uniqueness of Simple Roots Between Consecutive Critical Points).
          </div>
          <div className="thm-content">
            There can be <strong>at most one</strong> real root strictly between any two consecutive
            critical points (CCPs) <span className="math-inline">c₁ &lt; c₂</span>.
          </div>
          <CollapsibleBlock>
            Suppose two distinct roots <span className="math-inline">&alpha;₁ &lt; &alpha;₂</span> lay
            in <span className="math-inline">(c₁, c₂)</span>. By Proposition 2.3, there would exist a
            critical point <span className="math-inline">c* &in; (&alpha;₁, &alpha;₂) &subset; (c₁, c₂)</span>,
            contradicting the assumption that <span className="math-inline">c₁</span> and{' '}
            <span className="math-inline">c₂</span> are consecutive critical points. &#9632;
          </CollapsibleBlock>
        </div>

        <div className="theorem-block proposition">
          <div className="thm-head">
            <strong>Proposition 2.5</strong> (Derivative Sign Invariance on CCP Intervals).
          </div>
          <div className="thm-content">
            Given an interval of two CCPs <span className="math-inline">(c₁, c₂)</span> containing a
            simple root <span className="math-inline">&alpha;</span>, <span className="math-inline">p(x)</span>{' '}
            and <span className="math-inline">p&apos;(x)</span> have opposite signs on{' '}
            <span className="math-inline">[c₁, &alpha;)</span> and identical signs on{' '}
            <span className="math-inline">(&alpha;, c₂]</span>.
          </div>
          <CollapsibleBlock>
            By the Intermediate Value Theorem, <span className="math-inline">p</span> changes sign at{' '}
            <span className="math-inline">&alpha;</span> while <span className="math-inline">p&apos;</span>{' '}
            maintains a constant nonzero sign on <span className="math-inline">(c₁, c₂)</span>. For{' '}
            <span className="math-inline">x = &alpha; + &epsilon; &in; (&alpha;, c₂]</span> with{' '}
            <span className="math-inline">&epsilon; &gt; 0</span>,{' '}
            <span className="math-inline">
              p&apos;(&alpha;) = lim<sub>&epsilon;&rarr;0+</sub> (p(&alpha;+&epsilon;) &minus; p(&alpha;))/&epsilon; = lim<sub>&epsilon;&rarr;0+</sub> p(x)/&epsilon;
            </span>
            , so <span className="math-inline">p(x)</span> and <span className="math-inline">p&apos;(x)</span>{' '}
            share the same sign on <span className="math-inline">(&alpha;, c₂]</span> and opposite
            signs on <span className="math-inline">[c₁, &alpha;)</span>. &#9632;
          </CollapsibleBlock>
        </div>

        <div className="theorem-block definition">
          <div className="thm-head">
            <strong>Definition 2.6</strong> (Root Multiplicity via Higher Derivatives).
          </div>
          <div className="thm-content">
            A number <span className="math-inline">&alpha;</span> is a root of{' '}
            <span className="math-inline">p(x)</span> with <strong>multiplicity k &ge; 1</strong> if{' '}
            <span className="math-inline">p<sup>(l)</sup>(&alpha;) = 0</span> for all{' '}
            <span className="math-inline">0 &le; l &lt; k</span> and{' '}
            <span className="math-inline">p<sup>(k)</sup>(&alpha;) &ne; 0</span>.
          </div>
        </div>

        <div className="theorem-block lemma">
          <div className="thm-head">
            <strong>Lemma 2.7</strong> (Equivalence of Derivative Multiplicity and Factor Multiplicity).
          </div>
          <div className="thm-content">
            A root <span className="math-inline">&alpha;</span> has derivative multiplicity{' '}
            <span className="math-inline">k</span> if and only if{' '}
            <span className="math-inline">p(x) = (x &minus; &alpha;)ᵏ q(x)</span> for some polynomial{' '}
            <span className="math-inline">q(x)</span> with <span className="math-inline">q(&alpha;) &ne; 0</span>.
            Consequently, every multiple root (<span className="math-inline">k &ge; 2</span>) of{' '}
            <span className="math-inline">p(x)</span> occurs at a critical point{' '}
            <span className="math-inline">p&apos;(&alpha;) = 0</span> with multiplicity{' '}
            <span className="math-inline">k &minus; 1</span> in <span className="math-inline">p&apos;(x)</span>.
          </div>
          <CollapsibleBlock>
            If <span className="math-inline">p(x) = (x &minus; &alpha;)ᵏ q(x)</span> with{' '}
            <span className="math-inline">q(&alpha;) &ne; 0</span>, repeated differentiation via the
            product rule gives <span className="math-inline">p<sup>(l)</sup>(&alpha;) = 0</span> for{' '}
            <span className="math-inline">0 &le; l &lt; k</span> and{' '}
            <span className="math-inline">p<sup>(k)</sup>(&alpha;) = k! q(&alpha;) &ne; 0</span>.
            Conversely, we induct on <span className="math-inline">k</span>. For{' '}
            <span className="math-inline">k = 1</span>, <span className="math-inline">p(x) = (x &minus; &alpha;)q(x)</span>{' '}
            implies <span className="math-inline">q(&alpha;) = p&apos;(&alpha;) &ne; 0</span>. Assuming the
            claim for multiplicities <span className="math-inline">m &lt; n</span>, a root{' '}
            <span className="math-inline">&beta;</span> of multiplicity <span className="math-inline">n</span>{' '}
            in <span className="math-inline">p</span> has multiplicity <span className="math-inline">n &minus; 1</span>{' '}
            in <span className="math-inline">p&apos;</span>. Writing{' '}
            <span className="math-inline">p(x) = (x &minus; &beta;)ʳ s(x)</span> with{' '}
            <span className="math-inline">s(&beta;) &ne; 0</span> gives{' '}
            <span className="math-inline">
              p&apos;(x) = (x &minus; &beta;)<sup>r&minus;1</sup>[r s(x) + (x &minus; &beta;)s&apos;(x)]
            </span>
            , so <span className="math-inline">r &minus; 1 = n &minus; 1 &rArr; r = n</span>. &#9632;
          </CollapsibleBlock>
        </div>
      </section>

      {/* Section 3 */}
      <section className="paper-section" id="sec-newton">
        <h2 className="sec-heading">
          <span className="sec-num">3.</span> Newton&apos;s Rational Map &Psi;ₚ(x), Monotone Basins &amp; Convergence Order
        </h2>

        <div className="theorem-block definition">
          <div className="thm-head">
            <strong>Definition 3.1</strong> (Newton&apos;s Rational Function &amp; Iterated Sequence).
          </div>
          <div className="thm-content">
            For a polynomial <span className="math-inline">p(x)</span>, Newton&apos;s rational map is{' '}
            <span className="math-inline">&Psi;ₚ(x) = x &minus; p(x)/p&apos;(x)</span>, with{' '}
            <span className="math-inline">n</span>-fold composition{' '}
            <span className="math-inline">&Psi;ₚⁿ(x) = &Psi;ₚ(&Psi;ₚ<sup>n&minus;1</sup>(x))</span>.
          </div>
        </div>

        <div className="fig-grid-2">
          <figure className="paper-figure">
            <img src="./figures/x4x.png" alt="Newton iterates for x^4 + x" />
            <figcaption>
              <strong>Figure 4.</strong> <span className="math-inline">p(x) = x⁴ + x</span> (blue),{' '}
              <span className="math-inline">&Psi;ₚ(x)</span> (green), and 10th iterate{' '}
              <span className="math-inline">&Psi;ₚ¹⁰(x)</span> (purple step function to{' '}
              <span className="math-inline">{'{-1, 0}'}</span>).
            </figcaption>
          </figure>
          <figure className="paper-figure">
            <img src="./figures/newt_comp.png" alt="Inflection basin for (x-2)^2(x+1)-1" />
            <figcaption>
              <strong>Figure 5.</strong> <span className="math-inline">p(x) = (x&minus;2)²(x+1) &minus; 1</span>{' '}
              (blue), <span className="math-inline">p&apos;&apos;(x)</span> (purple dashed, inflection{' '}
              <span className="math-inline">&gamma; = 1</span>), and <span className="math-inline">&Psi;ₚ(x)</span> (green).
            </figcaption>
          </figure>
        </div>

        <div className="theorem-block proposition">
          <div className="thm-head">
            <strong>Proposition 3.2</strong> (Fixed-Point Consistency of Newton&apos;s Sequence).
          </div>
          <div className="thm-content">
            If the sequence <span className="math-inline">xₙ = &Psi;ₚⁿ(x₀)</span> converges to a finite
            real limit <span className="math-inline">&alpha;</span>, then{' '}
            <span className="math-inline">p(&alpha;) = 0</span>.
          </div>
          <CollapsibleBlock>
            Rearranging <span className="math-inline">xₙ₊₁ = xₙ &minus; p(xₙ)/p&apos;(xₙ)</span> gives{' '}
            <span className="math-inline">p(xₙ) = p&apos;(xₙ)(xₙ &minus; xₙ₊₁)</span>. Since{' '}
            <span className="math-inline">xₙ &rarr; &alpha;</span> implies{' '}
            <span className="math-inline">xₙ &minus; xₙ₊₁ &rarr; 0</span> and{' '}
            <span className="math-inline">p&apos;(xₙ) &rarr; p&apos;(&alpha;)</span> by continuity, taking
            limits yields <span className="math-inline">p(&alpha;) = p&apos;(&alpha;) &middot; 0 = 0</span>. &#9632;
          </CollapsibleBlock>
        </div>

        <div className="theorem-block lemma">
          <div className="thm-head">
            <strong>Lemma 3.3</strong> (Monotone Basin Convergence Lemma).
          </div>
          <div className="thm-content">
            If <span className="math-inline">p(x)</span> is monotonic and{' '}
            <span className="math-inline">&Psi;ₚ(x)</span> is monotonically increasing on an interval{' '}
            <span className="math-inline">[a, b]</span> containing a root{' '}
            <span className="math-inline">&alpha;</span>, then for every{' '}
            <span className="math-inline">x₀ &in; (a, b)</span>,{' '}
            <span className="math-inline">&Psi;ₚⁿ(x₀) &rarr; &alpha;</span> monotonically.
          </div>
          <CollapsibleBlock>
            For <span className="math-inline">x &in; (a, &alpha;)</span>, Proposition 2.5 gives{' '}
            <span className="math-inline">p(x)/p&apos;(x) &lt; 0</span>, so{' '}
            <span className="math-inline">x &lt; &Psi;ₚ(x) &le; &Psi;ₚ(&alpha;) = &alpha;</span> by
            monotonicity of <span className="math-inline">&Psi;ₚ</span>. Thus{' '}
            <span className="math-inline">&Psi;ₚⁿ(x)</span> is monotonically increasing and bounded
            above by <span className="math-inline">&alpha;</span>. Symmetrically, for{' '}
            <span className="math-inline">x &in; (&alpha;, b)</span>,{' '}
            <span className="math-inline">p(x)/p&apos;(x) &gt; 0 &rArr; &alpha; &le; &Psi;ₚ(x) &lt; x</span>,
            so <span className="math-inline">&Psi;ₚⁿ(x)</span> is monotonically decreasing and bounded
            below by <span className="math-inline">&alpha;</span>. By the Monotone Convergence Theorem
            and Proposition 3.2, both converge to <span className="math-inline">&alpha;</span>. &#9632;
          </CollapsibleBlock>
        </div>

        <div className="theorem-block proposition">
          <div className="thm-head">
            <strong>Proposition 3.4 &amp; Algorithm 1</strong> (Inflection-Guided Guaranteed Convergent Sub-Interval).
          </div>
          <div className="thm-content">
            Partitioning any sign-changing CCP bracket <span className="math-inline">[c₁, c₂]</span> by
            its interior inflection points <span className="math-inline">&gamma;₁ &lt; &hellip; &lt; &gamma;ᵣ</span>{' '}
            (<span className="math-inline">p&apos;&apos;(&gamma;ᵢ) = 0</span>) isolates a unique
            sub-interval <span className="math-inline">[a, b]</span> containing the root{' '}
            <span className="math-inline">&alpha;</span> on which <span className="math-inline">p&apos;&apos;(x)</span>{' '}
            has constant sign. Choosing <span className="math-inline">x₀ = b</span> when{' '}
            <span className="math-inline">sign(p&apos;&apos;((a+b)/2)) = sign(p&apos;((c₁+c₂)/2))</span> and{' '}
            <span className="math-inline">x₀ = a</span> otherwise guarantees{' '}
            <span className="math-inline">&Psi;&apos;ₚ(x) = p(x)p&apos;&apos;(x)/(p&apos;(x))² &gt; 0</span>{' '}
            and monotonic convergence <span className="math-inline">&Psi;ₚⁿ(x₀) &rarr; &alpha;</span>.
          </div>
          <CollapsibleBlock>
            Let <span className="math-inline">s = sign(p&apos;(x)) &in; &#123;+1, &minus;1&#125;</span> on{' '}
            <span className="math-inline">[c₁, c₂]</span>. On the unique sign-changing sub-interval{' '}
            <span className="math-inline">[a, b]</span> containing <span className="math-inline">&alpha;</span>,{' '}
            Proposition 2.5 implies <span className="math-inline">sign(p) = &minus;s</span> on{' '}
            <span className="math-inline">[a, &alpha;)</span> and <span className="math-inline">sign(p) = +s</span>{' '}
            on <span className="math-inline">(&alpha;, b]</span>. Since <span className="math-inline">p&apos;&apos;</span>{' '}
            does not vanish on <span className="math-inline">(a, b)</span>, if{' '}
            <span className="math-inline">sign(p&apos;&apos;) = +s</span> then{' '}
            <span className="math-inline">p(x)p&apos;&apos;(x) &gt; 0</span> on{' '}
            <span className="math-inline">(&alpha;, b]</span>; if{' '}
            <span className="math-inline">sign(p&apos;&apos;) = &minus;s</span> then{' '}
            <span className="math-inline">p(x)p&apos;&apos;(x) &gt; 0</span> on{' '}
            <span className="math-inline">[a, &alpha;)</span>. Since{' '}
            <span className="math-inline">&Psi;&apos;ₚ(x) = p(x)p&apos;&apos;(x)/(p&apos;(x))² &gt; 0</span>,
            Lemma 3.3 guarantees monotonic convergence to <span className="math-inline">&alpha;</span>. &#9632;
          </CollapsibleBlock>
        </div>

        <div className="theorem-block theorem">
          <div className="thm-head">
            <strong>Theorem 3.5</strong> (Quadratic vs. Linear Convergence of Newton&apos;s Method).
          </div>
          <div className="thm-content">
            When <span className="math-inline">xₙ = &Psi;ₚⁿ(x₀) &rarr; &alpha;</span> for a root{' '}
            <span className="math-inline">&alpha;</span> of multiplicity{' '}
            <span className="math-inline">k &ge; 1</span>, Newton&apos;s method converges{' '}
            <strong>quadratically (order q = 2)</strong> if <span className="math-inline">k = 1</span>,
            and <strong>linearly (order q = 1)</strong> with rate{' '}
            <span className="math-inline">1 &minus; 1/k</span> if <span className="math-inline">k &gt; 1</span>.
          </div>
          <CollapsibleBlock>
            Expanding <span className="math-inline">p(&alpha; + eₙ)</span> and{' '}
            <span className="math-inline">p&apos;(&alpha; + eₙ)</span> via Taylor series around a root{' '}
            <span className="math-inline">&alpha;</span> where{' '}
            <span className="math-inline">p<sup>(l)</sup>(&alpha;) = 0</span> for{' '}
            <span className="math-inline">l &lt; k</span> yields
            <div className="math-display">
              e<sub>n+1</sub> = e<sub>n</sub> &minus; p(x<sub>n</sub>)/p&apos;(x<sub>n</sub>) = e<sub>n</sub>(1 &minus; 1/k) + e<sub>n</sub>² &middot; [ p<sup>(k+1)</sup>(&alpha;) / (k(k+1)p<sup>(k)</sup>(&alpha;)) ] + O(e<sub>n</sub>³).
            </div>
            For <span className="math-inline">k = 1</span>, the linear term vanishes and{' '}
            <span className="math-inline">lim |eₙ₊₁|/|eₙ|² = |p&apos;&apos;(&alpha;)/2p&apos;(&alpha;)|</span>.
            For <span className="math-inline">k &gt; 1</span>,{' '}
            <span className="math-inline">lim |eₙ₊₁|/|eₙ| = 1 &minus; 1/k</span>. &#9632;
          </CollapsibleBlock>
        </div>
      </section>

      {/* Section 4 */}
      <section className="paper-section" id="sec-secant">
        <h2 className="sec-heading">
          <span className="sec-num">4.</span> Secant Method &amp; Bisection Method Convergence
        </h2>

        <div className="theorem-block theorem">
          <div className="thm-head">
            <strong>Theorem 4.1</strong> (Golden-Ratio Convergence of the Secant Method).
          </div>
          <div className="thm-content">
            If the secant sequence{' '}
            <span className="math-inline">xₙ₊₁ = xₙ &minus; f(xₙ)(xₙ &minus; xₙ₋₁)/(f(xₙ) &minus; f(xₙ₋₁))</span>{' '}
            converges to a simple root <span className="math-inline">&alpha;</span> where{' '}
            <span className="math-inline">f&apos;(&alpha;) &ne; 0</span> and{' '}
            <span className="math-inline">f&apos;&apos;(&alpha;) &ne; 0</span>, then its order of
            convergence is the golden ratio{' '}
            <span className="math-inline">&phi; = (1 + &radic;5)/2 &approx; 1.618034</span>.
          </div>
          <CollapsibleBlock>
            Setting <span className="math-inline">eₙ = xₙ &minus; &alpha;</span> and expanding{' '}
            <span className="math-inline">f(&alpha; + eₙ) = f&apos;(&alpha;)eₙ + &frac12;f&apos;&apos;(&alpha;)eₙ² + O(eₙ³)</span>{' '}
            gives the two-step error relation{' '}
            <span className="math-inline">eₙ₊₁ &approx; C eₙ eₙ₋₁</span> with{' '}
            <span className="math-inline">C = f&apos;&apos;(&alpha;)/(2f&apos;(&alpha;))</span>. Defining{' '}
            <span className="math-inline">gₙ = log|C eₙ|</span> yields the Fibonacci recurrence{' '}
            <span className="math-inline">gₙ₊₁ = gₙ + gₙ₋₁</span>, whose consecutive ratio converges to{' '}
            <span className="math-inline">lim (gₙ₊₁ / gₙ) = &phi; = (1 + &radic;5)/2</span>.
            Transforming back to <span className="math-inline">eₙ</span> yields{' '}
            <span className="math-inline">lim |eₙ₊₁| / |eₙ|<sup>&phi;</sup> = |C|<sup>&phi;&minus;1</sup></span>. &#9632;
          </CollapsibleBlock>
        </div>

        <div className="theorem-block theorem">
          <div className="thm-head">
            <strong>Theorem 4.2</strong> (Linear Convergence of the Bisection Method).
          </div>
          <div className="thm-content">
            On any initial bracket <span className="math-inline">[l₀, r₀]</span> with{' '}
            <span className="math-inline">f(l₀)f(r₀) &lt; 0</span>, the bisection midpoint sequence{' '}
            <span className="math-inline">xₙ = (lₙ + rₙ)/2</span> satisfies{' '}
            <span className="math-inline">rₙ &minus; lₙ = (r₀ &minus; l₀)/2ⁿ</span> and converges with
            linear order <span className="math-inline">q = 1</span> and rate{' '}
            <span className="math-inline">&mu; = 1/2</span>.
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section className="paper-section" id="sec-pfp">
        <h2 className="sec-heading">
          <span className="sec-num">5.</span> The Polynomial Factorization Procedure (PFP)
        </h2>

        <figure className="paper-figure single-fig">
          <img src="./figures/PFPexample.png" alt="PFP partitioning f(x) = x^3 + x^2" />
          <figcaption>
            <strong>Figure 6.</strong> PFP partitioning <span className="math-inline">f(x) = x³ + x²</span>{' '}
            by critical points <span className="math-inline">c₁ = &minus;2/3</span> and{' '}
            <span className="math-inline">c₂ = 0</span>, detecting double root{' '}
            <span className="math-inline">&alpha;₂ = 0 (m = 2)</span> and simple root{' '}
            <span className="math-inline">&alpha;₁ = &minus;1 (m = 1)</span>.
          </figcaption>
        </figure>

        <div className="theorem-block theorem">
          <div className="thm-head">
            <strong>Theorem 5.1</strong> (Completeness &amp; Exact Multiplicity Recovery of PFP).
          </div>
          <div className="thm-content">
            For any real polynomial <span className="math-inline">f(x)</span> of degree{' '}
            <span className="math-inline">n &ge; 1</span>, the Polynomial Factorization Procedure
            isolates and approximates all real roots along with their exact multiplicities.
          </div>
          <CollapsibleBlock>
            By Proposition 2.1, all real roots lie within <span className="math-inline">(&minus;M_f, M_f)</span>.
            By Lemma 2.7, every root of multiplicity <span className="math-inline">m &gt; 1</span> is a
            root of <span className="math-inline">f&apos;(x)</span> of multiplicity{' '}
            <span className="math-inline">m &minus; 1</span> and is therefore identified at the
            critical-point check <span className="math-inline">|f(cᵢ)| = 0</span>. By Corollary 2.4, at
            most one simple root lies strictly between consecutive critical points{' '}
            <span className="math-inline">(cᵢ, cᵢ₊₁)</span>, and since <span className="math-inline">f</span>{' '}
            is strictly monotonic on <span className="math-inline">(cᵢ, cᵢ₊₁)</span>, a simple root
            exists in <span className="math-inline">(cᵢ, cᵢ₊₁)</span> iff <span className="math-inline">f</span>{' '}
            changes sign across the interval. Proposition 3.4 then guarantees that Algorithm 1 selects
            an initial guess in the monotone basin of attraction, ensuring quadratic convergence to
            each simple root. &#9632;
          </CollapsibleBlock>
        </div>
      </section>

      {/* Section 6: Optimizations */}
      <section className="paper-section" id="sec-optimizations">
        <h2 className="sec-heading">
          <span className="sec-num">6.</span> Algorithmic Optimizations, Tighter Root Bounds &amp; Complexity
        </h2>
        <p className="paper-p">
          We further refine the baseline PFP algorithm in three provably optimal ways: tightening the
          global root search bound via <span className="math-inline">&ell;<sub>&infin;</sub></span> Cauchy
          and Fujiwara radical bounds, eliminating critical-point endpoint singularities via
          inflection-point tangent landing, and collapsing the recursive derivative tree from{' '}
          <span className="math-inline">&Theta;(&phi;ⁿ)</span> to{' '}
          <span className="math-inline">&#927;(n²)</span> via bottom-up dynamic programming.
        </p>

        <div className="theorem-block proposition">
          <div className="thm-head">
            <strong>Proposition 6.1</strong> (Tighter <span className="math-inline">&ell;<sub>&infin;</sub></span> Cauchy &amp; Fujiwara Radical Bounds).
          </div>
          <div className="thm-content">
            Every root <span className="math-inline">&alpha;</span> of{' '}
            <span className="math-inline">p(x) = &sum;<sub>r=0</sub><sup>n</sup> aᵣ xʳ</span> satisfies{' '}
            <span className="math-inline">|&alpha;| &le; min&#123; Mₚ, M<sub>&infin;</sub>(p), M<sub>F</sub>(p) &#125;</span>, where
            <div className="math-display">
              M<sub>&infin;</sub>(p) = 1 + max<sub>0&le;r&lt;n</sub> |a<sub>r</sub>/a<sub>n</sub>|, &nbsp;&nbsp;
              M<sub>F</sub>(p) = 2 max&#123; |a<sub>n&minus;1</sub>/a<sub>n</sub>|, |a<sub>n&minus;2</sub>/a<sub>n</sub>|<sup>1/2</sup>, &hellip;, |a<sub>0</sub>/(2a<sub>n</sub>)|<sup>1/n</sup> &#125;.
            </div>
          </div>
          <CollapsibleBlock>
            Let <span className="math-inline">bᵣ = |aᵣ/aₙ|</span> and{' '}
            <span className="math-inline">B = max<sub>r&lt;n</sub> bᵣ</span>. For{' '}
            <span className="math-inline">|&alpha;| &gt; 1</span>, summing the geometric series gives{' '}
            <span className="math-inline">
              |&alpha;|ⁿ &le; B &sum;<sub>r=0</sub><sup>n&minus;1</sup> |&alpha;|ʳ &lt; B |&alpha;|ⁿ / (|&alpha;| &minus; 1) &rArr; |&alpha;| &lt; 1 + B = M<sub>&infin;</sub>(p)
            </span>
            . For Fujiwara&apos;s bound, if <span className="math-inline">|&alpha;| &gt; M<sub>F</sub>(p)</span>,
            then <span className="math-inline">b<sub>n&minus;k</sub> &lt; (|&alpha;|/2)ᵏ</span> for{' '}
            <span className="math-inline">1 &le; k &le; n &minus; 1</span> and{' '}
            <span className="math-inline">b₀ &lt; 2(|&alpha;|/2)ⁿ</span>, yielding the contradiction{' '}
            <span className="math-inline">
              |&alpha;|ⁿ &le; &sum; b<sub>n&minus;k</sub>|&alpha;|<sup>n&minus;k</sup> &lt; |&alpha;|ⁿ(&sum;<sub>k=1</sub><sup>n&minus;1</sup> 2<sup>&minus;k</sup> + 2 &middot; 2<sup>&minus;n</sup>) = |&alpha;|ⁿ
            </span>
            . &#9632;
          </CollapsibleBlock>
        </div>

        <div className="theorem-block proposition">
          <div className="thm-head">
            <strong>Proposition 6.2</strong> (Inflection-Point Tangent Landing Without Endpoint Singularity).
          </div>
          <div className="thm-content">
            Let <span className="math-inline">(c₁, c₂)</span> be a CCP interval containing a simple root{' '}
            <span className="math-inline">&alpha;</span> and a unique inflection point{' '}
            <span className="math-inline">&gamma; &in; (c₁, c₂)</span> with{' '}
            <span className="math-inline">p(&gamma;) &ne; 0</span>. Then{' '}
            <span className="math-inline">|p&apos;(x)|</span> attains its strict maximum on{' '}
            <span className="math-inline">[c₁, c₂]</span> at <span className="math-inline">x = &gamma;</span>,
            and one Newton step <span className="math-inline">x₁ = &Psi;ₚ(&gamma;) = &gamma; &minus; p(&gamma;)/p&apos;(&gamma;)</span>{' '}
            lands strictly inside the Fourier monotone basin where{' '}
            <span className="math-inline">sign(p(x₁)) = sign(p&apos;&apos;(x₁))</span>.
          </div>
          <CollapsibleBlock>
            Since <span className="math-inline">p&apos;&apos;(&gamma;) = 0</span> and{' '}
            <span className="math-inline">p&apos;</span> has constant sign <span className="math-inline">s</span>{' '}
            on <span className="math-inline">(c₁, c₂)</span> while vanishing at{' '}
            <span className="math-inline">c₁, c₂</span>, <span className="math-inline">|p&apos;(&gamma;)| &gt; 0</span>{' '}
            is maximized at <span className="math-inline">&gamma;</span>. By Taylor&apos;s Theorem with
            Lagrange remainder around <span className="math-inline">&gamma;</span>,{' '}
            <span className="math-inline">
              0 = p(&alpha;) = p(&gamma;) + p&apos;(&gamma;)(&alpha; &minus; &gamma;) + &frac12;p&apos;&apos;(&xi;)(&alpha; &minus; &gamma;)²
            </span>{' '}
            for some <span className="math-inline">&xi;</span> between <span className="math-inline">&gamma;</span>{' '}
            and <span className="math-inline">&alpha;</span>. Dividing by{' '}
            <span className="math-inline">p&apos;(&gamma;)</span> gives{' '}
            <span className="math-inline">
              x₁ &minus; &alpha; = [p&apos;&apos;(&xi;)/(2p&apos;(&gamma;))](&alpha; &minus; &gamma;)²
            </span>
            , so <span className="math-inline">x₁</span> lies strictly on the side of{' '}
            <span className="math-inline">&alpha;</span> where{' '}
            <span className="math-inline">sign(p(x₁)) = sign(p&apos;&apos;(x₁))</span>. &#9632;
          </CollapsibleBlock>
        </div>

        <div className="theorem-block theorem">
          <div className="thm-head">
            <strong>Theorem 6.3</strong> (Quadratic <span className="math-inline">&#927;(n²)</span> Complexity of Bottom-Up Dynamic Programming PFP).
          </div>
          <div className="thm-content">
            Precomputing the derivative tower <span className="math-inline">Pₖ = f<sup>(k)</sup></span>{' '}
            (<span className="math-inline">k = 0, &hellip;, n &minus; 1</span>) and solving from{' '}
            <span className="math-inline">k = n &minus; 1</span> down to{' '}
            <span className="math-inline">0</span> by reusing <span className="math-inline">R<sub>k+1</sub></span>{' '}
            (critical points of <span className="math-inline">Pₖ</span>) and{' '}
            <span className="math-inline">R<sub>k+2</sub></span> (inflection points of{' '}
            <span className="math-inline">Pₖ</span>) reduces the number of polynomial levels solved
            from <span className="math-inline">&Theta;(&phi;ⁿ)</span> to <span className="math-inline">n &minus; 1</span>,
            requiring at most <span className="math-inline">&sum;<sub>k=0</sub><sup>n&minus;2</sup>(n &minus; k) = n(n+1)/2 &minus; 1 = &#927;(n²)</span>{' '}
            bracket solves.
          </div>
          <CollapsibleBlock>
            In naive recursive PFP, level <span className="math-inline">k</span> invokes both{' '}
            <span className="math-inline">PFP(P<sub>k+1</sub>)</span> and{' '}
            <span className="math-inline">PFP(P<sub>k+2</sub>)</span>, satisfying the Fibonacci
            recurrence <span className="math-inline">T(n) = T(n&minus;1) + T(n&minus;2) = &Theta;(&phi;ⁿ)</span>.
            Because <span className="math-inline">P<sub>k+2</sub> = (P<sub>k+1</sub>)&apos;</span>,
            memoizing the root list <span className="math-inline">Rₖ</span> at each level ensures each
            derivative <span className="math-inline">Pₖ</span> of degree{' '}
            <span className="math-inline">d = n &minus; k</span> is partitioned into at most{' '}
            <span className="math-inline">d</span> monotone intervals exactly once, summing to{' '}
            <span className="math-inline">&sum;<sub>d=2</sub><sup>n</sup> d = n(n+1)/2 &minus; 1 = &#927;(n²)</span>. &#9632;
          </CollapsibleBlock>
        </div>
      </section>

      {/* Section 7: Acknowledgements */}
      <section className="paper-section" id="sec-ack">
        <h2 className="sec-heading">
          <span className="sec-num">7.</span> Acknowledgements
        </h2>
        <p className="paper-p">
          I would like to thank Bryce Hancock and Darren Yao for early in-class discussions and
          collaboration on the initial Secant and Bisection method examples and tables during the
          Fall 2023 seminar. I also want to thank our mentors, Dominique Maldague and Thomas
          Pickering, for their incredible support and guidance on both the technical and
          non-technical parts of this research.
        </p>
      </section>
    </article>
  );
}
