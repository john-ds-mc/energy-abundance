"use client";

const MONO = "var(--font-mono), 'JetBrains Mono', 'Fira Code', monospace";
const SANS = "var(--font-sans), 'Space Grotesk', system-ui, sans-serif";
const TEAL = "#4ecdc4";

const S = {
  wrap: { maxWidth: 820, margin: "0 auto", padding: "0 20px 60px", lineHeight: 1.75, fontSize: 15, fontFamily: SANS, color: "#c8cdd5" } as const,
  h1: { fontSize: 32, fontWeight: 800, color: "#e8ecf2", lineHeight: 1.2, marginTop: 48, marginBottom: 8, letterSpacing: "-0.02em" } as const,
  h2: { fontSize: 22, fontWeight: 700, color: TEAL, lineHeight: 1.3, marginTop: 40, marginBottom: 12, borderBottom: "1px solid rgba(78,205,196,0.15)", paddingBottom: 8 } as const,
  h3: { fontSize: 17, fontWeight: 700, color: "#e8ecf2", lineHeight: 1.4, marginTop: 28, marginBottom: 8 } as const,
  h4: { fontSize: 15, fontWeight: 700, color: "#a0aab8", marginTop: 20, marginBottom: 6, fontFamily: MONO, letterSpacing: "0.02em" } as const,
  p: { marginTop: 0, marginBottom: 14 } as const,
  bq: { borderLeft: `3px solid ${TEAL}`, paddingLeft: 16, margin: "20px 0", color: "#9aa3b0", fontStyle: "italic" as const, background: "rgba(78,205,196,0.04)", padding: "12px 16px", borderRadius: "0 8px 8px 0" } as const,
  li: { marginBottom: 6 } as const,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13, fontFamily: MONO, margin: "16px 0" } as const,
  th: { padding: "8px 10px", textAlign: "left" as const, borderBottom: `1px solid ${TEAL}33`, color: TEAL, fontWeight: 600, fontSize: 11, letterSpacing: "0.05em" } as const,
  td: { padding: "6px 10px", borderBottom: "1px solid rgba(78,205,196,0.08)", color: "#9aa3b0", fontSize: 12 } as const,
  hr: { border: "none", borderTop: "1px solid rgba(78,205,196,0.1)", margin: "32px 0" } as const,
  strong: { color: "#e8ecf2", fontWeight: 700 } as const,
  meta: { fontSize: 13, fontFamily: MONO, color: "#5a6578", marginBottom: 4 } as const,
};

export default function WhitePaper() {
  return (
    <div style={S.wrap}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ ...S.h1, fontSize: 36, marginTop: 20 }}>Breaking the Doom Loop</h1>
        <p style={{ fontSize: 17, color: "#8892a4", marginTop: 8, marginBottom: 4 }}>
          Energy, Compute, and Institutional Reform: A Programme for British Renewal
        </p>
        <p style={S.meta}>Version 2.0 — March 2026</p>
        <p style={{ ...S.meta, fontStyle: "italic" }}>
          Incorporating realistic timelines, stress-tested fiscal assumptions, data centre strategy, and downside risk analysis.
        </p>
      </div>

      <hr style={S.hr} />

      <h2 style={S.h2}>Executive Summary</h2>
      <p style={S.p}>Britain is caught in a doom loop. Expensive energy makes industry uncompetitive. Low productivity suppresses tax revenue. Insufficient revenue forces higher taxes and lower investment. Lower investment perpetuates low productivity. Meanwhile, an ageing population and rising welfare dependency consume an ever-growing share of national income, crowding out the capital expenditure that could break the cycle.</p>
      <p style={S.p}>This paper proposes a coherent programme to break that loop through four reinforcing pillars:</p>
      <ol>
        <li style={S.li}><strong style={S.strong}>A state-financed nuclear fleet</strong> delivering the cheapest clean energy in Europe</li>
        <li style={S.li}><strong style={S.strong}>A strategy to make Britain the world&apos;s premier AI compute hub</strong>, using surplus electricity to attract global data centre investment</li>
        <li style={S.li}><strong style={S.strong}>Comprehensive welfare and spending reform</strong> that redirects resources from consumption to investment</li>
        <li style={S.li}><strong style={S.strong}>Tax restructuring</strong> for global competitiveness</li>
      </ol>
      <p style={S.p}>This is the honest version. It uses realistic construction timelines, applies historical discount rates to welfare reform savings, identifies specific implementation risks, and presents three scenarios rather than a single optimistic projection. The programme works under the central scenario and remains worth pursuing even under the pessimistic case. It does not work as cleanly or quickly as simpler versions of this argument suggest.</p>

      <table style={S.table}>
        <thead><tr><th style={S.th}>Metric</th><th style={S.th}>Target</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Nuclear capacity</td><td style={S.td}>50 GW (20-year programme)</td></tr>
          <tr><td style={S.td}>Reform savings</td><td style={S.td}>£70–90bn annually by year 10</td></tr>
          <tr><td style={S.td}>Growth target</td><td style={S.td}>2.8–3.0% (central estimate)</td></tr>
          <tr><td style={S.td}>Data centres</td><td style={S.td}>10–20 GW attracted</td></tr>
          <tr><td style={S.td}>Debt/GDP</td><td style={S.td}>~88% by year 10 (net of nuclear asset)</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>What Changed From Version 1.0</h3>
      <ul>
        <li style={S.li}><strong style={S.strong}>Nuclear timeline extended.</strong> First reactor commissions in year 5–6, not year 3. 15–20 GW online by year 10, not 50 GW. Full fleet of 50 GW is a 20-year programme. The binding constraint is workforce, not regulation or cooling water.</li>
        <li style={S.li}><strong style={S.strong}>Welfare savings discounted.</strong> Historical evidence shows UK welfare reforms deliver 40–70% of projected savings. Central estimate: £70–90 billion per year by year 10, not £150 billion.</li>
        <li style={S.li}><strong style={S.strong}>Data centre strategy added.</strong> The wind-nuclear oversupply problem is solved by making Britain the world&apos;s premier AI compute hub. 10–20 GW of data centre demand absorbs surplus electricity, attracts £50–100 billion in private investment, and creates the concrete mechanism for growth.</li>
        <li style={S.li}><strong style={S.strong}>Fiscal position is tighter.</strong> The reformed deficit is worse than baseline for years 1–7, only outperforming from year 8 onwards. Debt/GDP peaks at 108–112% before declining. This is the honest trajectory.</li>
        <li style={S.li}><strong style={S.strong}>AI public sector savings halved.</strong> Government IT modernisation costs are higher than initially modelled, union resistance slows deployment, and accountability requirements reduce efficiency gains. Realistic savings: £10–18 billion, not £31 billion.</li>
      </ul>

      <div style={S.bq}>
        <strong style={S.strong}>Core argument:</strong> the programme&apos;s strategic logic survives stress-testing even though the fiscal timeline is slower than initially modelled. The question is not whether to pursue it but how to manage the transition period honestly.
      </div>

      <hr style={S.hr} />

      <h2 style={S.h2}>1. The Doom Loop: Britain&apos;s Structural Decline</h2>

      <h3 style={S.h3}>The Productivity Collapse</h3>
      <p style={S.p}>UK trend growth has been approximately 1.0–1.5% for fifteen years, roughly half the rate achieved between 1995 and 2007. The proximate causes are clear: chronically weak business investment (the lowest in the G7 as a share of GDP), an economy skewed toward low-productivity services, and an institutional environment that penalises investment through expensive energy, restrictive planning, and policy instability.</p>

      <h3 style={S.h3}>The Energy Crisis</h3>
      <p style={S.p}>The UK has the most expensive industrial electricity in the G7, at roughly two to three times US prices. This is the master constraint. Expensive energy makes manufacturing uncompetitive, repels data centre investment, inflates the cost of living, and renders electrification of heating and transport unaffordable. Every hyperscaler considering a European data centre location currently chooses Scandinavia, France, or Ireland over the UK because of energy costs. Every growth ambition founders on the same problem: the power isn&apos;t cheap enough.</p>

      <h3 style={S.h3}>The Welfare Ratchet</h3>
      <p style={S.p}>Total UK welfare spending is forecast at £334 billion in 2025/26 (10.6% of GDP). The State Pension costs £146 billion and grows at approximately 6% annually under the triple lock. PIP caseloads have nearly doubled since 2019 with mental health claims tripling. Approximately 5,000 people per day are being signed onto long-term sickness benefits. Health-related benefit spending is projected to reach 1.9% of GDP by 2030.</p>
      <p style={S.p}>This spending is not merely large; it is structurally accelerating. The triple lock creates a ratchet mechanism on pension costs that compounds above both inflation and earnings growth. The benefit system&apos;s response to rising sickness — indefinite cash transfers without treatment requirements — entrenches rather than resolves the underlying problem.</p>

      <h3 style={S.h3}>The Wind Paradox</h3>
      <p style={S.p}>The UK has approximately 30 GW of installed wind capacity with another 20–30 GW contracted through Contracts for Difference (CfDs). On a windy day, wind can supply most of UK demand. On a calm day, it produces almost nothing and gas fills the gap. The system works because gas provides the flexibility that compensates for wind&apos;s intermittency. But this creates a structural dependency on gas that keeps energy prices high, exposes the UK to global gas market volatility, and makes genuine decarbonisation impossible.</p>
      <p style={S.p}>Simultaneously, the CfD contracts that guarantee wind farm revenues represent tens of billions in committed payments regardless of whether the electricity is needed. As nuclear capacity grows, surplus wind output will increasingly need to be curtailed — with the taxpayer paying wind farms not to produce. This is an unavoidable legacy cost of past policy decisions. The question is how to minimise it and extract value from the surplus.</p>

      <hr style={S.hr} />

      <h2 style={S.h2}>2. Pillar One: The Nuclear Programme</h2>

      <h3 style={S.h3}>The Strategic Case</h3>
      <p style={S.p}>Nuclear is the only proven technology capable of delivering abundant, reliable, zero-carbon electricity at scale. A nuclear fleet provides the guaranteed baseload that wind cannot: 24/7 output, independent of weather, with fuel costs so low that a doubling of uranium prices moves the cost of electricity by only 5–8%. It is the foundation upon which every other element of national renewal depends — cheap electricity for industry, for data centres, for heating, for transport, and for the AI compute infrastructure that will define economic competitiveness for decades.</p>

      <h3 style={S.h3}>The Site Advantage Nobody Discusses</h3>
      <p style={S.p}>The UK is uniquely well-suited for nuclear power. It has 19,000 miles of coastline surrounded by cold ocean water (6–17°C), ideal for reactor cooling. Strong tidal flushing disperses thermal discharge efficiently. France operates its largest nuclear station (Gravelines, six reactors, ~5.4 GW) on the English Channel — the exact same water as the Kent coast — with no cooling issues. Saudi Arabia is building reactors cooled by 30–35°C Persian Gulf water. The UK&apos;s cooling conditions are among the best in the world.</p>
      <p style={S.p}>There are approximately 25–35 physically suitable coastal sites for multi-reactor stations. The 12 existing or decommissioned nuclear sites have existing grid connections and nuclear infrastructure. Add 3–5 new coastal sites and the geography comfortably supports 50 GW.</p>

      <h3 style={S.h3}>The Honest Construction Timeline</h3>
      <div style={S.bq}>
        <strong style={S.strong}>The original version of this programme modelled 36 reactors (50 GW) online by year 10. This is not credible.</strong> France&apos;s Messmer Plan — the fastest nuclear buildout in history — commissioned 30 reactors in 10 years, starting with an existing nuclear industry and experienced workforce. The UK starts from almost nothing. The honest timeline is 15–20 GW by year 10 and 50 GW by year 20.
      </div>

      <h4 style={S.h4}>The Three Binding Constraints</h4>
      <p style={S.p}><strong style={S.strong}>Workforce.</strong> Building 10–15 reactors simultaneously requires 50,000–80,000 skilled workers: nuclear-qualified welders, steel fixers, concrete specialists, instrumentation engineers, and commissioning engineers. The UK currently has approximately none of these working on nuclear construction. Training a nuclear-qualified welder takes 2–3 years. Training a commissioning engineer takes 5+. Even with aggressive recruitment and a Korean partnership providing initial expertise, the workforce constrains construction throughput for the first 4–5 years.</p>
      <p style={S.p}><strong style={S.strong}>Grid transmission.</strong> Primary legislation solves the legal timeline for grid connections but not the physical one. Building a 400 kV transmission corridor takes 2–3 years even with unlimited planning permission. Sites near existing power stations have grid infrastructure that can be reinforced quickly. New sites need new transmission, adding £15–25 billion and 2–3 years.</p>
      <p style={S.p}><strong style={S.strong}>Supply chain.</strong> Reactor pressure vessels require specialised steel forgings from a handful of global suppliers. Global forging capacity can produce perhaps 8–12 sets per year. The UK would need to either secure a large share of global capacity through long-term contracts or invest in expanding domestic forging capability.</p>

      <h4 style={S.h4}>Realistic Fleet Build Schedule</h4>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Period</th><th style={S.th}>Activity</th><th style={S.th}>GW Online</th><th style={S.th}>Cumul. Capex</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Years 1–2</td><td style={S.td}>Legislation, site prep, workforce training, supply chain contracts</td><td style={S.td}>0</td><td style={S.td}>£35bn</td></tr>
          <tr><td style={S.td}>Years 3–4</td><td style={S.td}>4–6 sites under active construction, structural completions</td><td style={S.td}>0</td><td style={S.td}>£110bn</td></tr>
          <tr><td style={S.td}>Years 5–6</td><td style={S.td}>First 2–3 reactors commission, 8–10 under construction</td><td style={S.td}>3–4</td><td style={S.td}>£190bn</td></tr>
          <tr><td style={S.td}>Years 7–8</td><td style={S.td}>Commissioning accelerates, 12–15 under construction</td><td style={S.td}>8–12</td><td style={S.td}>£270bn</td></tr>
          <tr><td style={S.td}>Years 9–10</td><td style={S.td}>Rolling commissioning, workforce at peak</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>15–20</td><td style={S.td}>£350bn</td></tr>
          <tr><td style={S.td}>Years 11–15</td><td style={S.td}>Full production rate, learning curve mature</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>35–50</td><td style={S.td}>£550bn</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>The Cost Learning Curve: Honest Assessment</h3>
      <p style={S.p}>The model assumes overnight costs falling from £5.5bn/GW to £3.4bn/GW. This is based on Korean and French precedent where standardisation drove 30–40% cost reductions. The counterargument is serious: every Western nuclear project in the last 20 years has exhibited a &quot;negative learning curve,&quot; with each project more expensive than the last.</p>
      <p style={S.p}>The Korean cost advantage is real but partly reflects non-transferable factors: lower labour costs, less adversarial industrial relations, lighter regulation, and an integrated state supply chain. Importing Korean project management helps, but if British workers are doing the construction and UK regulators are doing the inspecting, perhaps half the Korean advantage transfers.</p>
      <div style={S.bq}><strong style={S.strong}>Downside case:</strong> costs remain at £5–6bn/GW throughout. The same £350 billion buys 60–70 GW eventually rather than 100+ GW. The programme still works but the payback period extends from 15 to 25 years.</div>

      <h3 style={S.h3}>Why State Ownership Is Correct</h3>
      <p style={S.p}>The historical evidence strongly supports state-owned energy generation combined with private industry operating on top of it. France (EDF, state-owned) delivered industrial electricity at roughly half the price of the UK&apos;s privatised market for 30 years. South Korea (KEPCO, state-owned) builds reactors at $3,000–4,000/kW versus $10,000–15,000/kW in the liberalised West.</p>
      <p style={S.p}>The structural reasons are clear. Nuclear power stations take 5–10 years to build and operate for 60 years. The investment horizon is 70+ years. No private company has a genuine 70-year investment horizon. The state can borrow at sovereign rates (4%) over 50-year terms; private developers need 8–12% equity returns, adding 30–50% to the cost. The entire premium on Hinkley Point C&apos;s £92.50/MWh strike price versus achievable state-financed costs is financing cost — the physical reactor is the same.</p>
      <p style={S.p}>The right model is state energy providing cheap baseload, with private industry operating in competitive markets on top of it. The state does what the state does well (long-horizon infrastructure at sovereign borrowing rates) and the market does what the market does well (innovation, competition, resource allocation).</p>

      <h3 style={S.h3}>Uranium: Not a Constraint</h3>
      <p style={S.p}>At any plausible deployment scale, uranium supply is not a binding constraint. Identified conventional resources total approximately 8 million tonnes at below $260/kg. Current global consumption is 60,000–65,000 tonnes per year. Seawater contains approximately 4 billion tonnes, naturally replenished at 32,000 tonnes per year. Fuel costs represent only 5–10% of nuclear&apos;s levelised cost.</p>

      <h3 style={S.h3}>Why You Would Never Stop Building</h3>
      <p style={S.p}>The assumption that energy demand is fixed is wrong. Current UK electricity demand of ~370 TWh/year reflects how much the economy can afford at current prices, not how much it wants. At £20–30/MWh — achievable with a mature nuclear fleet — demand would expand dramatically through heating electrification (100–150 TWh), transport electrification (80–100 TWh), data centres (75–150 TWh), industrial reshoring (50–100 TWh), hydrogen and synthetic fuels (50–200 TWh), and carbon capture (20–100 TWh). Total potential demand: 800–1,200+ TWh.</p>
      <p style={S.p}>The implication: 50 GW is not the endpoint. It is the beginning of a permanent nuclear construction industry that drives costs down and demand up in a reinforcing cycle.</p>

      <hr style={S.hr} />

      <h2 style={S.h2}>3. Pillar Two: Britain as the Global Compute Hub</h2>

      <h3 style={S.h3}>The Insight</h3>
      <p style={S.p}>The conventional framing of Britain&apos;s energy transition poses nuclear and wind as alternatives. In fact, building both creates a structural electricity surplus that is either a costly problem (paying wind farms not to produce) or an extraordinary economic opportunity (selling cheap electricity to the world&apos;s most valuable industry). The data centre strategy transforms the surplus from a bug into a feature.</p>

      <h3 style={S.h3}>The Global Compute Shortage</h3>
      <p style={S.p}>The binding constraint on global AI scaling is no longer chips. It is electricity. Every major AI company is scrambling to secure power for training and inference infrastructure. Northern Virginia — the world&apos;s largest data centre market — has a power connection queue exceeding 10 years. Amazon, Google, and Microsoft are exploring nuclear SMRs, reopening retired power stations, and buying coal power out of sheer desperation for watts.</p>

      <h3 style={S.h3}>The UK Proposition</h3>
      <div style={S.bq}>
        Guaranteed clean baseload at £35–40/MWh on 15-year contracts. Periodic surplus at £10–20/MWh for flexible workloads. Planning approval in months via primary legislation. Cold seawater cooling on the coast. GMT timezone serving US, European, and Asian markets. Subsea fibre connectivity to three continents. Counterparty: sovereign-backed British Energy Corporation.
      </div>
      <p style={S.p}>No other country can offer this combination. The US has cheap energy but decade-long permitting queues. Scandinavia has clean energy but limited scale and connectivity. The Gulf states have cheap energy but lack the legal framework and talent ecosystem.</p>

      <h3 style={S.h3}>Solving the Wind Integration Problem</h3>
      <p style={S.p}>By year 10, the UK will have approximately 15–20 GW of nuclear and 50–60 GW of installed wind. During high-wind periods, combined output exceeds demand. Without data centres, the surplus must be curtailed at a cost of £2–8 billion per year in CfD constraint payments. With 10–20 GW of data centre demand, the surplus is absorbed productively.</p>
      <p style={S.p}>The commercial model uses two-tier pricing. Firm power from the nuclear fleet at £35–40/MWh on long-term take-or-pay contracts. Surplus wind power during high-output periods at £10–20/MWh on an interruptible basis for flexible workloads.</p>

      <h4 style={S.h4}>The Economic Multiplier</h4>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Effect</th><th style={S.th}>Estimate</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Private investment</td><td style={S.td}>£50–100bn in data centre construction over 10–15 years</td></tr>
          <tr><td style={S.td}>Direct employment</td><td style={S.td}>30,000–100,000 jobs in operations, security, maintenance</td></tr>
          <tr><td style={S.td}>Tax revenue</td><td style={S.td}>£2–4bn/year in corporation tax, NI, income tax</td></tr>
          <tr><td style={S.td}>Service exports</td><td style={S.td}>Compute sold to global AI companies = current account improvement</td></tr>
          <tr><td style={S.td}>Tech clustering</td><td style={S.td}>AI labs, startups, and research co-locate near compute infrastructure</td></tr>
          <tr><td style={S.td}>Regional renewal</td><td style={S.td}>Coastal communities become premium AI infrastructure locations</td></tr>
        </tbody>
      </table>

      <hr style={S.hr} />

      <h2 style={S.h2}>4. Pillar Three: Welfare and Spending Reform</h2>

      <h3 style={S.h3}>The Credibility Problem</h3>
      <div style={S.bq}><strong style={S.strong}>Every major UK welfare reform in the last 30 years has delivered less than projected savings.</strong> Universal Credit&apos;s £8bn annual savings are &quot;unproven&quot; (NAO). PIP&apos;s introduction saved 7% of the target. The bedroom tax delivered roughly half of projections. This paper applies a historical discount rate of 40–60% to gross projected savings.</div>

      <h3 style={S.h3}>State Pension Reform: £25–59bn by Year 10</h3>
      <ul>
        <li style={S.li}><strong style={S.strong}>Replace triple lock with CPI + 0.5%.</strong> Preserves real-terms growth in perpetuity. Framing: &quot;The Pension Sustainability Guarantee.&quot;</li>
        <li style={S.li}><strong style={S.strong}>Accelerate State Pension age to 68 by 2033.</strong> Saves £5–10 billion at full effect.</li>
        <li style={S.li}><strong style={S.strong}>Tighter means-testing of Pension Credit.</strong> Exclude those with non-housing assets over £200,000.</li>
      </ul>

      <h3 style={S.h3}>Disability and Sickness: £6–16bn by Year 10</h3>
      <ul>
        <li style={S.li}><strong style={S.strong}>PIP reform for mild mental health conditions.</strong> Gross saving: £7.4 billion. Realistic net: £4–6 billion.</li>
        <li style={S.li}><strong style={S.strong}>UC Health: tighten Work Capability Assessment.</strong> Gross saving: £8.5 billion. Realistic net: £4–6 billion.</li>
        <li style={S.li}><strong style={S.strong}>Reinvest £2–3 billion in NHS mental health.</strong> Non-negotiable. &quot;Treatment not cheques&quot; only works if the treatment exists.</li>
        <li style={S.li}><strong style={S.strong}>National Opportunity Fund: £5 billion/year.</strong> Retraining, employment support, and transition payments.</li>
      </ul>

      <h3 style={S.h3}>Public Sector AI: £10–18bn by Year 10</h3>
      <p style={S.p}>Government IT modernisation costs are higher than initially modelled, union resistance will slow deployment, and accountability requirements reduce efficiency gains below private-sector benchmarks. The realistic range still represents the largest public sector productivity improvement in modern British history.</p>

      <h4 style={S.h4}>Total Reform Savings: Three Scenarios</h4>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Reform Category</th><th style={S.th}>Optimistic</th><th style={S.th}>Central</th><th style={S.th}>Pessimistic</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>State Pension</td><td style={S.td}>£59bn</td><td style={S.td}>£40bn</td><td style={S.td}>£25bn</td></tr>
          <tr><td style={S.td}>Disability / Sickness</td><td style={S.td}>£23bn</td><td style={S.td}>£12bn</td><td style={S.td}>£6bn</td></tr>
          <tr><td style={S.td}>Working-age / Immigration</td><td style={S.td}>£19bn</td><td style={S.td}>£12bn</td><td style={S.td}>£6bn</td></tr>
          <tr><td style={S.td}>Public Sector AI</td><td style={S.td}>£31bn</td><td style={S.td}>£14bn</td><td style={S.td}>£8bn</td></tr>
          <tr><td style={S.td}>Tax reform net cost</td><td style={S.td}>(£10bn)</td><td style={S.td}>(£18bn)</td><td style={S.td}>(£25bn)</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>TOTAL NET</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>£122bn</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>£60bn</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>£20bn</td></tr>
        </tbody>
      </table>

      <hr style={S.hr} />

      <h2 style={S.h2}>5. Pillar Four: Tax Reform for Competitiveness</h2>

      <h3 style={S.h3}>Employer National Insurance: 15% to 12%</h3>
      <p style={S.p}>Employer NI is a tax on hiring. Reversing the recent increase to 12% costs approximately £10 billion per year in static terms, offset by dynamic revenue from increased employment.</p>

      <h3 style={S.h3}>Abolish the Additional Rate</h3>
      <p style={S.p}>The current system creates an effective marginal rate of 40%, then 60% (personal allowance taper), then 45% (additional rate). This is economically incoherent. A clean 20%/40% schedule with no taper makes Britain the most attractive major English-speaking economy for globally mobile high earners.</p>

      <h3 style={S.h3}>Land Value Tax</h3>
      <p style={S.p}>Replace business rates with a Land Value Tax on commercial land, raising £16 billion by year ten while being economically superior: it cannot be avoided and does not distort investment decisions.</p>

      <h3 style={S.h3}>Planning Reform Dividend</h3>
      <p style={S.p}>A development levy of 15–20% of land value uplift, paid directly to existing residents near new development, both funds infrastructure and creates a constituency in favour of development.</p>

      <hr style={S.hr} />

      <h2 style={S.h2}>6. The Growth Arithmetic: Honest Version</h2>

      <table style={S.table}>
        <thead><tr><th style={S.th}>Channel</th><th style={S.th}>Original</th><th style={S.th}>Central</th><th style={S.th}>Pessimistic</th><th style={S.th}>Key Uncertainty</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Nuclear construction</td><td style={S.td}>+0.1%</td><td style={S.td}>+0.2%</td><td style={S.td}>+0.1%</td><td style={S.td}>Temporary; falls when construction ends</td></tr>
          <tr><td style={S.td}>Cheap energy</td><td style={S.td}>+0.8%</td><td style={S.td}>+0.4%</td><td style={S.td}>+0.2%</td><td style={S.td}>Only 15–20 GW by yr 10</td></tr>
          <tr><td style={S.td}>AI productivity</td><td style={S.td}>+1.0%</td><td style={S.td}>+0.6%</td><td style={S.td}>+0.3%</td><td style={S.td}>Solow paradox</td></tr>
          <tr><td style={S.td}>Planning reform</td><td style={S.td}>+0.4%</td><td style={S.td}>+0.3%</td><td style={S.td}>+0.1%</td><td style={S.td}>Implementation resistance</td></tr>
          <tr><td style={S.td}>Data centre investment</td><td style={S.td}>n/a</td><td style={S.td}>+0.3%</td><td style={S.td}>+0.1%</td><td style={S.td}>Timing vs hyperscaler cycle</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 700 }}>TOTAL UPLIFT</td><td style={{ ...S.td, fontWeight: 700 }}>+2.3%</td><td style={{ ...S.td, fontWeight: 700 }}>+1.8%</td><td style={{ ...S.td, fontWeight: 700 }}>+0.8%</td><td style={S.td}></td></tr>
          <tr><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>REFORMED GROWTH</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>3.8%</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>3.3%</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>2.3%</td><td style={S.td}></td></tr>
        </tbody>
      </table>
      <p style={S.p}>Even the pessimistic scenario delivers 2.3% — a 50% improvement over the 1.5% baseline.</p>

      <hr style={S.hr} />

      <h2 style={S.h2}>7. The Consolidated Fiscal Position</h2>

      <h3 style={S.h3}>Central Scenario</h3>
      <table style={S.table}>
        <thead><tr><th style={S.th}>£bn</th><th style={S.th}>Yr 1</th><th style={S.th}>Yr 3</th><th style={S.th}>Yr 5</th><th style={S.th}>Yr 7</th><th style={S.th}>Yr 10</th><th style={S.th}>Yr 15</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Baseline deficit</td><td style={S.td}>138</td><td style={S.td}>120</td><td style={S.td}>100</td><td style={S.td}>85</td><td style={S.td}>67</td><td style={S.td}>50</td></tr>
          <tr><td style={S.td}>Reform savings</td><td style={S.td}>0</td><td style={S.td}>-10</td><td style={S.td}>-30</td><td style={S.td}>-45</td><td style={S.td}>-60</td><td style={S.td}>-80</td></tr>
          <tr><td style={S.td}>Nuclear net cost</td><td style={S.td}>10</td><td style={S.td}>37</td><td style={S.td}>43</td><td style={S.td}>44</td><td style={S.td}>42</td><td style={S.td}>20</td></tr>
          <tr><td style={S.td}>Wind CfD overlap</td><td style={S.td}>0</td><td style={S.td}>0</td><td style={S.td}>3</td><td style={S.td}>5</td><td style={S.td}>6</td><td style={S.td}>2</td></tr>
          <tr><td style={S.td}>Data centre tax rev</td><td style={S.td}>0</td><td style={S.td}>0</td><td style={S.td}>-1</td><td style={S.td}>-3</td><td style={S.td}>-6</td><td style={S.td}>-12</td></tr>
          <tr><td style={S.td}>Grid investment</td><td style={S.td}>1</td><td style={S.td}>2</td><td style={S.td}>3</td><td style={S.td}>2</td><td style={S.td}>1</td><td style={S.td}>0</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>REFORMED DEFICIT</td><td style={{ ...S.td, fontWeight: 700 }}>149</td><td style={{ ...S.td, fontWeight: 700 }}>149</td><td style={{ ...S.td, fontWeight: 700 }}>118</td><td style={{ ...S.td, fontWeight: 700 }}>88</td><td style={{ ...S.td, fontWeight: 700 }}>50</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>-20</td></tr>
          <tr><td style={S.td}>vs baseline</td><td style={S.td}>+11</td><td style={S.td}>+29</td><td style={S.td}>+18</td><td style={S.td}>+3</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>-17</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>-70</td></tr>
          <tr><td style={S.td}>Debt / GDP</td><td style={S.td}>97%</td><td style={S.td}>103%</td><td style={S.td}>108%</td><td style={S.td}>110%</td><td style={S.td}>104%</td><td style={S.td}>82%</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 700 }}>Debt / GDP net of asset</td><td style={S.td}>96%</td><td style={S.td}>100%</td><td style={S.td}>102%</td><td style={S.td}>100%</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>88%</td><td style={{ ...S.td, fontWeight: 700, color: TEAL }}>58%</td></tr>
        </tbody>
      </table>

      <div style={S.bq}><strong style={S.strong}>The reformed deficit is worse than baseline for years 1–7.</strong> The programme only clearly outperforms baseline from year 8 onwards. Debt/GDP peaks at approximately 110% in year 7 before declining. Gilt market management during this transition period is the programme&apos;s greatest fiscal vulnerability.</div>

      <hr style={S.hr} />

      <h2 style={S.h2}>8. Risk Register</h2>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Risk</th><th style={S.th}>Severity</th><th style={S.th}>Description</th><th style={S.th}>Mitigation</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Nuclear cost overruns</td><td style={{ ...S.td, color: "#ff6b6b" }}>HIGH</td><td style={S.td}>Every recent Western project has overrun</td><td style={S.td}>Korean partnership, fixed-price EPC, standardised design, 20–30% contingency</td></tr>
          <tr><td style={S.td}>Construction delays</td><td style={{ ...S.td, color: "#ff6b6b" }}>HIGH</td><td style={S.td}>Workforce and supply chain bottlenecks</td><td style={S.td}>National Nuclear Skills Academy, Korean workforce, parallel sites</td></tr>
          <tr><td style={S.td}>Welfare under-delivery</td><td style={{ ...S.td, color: "#ff6b6b" }}>HIGH</td><td style={S.td}>Past reforms deliver 40–70% of projections</td><td style={S.td}>Central scenario uses 50–65% discount; over-programme reforms</td></tr>
          <tr><td style={S.td}>Judicial review</td><td style={{ ...S.td, color: "#ffd93d" }}>MEDIUM</td><td style={S.td}>Benefit changes challenged under ECHR</td><td style={S.td}>Primary legislation with explicit criteria, ouster clauses</td></tr>
          <tr><td style={S.td}>Gilt market reaction</td><td style={{ ...S.td, color: "#ffd93d" }}>MEDIUM</td><td style={S.td}>Higher borrowing years 1–7</td><td style={S.td}>Dedicated Energy Bonds with asset backing, OBR engagement</td></tr>
          <tr><td style={S.td}>Grid delays</td><td style={{ ...S.td, color: "#ffd93d" }}>MEDIUM</td><td style={S.td}>New 400kV corridors take 2–3 years</td><td style={S.td}>Prioritise existing connections, £15–25bn grid investment</td></tr>
          <tr><td style={S.td}>Data centres don&apos;t come</td><td style={{ ...S.td, color: "#ffd93d" }}>MEDIUM</td><td style={S.td}>Hyperscalers commit elsewhere</td><td style={S.td}>Temporary gas capacity, early PPA negotiations</td></tr>
          <tr><td style={S.td}>Political reversal</td><td style={{ ...S.td, color: "#ff6b6b" }}>HIGH</td><td style={S.td}>Next government cancels</td><td style={S.td}>50-year statutory mandate, long-dated debt, 50k+ workforce in marginal seats</td></tr>
          <tr><td style={S.td}>Union resistance</td><td style={{ ...S.td, color: "#ffd93d" }}>MEDIUM</td><td style={S.td}>Public sector unions fight AI</td><td style={S.td}>Attrition-based, no compulsory redundancies for 3 years</td></tr>
          <tr><td style={S.td}>AI productivity slower</td><td style={{ ...S.td, color: "#ffd93d" }}>MEDIUM</td><td style={S.td}>Solow paradox</td><td style={S.td}>Central case uses conservative 0.3–0.6% uplift</td></tr>
        </tbody>
      </table>

      <hr style={S.hr} />

      <h2 style={S.h2}>9. Political Strategy</h2>

      <h3 style={S.h3}>The Honest Problem</h3>
      <p style={S.p}>The reformed deficit is worse than baseline for seven years. Welfare reform creates concentrated, visible losers before diffuse benefits materialise. The nuclear programme spends enormous sums before producing any electricity. No democratic government in modern British history has sustained this kind of programme through a full electoral cycle.</p>

      <h3 style={S.h3}>Sequencing for Survival</h3>
      <p style={S.p}><strong style={S.strong}>Year 1:</strong> British Energy Corporation Act, employer NI cut, PA taper abolition, Korean partnership, first Energy Bonds. Immediate wins plus irreversible commitments.</p>
      <p style={S.p}><strong style={S.strong}>Year 2:</strong> Concrete on 2–3 sites. Data centre announcements. PIP reform + NHS mental health expansion. 10,000+ nuclear construction jobs.</p>
      <p style={S.p}><strong style={S.strong}>Year 3–4:</strong> Reform savings visible in fiscal data. AI pilots in government. Planning effects in housing starts. Energy price trajectory declining.</p>
      <p style={S.p}><strong style={S.strong}>Year 5:</strong> First reactors commissioning. Data centres operational. Electoral case: &quot;We told you it would be hard. It&apos;s working.&quot;</p>

      <h3 style={S.h3}>The Counterfactual</h3>
      <p style={S.p}>The most powerful argument is not &quot;our programme is painless.&quot; It is: &quot;the alternative is worse.&quot; The baseline trajectory leads to a debt crisis by the mid-2030s. The OBR&apos;s forecasts only &quot;work&quot; because they assume spending cuts no government has specified. Without reform, the choices narrow to: massive tax increases, market-imposed austerity, or inflation. The programme is not pain-free. It is the least painful option. Everything else is worse.</p>

      <hr style={S.hr} />

      <h2 style={S.h2}>10. Conclusion</h2>

      <p style={S.p}>This programme is harder, slower, more expensive, and more politically dangerous than simpler versions of this argument suggest. The nuclear fleet takes 20 years, not 10. The welfare savings are £60–90 billion, not £150 billion. The fiscal position is uncomfortable for the first seven years.</p>
      <p style={S.p}>And it is still, overwhelmingly, the right thing to do.</p>
      <p style={S.p}>Even under the pessimistic scenario — where costs overrun, reforms under-deliver, and growth effects are half the central estimate — the UK in 2040 is materially better off than on the baseline trajectory. More energy-secure, more fiscally sustainable, more economically competitive, and with a generation of productive assets that will pay dividends for decades.</p>
      <p style={S.p}>The programme does not require heroic assumptions. It requires competent execution of proven mechanisms, sustained political will, and the intellectual honesty to tell the public that the transition will be difficult before it becomes transformative.</p>

      <div style={S.bq}>
        Everything described here is achievable with known technology and proven policy mechanisms. The physics works. The fiscal arithmetic works under central assumptions. The international precedents exist. The only question is whether the political system can sustain a coherent strategy for longer than a single electoral cycle. That question cannot be answered in a white paper. It can only be answered by doing it.
      </div>

      <hr style={S.hr} />
      <p style={{ ...S.meta, textAlign: "center", marginTop: 24 }}>
        Interactive fiscal model: <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ color: TEAL, textDecoration: "none" }}>Switch to PARAMETRIC MODEL tab</a> — All assumptions adjustable — stress-test any scenario.
      </p>
    </div>
  );
}
