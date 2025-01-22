import React, { useState } from 'react';

interface CollapsibleProofProps {
  label?: string;
  children: React.ReactNode;
}

function CollapsibleProof({ label = 'Proof', children }: CollapsibleProofProps): React.ReactElement {
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

export function PreliminariesPage(): React.ReactElement {
  return (
    <article className="manuscript-body">
      <div className="prelim-intro-box">
        <strong>Reader&apos;s Guide to Preliminaries.</strong> This foundational reference introduces
        every algebraic and real-analytic concept used throughout our paper from first principles:
        univariate polynomials, Horner&apos;s scheme, continuity, the Intermediate Value Theorem
        (IVT), differentiability, Rolle&apos;s Theorem, the Mean Value Theorem (MVT), Taylor
        expansions, root multiplicity, and the Monotone Convergence Theorem. Click{' '}
        <strong>▸ Show Proof / Derivation</strong> on any statement to inspect its step-by-step
        derivation.
      </div>

      {/* Module 1: Polynomials & Degree */}
      <section className="paper-section">
        <h2 className="sec-heading">
          <span className="sec-num">P1.</span> Polynomials, Degree, Roots &amp; Horner&apos;s Evaluation
        </h2>
        <p className="paper-p">
          A polynomial is built from only two arithmetic operations—addition and multiplication—applied
          to a variable <span className="math-inline">x</span> and constant coefficients. Because it has
          no denominators or radicals in <span className="math-inline">x</span>, it is defined, smooth,
          and differentiable across the entire real line <span className="math-inline">&#8477;</span>.
        </p>

        <div className="theorem-block definition">
          <div className="thm-head">
            <strong>Definition P1.1</strong> (Univariate Polynomial &amp; Degree).
          </div>
          <div className="thm-content">
            A <em>univariate polynomial</em> over <span className="math-inline">&#8477;</span> is a
            function <span className="math-inline">p : &#8477; &rarr; &#8477;</span> of the form
            <div className="math-display">
              p(x) = a<sub>n</sub>x<sup>n</sup> + a<sub>n&minus;1</sub>x<sup>n&minus;1</sup> + &hellip; + a<sub>1</sub>x + a<sub>0</sub> = &sum;<sub>r=0</sub><sup>n</sup> a<sub>r</sub>x<sup>r</sup>,
            </div>
            where <span className="math-inline">a₀, a₁, &hellip;, aₙ &in; &#8477;</span> are coefficients.
            When the leading coefficient <span className="math-inline">aₙ &ne; 0</span>, the integer{' '}
            <span className="math-inline">n = deg(p) = max&#123; r &mid; aᵣ &ne; 0 &#125;</span> is called
            the <strong>degree</strong> of <span className="math-inline">p</span>. If{' '}
            <span className="math-inline">aₙ = 1</span>, the polynomial is called <strong>monic</strong>.
          </div>
        </div>

        <div className="theorem-block definition">
          <div className="thm-head">
            <strong>Definition P1.2</strong> (Root / Zero of a Polynomial).
          </div>
          <div className="thm-content">
            A number <span className="math-inline">&alpha;</span> is called a <strong>root</strong> (or{' '}
            <em>zero</em>) of <span className="math-inline">p(x)</span> if{' '}
            <span className="math-inline">p(&alpha;) = 0</span>. Geometrically, real roots are the exact{' '}
            <span className="math-inline">x</span>-intercepts where the graph{' '}
            <span className="math-inline">y = p(x)</span> touches or crosses the horizontal axis{' '}
            <span className="math-inline">y = 0</span>.
          </div>
        </div>

        <div className="theorem-block proposition">
          <div className="thm-head">
            <strong>Proposition P1.3</strong> (Factor Theorem &amp; Euclidean Division).
          </div>
          <div className="thm-content">
            For any polynomial <span className="math-inline">p(x)</span> of degree{' '}
            <span className="math-inline">n &ge; 1</span> and any number{' '}
            <span className="math-inline">&alpha;</span>, dividing <span className="math-inline">p(x)</span>{' '}
            by <span className="math-inline">(x &minus; &alpha;)</span> yields a unique quotient
            polynomial <span className="math-inline">q(x)</span> of degree{' '}
            <span className="math-inline">n &minus; 1</span> and a constant remainder{' '}
            <span className="math-inline">R = p(&alpha;)</span>:
            <div className="math-display">
              p(x) = (x &minus; &alpha;) q(x) + p(&alpha;).
            </div>
            In particular, <span className="math-inline">&alpha;</span> is a root of{' '}
            <span className="math-inline">p(x)</span> if and only if{' '}
            <span className="math-inline">(x &minus; &alpha;)</span> divides{' '}
            <span className="math-inline">p(x)</span> exactly (<span className="math-inline">p(x) = (x &minus; &alpha;)q(x)</span>).
          </div>
          <CollapsibleProof label="Proof & Horner's O(n) Evaluation">
            By the algebraic identity{' '}
            <span className="math-inline">
              xʳ &minus; &alpha;ʳ = (x &minus; &alpha;)(x<sup>r&minus;1</sup> + &alpha;x<sup>r&minus;2</sup> + &hellip; + &alpha;<sup>r&minus;1</sup>)
            </span>
            , subtracting <span className="math-inline">p(&alpha;)</span> from{' '}
            <span className="math-inline">p(x)</span> gives
            <div className="math-display">
              p(x) &minus; p(&alpha;) = &sum;<sub>r=1</sub><sup>n</sup> a<sub>r</sub>(x<sup>r</sup> &minus; &alpha;<sup>r</sup>) = (x &minus; &alpha;) q(x).
            </div>
            Thus <span className="math-inline">p(&alpha;) = 0 &hArr; p(x) = (x &minus; &alpha;)q(x)</span>.
            Moreover, nested <strong>Horner&apos;s evaluation</strong> rewrites{' '}
            <span className="math-inline">
              p(x) = (((aₙ x + aₙ₋₁)x + aₙ₋₂)x + &hellip;)x + a₀
            </span>
            , evaluating both <span className="math-inline">p(&alpha;)</span> and the deflated quotient{' '}
            <span className="math-inline">q(x)</span> in exactly <span className="math-inline">n</span>{' '}
            multiplications and <span className="math-inline">n</span> additions (<span className="math-inline">&#927;(n)</span>). &#9632;
          </CollapsibleProof>
        </div>

        <div className="theorem-block corollary">
          <div className="thm-head">
            <strong>Corollary P1.4</strong> (Fundamental Bound on Real Roots).
          </div>
          <div className="thm-content">
            A nonzero polynomial <span className="math-inline">p(x)</span> of degree{' '}
            <span className="math-inline">n</span> has <strong>at most n real roots</strong> (counted
            with multiplicity).
          </div>
        </div>
      </section>

      {/* Module 2: Continuity & IVT */}
      <section className="paper-section">
        <h2 className="sec-heading">
          <span className="sec-num">P2.</span> Continuity &amp; the Intermediate Value Theorem (IVT)
        </h2>
        <p className="paper-p">
          How do we know a root exists inside an interval <span className="math-inline">[a, b]</span>{' '}
          without solving for it algebraically? Because polynomials are continuous everywhere, their
          graphs cannot jump across the <span className="math-inline">x</span>-axis without intersecting it.
        </p>

        <div className="theorem-block definition">
          <div className="thm-head">
            <strong>Definition P2.1</strong> (&epsilon;&ndash;&delta; Continuity).
          </div>
          <div className="thm-content">
            A function <span className="math-inline">f : &#8477; &rarr; &#8477;</span> is{' '}
            <strong>continuous at x₀</strong> if for every tolerance{' '}
            <span className="math-inline">&epsilon; &gt; 0</span>, there exists a radius{' '}
            <span className="math-inline">&delta; &gt; 0</span> such that for all{' '}
            <span className="math-inline">x &in; (x₀ &minus; &delta;, x₀ + &delta;)</span>,{' '}
            <span className="math-inline">|f(x) &minus; f(x₀)| &lt; &epsilon;</span>. Every polynomial
            is continuous at every point <span className="math-inline">x₀ &in; &#8477;</span>.
          </div>
        </div>

        <div className="theorem-block theorem">
          <div className="thm-head">
            <strong>Theorem P2.2</strong> (Intermediate Value Theorem &amp; Bolzano&apos;s Sign-Change Corollary).
          </div>
          <div className="thm-content">
            Let <span className="math-inline">f</span> be continuous on a closed interval{' '}
            <span className="math-inline">[a, b]</span>. For any value <span className="math-inline">Y</span>{' '}
            strictly between <span className="math-inline">f(a)</span> and{' '}
            <span className="math-inline">f(b)</span>, there exists at least one point{' '}
            <span className="math-inline">c &in; (a, b)</span> such that{' '}
            <span className="math-inline">f(c) = Y</span>. In particular, if{' '}
            <span className="math-inline">f(a)</span> and <span className="math-inline">f(b)</span>{' '}
            have <strong>opposite signs</strong> (<span className="math-inline">f(a) &middot; f(b) &lt; 0</span>),
            then <span className="math-inline">f</span> has <strong>at least one root</strong>{' '}
            <span className="math-inline">&alpha; &in; (a, b)</span>.
          </div>
          <CollapsibleProof label="Intuition & Role in Bisection and PFP">
            If <span className="math-inline">f(a) &lt; 0</span> and{' '}
            <span className="math-inline">f(b) &gt; 0</span>, the set{' '}
            <span className="math-inline">S = &#123; x &in; [a, b] &mid; f(x) &le; 0 &#125;</span> is
            non-empty and bounded above by <span className="math-inline">b</span>. By the Completeness
            Axiom of <span className="math-inline">&#8477;</span>, <span className="math-inline">S</span>{' '}
            has a least upper bound <span className="math-inline">&alpha; = sup S &in; (a, b)</span>,
            and continuity forces <span className="math-inline">f(&alpha;) = 0</span>. In our paper,
            this is the foundation of both the <strong>Bisection Method</strong> (Section 5) and the
            sign-change check across critical-point intervals in <strong>PFP</strong> (Section 6). &#9632;
          </CollapsibleProof>
        </div>
      </section>

      {/* Module 3: Derivatives, Rolle's Theorem, MVT, and Critical Points */}
      <section className="paper-section">
        <h2 className="sec-heading">
          <span className="sec-num">P3.</span> Derivatives, Critical Points, Rolle&apos;s Theorem &amp; MVT
        </h2>
        <p className="paper-p">
          While the Intermediate Value Theorem tells us <em>at least one</em> root lies in a
          sign-changing interval, it does not tell us <em>how many</em> roots could be hiding inside.
          To guarantee <strong>at most one</strong> root per interval, we use the first derivative{' '}
          <span className="math-inline">p&apos;(x)</span> and Rolle&apos;s Theorem.
        </p>

        <div className="theorem-block definition">
          <div className="thm-head">
            <strong>Definition P3.1</strong> (Derivative &amp; Critical Points of a Polynomial).
          </div>
          <div className="thm-content">
            The derivative of <span className="math-inline">f(x)</span> at{' '}
            <span className="math-inline">x</span> is the instantaneous slope of its tangent line:
            <div className="math-display">
              f&apos;(x) = lim<sub>h&rarr;0</sub> [ f(x + h) &minus; f(x) ] / h.
            </div>
            For a polynomial <span className="math-inline">p(x) = &sum;<sub>r=0</sub><sup>n</sup> aᵣ xʳ</span>,
            its derivative is the degree <span className="math-inline">n &minus; 1</span> polynomial{' '}
            <span className="math-inline">p&apos;(x) = &sum;<sub>r=1</sub><sup>n</sup> r aᵣ x<sup>r&minus;1</sup></span>.
            A point <span className="math-inline">c</span> where <span className="math-inline">p&apos;(c) = 0</span>{' '}
            is called a <strong>critical point</strong> (local maximum, local minimum, or horizontal
            stationary point).
          </div>
        </div>

        <div className="theorem-block theorem">
          <div className="thm-head">
            <strong>Theorem P3.2</strong> (Rolle&apos;s Theorem &amp; the Mean Value Theorem).
          </div>
          <div className="thm-content">
            If <span className="math-inline">f</span> is continuous on <span className="math-inline">[a, b]</span>{' '}
            and differentiable on <span className="math-inline">(a, b)</span>, then there exists{' '}
            <span className="math-inline">c &in; (a, b)</span> such that
            <div className="math-display">
              f&apos;(c) = [ f(b) &minus; f(a) ] / (b &minus; a).
            </div>
            In particular (<strong>Rolle&apos;s Theorem</strong>), if <span className="math-inline">f(a) = f(b) = 0</span>,
            then there exists a critical point <span className="math-inline">c &in; (a, b)</span> where{' '}
            <span className="math-inline">f&apos;(c) = 0</span>.
          </div>
          <CollapsibleProof label="Proof & Why CCPs Partition Roots Uniquely">
            If <span className="math-inline">f</span> is constant on <span className="math-inline">[a, b]</span>,
            then <span className="math-inline">f&apos;(c) = 0</span> everywhere. Otherwise, by the
            Extreme Value Theorem, <span className="math-inline">f</span> attains an interior maximum or
            minimum at some <span className="math-inline">c &in; (a, b)</span>, where Fermat&apos;s
            theorem forces <span className="math-inline">f&apos;(c) = 0</span>. Because any two roots must
            have a critical point between them, on any interval <span className="math-inline">(c₁, c₂)</span>{' '}
            containing <em>no</em> critical points, <span className="math-inline">p(x)</span> is strictly
            monotonic and can cross the <span className="math-inline">x</span>-axis <strong>at most once</strong>! &#9632;
          </CollapsibleProof>
        </div>
      </section>

      {/* Module 4: Second Derivative, Inflection Points & Taylor Series */}
      <section className="paper-section">
        <h2 className="sec-heading">
          <span className="sec-num">P4.</span> Concavity, Inflection Points &amp; Taylor&apos;s Theorem
        </h2>

        <div className="theorem-block definition">
          <div className="thm-head">
            <strong>Definition P4.1</strong> (Second Derivative &amp; Inflection Points).
          </div>
          <div className="thm-content">
            The second derivative <span className="math-inline">p&apos;&apos;(x) = (p&apos;(x))&apos;</span>{' '}
            measures the rate of change of the slope (concavity): when{' '}
            <span className="math-inline">p&apos;&apos;(x) &gt; 0</span>, the curve bends upward
            (convex) and lies <em>above</em> its tangent lines; when{' '}
            <span className="math-inline">p&apos;&apos;(x) &lt; 0</span>, it bends downward (concave)
            and lies <em>below</em> its tangent lines. A root <span className="math-inline">&gamma;</span>{' '}
            of <span className="math-inline">p&apos;&apos;(&gamma;) = 0</span> where concavity changes
            sign is called a <strong>point of inflection</strong>.
          </div>
        </div>

        <div className="theorem-block theorem">
          <div className="thm-head">
            <strong>Theorem P4.2</strong> (Taylor&apos;s Expansion for Polynomials).
          </div>
          <div className="thm-content">
            Any polynomial <span className="math-inline">p(x)</span> of degree <span className="math-inline">n</span>{' '}
            can be expanded exactly around any center <span className="math-inline">a &in; &#8477;</span> as
            <div className="math-display">
              p(x) = p(a) + p&apos;(a)(x &minus; a) + [p&apos;&apos;(a)/2!](x &minus; a)² + &hellip; + [p<sup>(n)</sup>(a)/n!](x &minus; a)<sup>n</sup>.
            </div>
          </div>
          <CollapsibleProof label="Why Taylor Expansion Governs Newton & Secant Speed">
            When <span className="math-inline">a = &alpha;</span> is a simple root (<span className="math-inline">p(&alpha;) = 0, p&apos;(&alpha;) &ne; 0</span>)
            and <span className="math-inline">eₙ = xₙ &minus; &alpha;</span> is small,{' '}
            <span className="math-inline">p(xₙ) &approx; p&apos;(&alpha;)eₙ + &frac12;p&apos;&apos;(&alpha;)eₙ²</span>.
            The linear term <span className="math-inline">p&apos;(&alpha;)eₙ</span> is canceled exactly by
            Newton&apos;s tangent step <span className="math-inline">xₙ &minus; p(xₙ)/p&apos;(xₙ)</span>,
            leaving only the quadratic error <span className="math-inline">O(eₙ²)</span>! &#9632;
          </CollapsibleProof>
        </div>
      </section>

      {/* Module 5: Sequences & Monotone Convergence Theorem */}
      <section className="paper-section">
        <h2 className="sec-heading">
          <span className="sec-num">P5.</span> Sequences, Limits &amp; the Monotone Convergence Theorem
        </h2>

        <div className="theorem-block theorem">
          <div className="thm-head">
            <strong>Theorem P5.1</strong> (Monotone Convergence Theorem for Real Sequences).
          </div>
          <div className="thm-content">
            If a sequence of real numbers <span className="math-inline">{'{xₙ}'}</span> is{' '}
            <strong>monotonically increasing</strong> (<span className="math-inline">x₀ &le; x₁ &le; x₂ &le; &hellip;</span>)
            and <strong>bounded above</strong> (<span className="math-inline">xₙ &le; M</span>), or{' '}
            <strong>monotonically decreasing</strong> and <strong>bounded below</strong>, then{' '}
            <span className="math-inline">{'{xₙ}'}</span> is guaranteed to converge to a finite real limit{' '}
            <span className="math-inline">&alpha; = lim<sub>n&rarr;&infin;</sub> xₙ</span>.
          </div>
          <CollapsibleProof label="Role in Proving Guaranteed Newton Convergence (Lemma 3.2)">
            In Lemma 3.2 of our paper, we show that whenever{' '}
            <span className="math-inline">&Psi;&apos;ₚ(x) = p(x)p&apos;&apos;(x)/(p&apos;(x))² &gt; 0</span>{' '}
            on an interval containing a root <span className="math-inline">&alpha;</span>, Newton&apos;s
            iterates satisfy <span className="math-inline">x₀ &lt; x₁ &lt; x₂ &lt; &hellip; &le; &alpha;</span>{' '}
            (if <span className="math-inline">x₀ &lt; &alpha;</span>) or{' '}
            <span className="math-inline">x₀ &gt; x₁ &gt; x₂ &gt; &hellip; &ge; &alpha;</span> (if{' '}
            <span className="math-inline">x₀ &gt; &alpha;</span>). By the Monotone Convergence Theorem,
            the sequence cannot oscillate or diverge—it must converge directly to{' '}
            <span className="math-inline">&alpha;</span>. &#9632;
          </CollapsibleProof>
        </div>
      </section>
    </article>
  );
}
