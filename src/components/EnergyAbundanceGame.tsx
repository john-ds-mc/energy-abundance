"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, ComposedChart,
} from "recharts";
import WhitePaper from "./WhitePaper";

/* ═══════════════════════════════════════════════════════════════════
   BREAKING THE DOOM LOOP v2.0 — PARAMETRIC FISCAL MODEL

   All baseline data from:
   - OBR Economic & Fiscal Outlook (Nov 2025)
   - IFS Triple Lock Analysis, IFS Disability Benefits Report
   - DESNZ Energy Trends (Dec 2025), Carbon Brief (2025)
   - National Grid ESO, Ofgem Price Cap Q2 2025
   - DMO Debt Management Report 2025-26
   - World Nuclear Association, DWP Annual Report 2024-25
   - Public First "AI in the Public Sector" (2025)
   - CSJ disability reform estimates
   - DUKES 2025 (capacity factors)

   White paper reform savings use IFS-methodology discount rates:
   Historical UK welfare reforms deliver 40-70% of projected savings.
   Central scenario applies 50-65% discount. Triple lock reform is
   arithmetic (reliable); disability reform is behavioural (uncertain).
   ═══════════════════════════════════════════════════════════════════ */

const MONO = "var(--font-mono), 'JetBrains Mono', 'Fira Code', monospace";
const SANS = "var(--font-sans), 'Space Grotesk', system-ui, sans-serif";
const YEARS = 15; // v2 models to year 15 (20-year programme)
const YR_LABELS = Array.from({ length: YEARS }, (_, i) => `${2026 + i}`);

/* ─── OBR / OFFICIAL BASELINE DATA ─── */
const B = {
  // Fiscal (OBR Nov 2025 EFO, £bn)
  gdpNominal: 2790,           // 2024-25 nominal GDP
  receipts: 1120,             // total managed receipts
  receiptsGrowth: 4.2,        // % nominal (OBR trend)
  tme: 1270,                  // total managed expenditure
  debtInterest: 105,          // central govt net debt interest
  psnb: 150,                  // public sector net borrowing
  psnd: 96,                   // debt/GDP %

  // OBR gilt sensitivity: +1pp rates = +£20.8bn debt interest (OBR)
  giltSensitivity: 20.8,
  avgDebtMaturity: 14,        // years (DMO Mar 2025)
  refinanceShare: 0.59,       // 59% of debt responds to rate changes (OBR)
  giltIssuance: 299,          // DMO planned gross issuance 2025-26

  // Welfare breakdown (OBR/DWP 2024-25)
  statePension: 146,          // £146.1bn (OBR 2025-26)
  pensionOther: 9,            // pension credit, WFP
  disabilityWA: 57,           // working-age disability & incapacity
  pip: 19,                    // PIP + DLA subset
  universalCredit: 32.5,      // UC
  otherWelfare: 69.5,         // housing benefit, child, other
  totalWelfare: 313,          // total

  // Departmental spending breakdown (OBR/HMT PESA 2024-25, £bn)
  nhsSpend: 180,              // DHSC total DEL + ALIS
  defenceSpend: 62.2,         // MoD (SDR 2025: rising to 2.5% GDP)
  educationSpend: 105,        // DfE + skills + HE
  asylumSpend: 4.5,           // Home Office asylum costs (gross)
  justiceSpend: 12,           // MoJ + courts + prisons
  transportSpend: 18,         // DfT (excl HS2 capital)
  localGovSpend: 40,          // DLUHC local gov support
  otherDeptSpend: 496,        // everything else (£957bn total - named depts)
  // £957bn = TME £1270bn - welfare £313bn. Named: 180+62+105+4.5+12+18+40 = 421.5. Other: 535.5

  // Growth rates (OBR)
  pensionTripleLock: 6.0,     // ~6% annual growth under triple lock (WP)
  pensionDoubleLock: 3.0,     // CPI + 0.5%
  disabilityGrowth: 8.0,      // IFS: +£24bn since 2019-20 on £57bn base
  ucGrowth: 3.5,
  otherWelfGrowth: 3.0,
  nhsBaseGrowth: 3.6,         // NHSE long-term plan: 3.4-3.8% real (Wanless/OBR)
  defenceGdpPct: 2.3,         // current ~2.3% GDP, NATO target 2.5%
  educationGrowth: 2.5,       // real terms (schools + HE)
  otherDeptGrowth: 2.0,       // real terms (efficiency assumed)
  obrBaseGrowth: [1.5, 1.4, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5],

  // Debt interest dynamics
  avgCouponRate: 3.8,         // weighted avg coupon on existing gilt stock (DMO)
  debtStock: 2678,            // PSND £bn (96% of £2790bn GDP)

  // Energy (DESNZ/Carbon Brief 2025)
  nuclearGW: 5.9,             // current installed
  offshoreWind: 15.8,         // GW
  onshoreWind: 17,
  solar: 21,
  otherRenewable: 6.8,        // biomass, hydro
  totalRenewable: 60.6,
  demandTWh: 322,
  peakDemandGW: 43.6,         // Feb 2025
  wholesalePrice: 80,         // £/MWh typical
  householdBill: 1720,        // £/yr Ofgem cap

  // Capacity factors (DUKES 2025)
  nuclearCF: 0.72,
  offshoreWindCF: 0.35,
  onshoreWindCF: 0.26,
  solarCF: 0.095,

  // Renewable costs (LCCC/Ofgem/NESO 2024-25)
  cfdPortfolioTWh: 45,        // TWh under CfD currently (~30GW at mixed CFs)
  cfdAvgStrike: 58,           // £/MWh weighted avg across AR1-AR6 portfolio
  // AR strike prices: AR1 £155, AR2 £62, AR3 £44, AR4 £37, AR5 £58(failed), AR6 £82
  cfdNewStrike: 73,           // £/MWh blended new-build (AR6: £82 offshore, £50 solar, £52 onshore)
  curtailmentPct: 8,          // % of wind output curtailed (ESO: 8% in 2024, rising)
  curtailmentCostMWh: 85,     // £/MWh compensation for curtailed wind (avg constraint payment)
  constraintPayments: 1.4,    // £bn/yr current (ESO: £1.4bn in 2024, was £0.8bn in 2023)
  balancingCostMWh: 12,       // £/MWh system integration cost for intermittent (Imperial/UKERC)
  capacityMarket: 1.2,        // £bn/yr capacity market payments (backup gas + storage)
  offshoreGridCost: 54,       // £bn total (NESO: offshore transmission build-out to 2035)
  onshoreGridCost: 22,        // £bn (NESO: onshore reinforcement, East Anglia, Scotland-England)

  // Baseline spending drift — OBR always assumes restraint that never materialises
  // IFS: depts consistently overshoot by 1-2pp vs plans. NHS especially.
  baselineNhsGrowth: 4.5,     // % real — actual trend inc. covid catch-up, backlog
  baselineDefenceGrowth: 3.0,  // % — SDR commitments, Ukraine, AUKUS
  baselineEduGrowth: 2.5,
  baselineOtherGrowth: 2.8,   // % — OBR assumes 1-2% but depts always overshoot

  // Nuclear costs (real data)
  hpcCost: 46,               // £bn for 3.2 GW (HPC actual)
  hpcGW: 3.2,
  szcCost: 38,               // £bn for 3.2 GW (SZC est. 2024)
  szcGW: 3.2,
  smrCost: 2.5,              // £bn per 0.47 GW (RR SMR)
  smrGW: 0.47,
  koreanCostPerGW: 3.3,      // APR1400 benchmark

  // White paper honest cost curve: £5.5bn/GW → £3.4bn/GW
  costStart: 5.5,            // £bn/GW initial
  costMature: 3.4,           // £bn/GW after learning

  // Grid (National Grid ESO)
  gridQueue: 739,            // GW in queue pre-reform
  gridReformed: 283,         // GW post-reform pipeline
  batteryGW: 6.9,            // installed storage
  gridInvestNeeded: 20,      // £bn for transmission (WP: £15-25bn)

  // Data centres
  currentDC: 3,              // GW current UK data centre demand
  gridDCQueue: 50,           // GW of DC demand queued (NESO)

  // Industrial (various)
  freeportInvestment: 6.4,   // £bn attracted to date
  nwfCapital: 27.8,          // National Wealth Fund total
  gbeCapital: 8.3,           // GBE + GBE-Nuclear
  steelInvestment: 2.5,      // £bn committed
  gigafactoryGWh: 60,        // planned (Agratas 40 + AESC 20)

  // Employer NICs (HMRC/OBR)
  employerNICs: 108,         // £bn/yr total
  corpTaxRevenue: 91.2,      // £bn 2024-25

  // White paper reform savings by year 10 (3 scenarios, £bn/yr)
  // From the consolidated table in the PDF
  reformOptimistic: 122,
  reformCentral: 60,
  reformPessimistic: 20,
};

/* ─── WHITE PAPER: Nuclear build schedule ─── */
// Realistic: 15-20 GW by yr 10, 50 GW by yr 20
// AGR retirements: fleet drops from 5.9 to ~1.2 GW (Sizewell B only) by yr 5
const AGR_RETIREMENT = [-0.5, -1.0, -1.2, -1.0, -1.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// HPC: unit 1 yr 5, unit 2 yr 6
const HPC_ONLINE = [0, 0, 0, 0, 1.6, 1.6, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// SZC: yr 10-11
const SZC_ONLINE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1.6, 1.6, 0, 0, 0, 0];

/* ─── White paper: Fiscal flows by year (central scenario from table p12) ─── */
const WP_NUCLEAR_NET_COST = [10, 20, 37, 40, 43, 44, 44, 44, 42, 35, 30, 25, 20, 15, 10];
const WP_WIND_CFD_OVERLAP = [0, 0, 0, 1, 3, 5, 6, 6, 6, 4, 3, 2, 1, 0, 0];
const WP_GRID_INVEST = [1, 2, 2, 3, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0];

const COLORS = {
  teal: "#4ecdc4", red: "#ff6b6b", yellow: "#ffd93d", blue: "#45b7d1",
  purple: "#a78bfa", green: "#34d399", orange: "#fb923c", pink: "#f472b6",
  gold: "#ffd700", cyan: "#22d3ee",
};

/* ─── ACHIEVEMENTS ─── */
interface AchDef { id: string; title: string; desc: string; icon: string; }
const ACHS: AchDef[] = [
  { id: "abundance", title: "ENERGY ABUNDANCE", desc: "Energy price below £40/MWh", icon: "A" },
  { id: "titan", title: "NUCLEAR TITAN", desc: "30+ GW nuclear", icon: "T" },
  { id: "independence", title: "ENERGY INDEPENDENCE", desc: "Reliable capacity > 120% peak demand", icon: "I" },
  { id: "green", title: "GREEN GRID", desc: "CO2 cut > 70%", icon: "G" },
  { id: "surplus", title: "BUDGET SURPLUS", desc: "Fiscal surplus achieved", icon: "$" },
  { id: "growth", title: "GROWTH ENGINE", desc: "GDP growth > 3%", icon: "R" },
  { id: "hawk", title: "FISCAL HAWK", desc: "Debt/GDP below 90%", icon: "F" },
  { id: "compute", title: "COMPUTE HUB", desc: "20+ GW data centres", icon: "D" },
  { id: "exporter", title: "NET EXPORTER", desc: "Energy export revenue > £8bn", icon: "E" },
  { id: "golden", title: "GOLDEN AGE", desc: "S rank achieved", icon: "S" },
];

/* ─── UI COMPONENTS ─── */
function Slider({ label, min, max, step, value, onChange, unit = "", source = "" }: {
  label: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; unit?: string; source?: string;
}) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
        <span style={{ fontSize: 11, fontFamily: MONO, color: "#8892a4", letterSpacing: "0.02em" }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: MONO, fontWeight: 700, color: "#e8ecf2" }}>
          {step < 1 ? value.toFixed(1) : value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#4ecdc4", height: 5, cursor: "pointer" }} />
      {source && <div style={{ fontSize: 7.5, fontFamily: MONO, color: "#222b3a", marginTop: 1 }}>{source}</div>}
    </div>
  );
}

function Toggle({ label, checked, onChange, source = "" }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; source?: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 11, fontFamily: MONO, color: "#8892a4", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: COLORS.teal }} />
        {label}
      </label>
      {source && <div style={{ fontSize: 7.5, fontFamily: MONO, color: "#222b3a", marginTop: 1, marginLeft: 20 }}>{source}</div>}
    </div>
  );
}

function Card({ title, children, accent = COLORS.teal }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: "rgba(15,23,42,0.6)", borderRadius: 12, padding: "14px 18px",
      border: "1px solid rgba(78,205,196,0.12)", backdropFilter: "blur(10px)", marginBottom: 14,
    }}>
      <div style={{
        fontSize: 10, fontFamily: MONO, color: accent, textTransform: "uppercase",
        letterSpacing: "0.12em", marginBottom: 10, fontWeight: 600,
      }}>{title}</div>
      {children}
    </div>
  );
}

function StatBox({ label, value, sub, color = COLORS.teal, warn = false }: {
  label: string; value: string; sub?: string; color?: string; warn?: boolean;
}) {
  return (
    <div style={{
      background: warn ? "rgba(255,107,107,0.08)" : "rgba(15,23,42,0.5)",
      borderRadius: 10, padding: "11px 12px",
      border: `1px solid ${warn ? "rgba(255,107,107,0.25)" : "rgba(78,205,196,0.1)"}`,
      textAlign: "center", flex: 1, minWidth: 100,
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: MONO, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, color: "#8892a4", marginTop: 3, fontFamily: MONO, letterSpacing: "0.05em" }}>{label}</div>
      {sub && <div style={{ fontSize: 8, color: "#4a5568", marginTop: 2, fontFamily: MONO }}>{sub}</div>}
    </div>
  );
}

function MeterBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 9, fontFamily: MONO, color: "#6b7a8d" }}>{label}</span>
        <span style={{ fontSize: 9.5, fontFamily: MONO, fontWeight: 700, color }}>{Math.round(value)}</span>
      </div>
      <div style={{ height: 5, background: "#1a2332", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}66, ${color})`, borderRadius: 3, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function ScenarioBtn({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 14px", borderRadius: 6, border: `1px solid ${active ? color : "#2a3441"}`,
      background: active ? `${color}18` : "transparent", color: active ? color : "#5a6578",
      fontSize: 10.5, fontFamily: MONO, cursor: "pointer", fontWeight: active ? 700 : 400,
      letterSpacing: "0.05em", transition: "all 0.2s",
    }}>{label}</button>
  );
}

function getGrade(s: number): { grade: string; color: string; label: string } {
  if (s >= 900) return { grade: "S", color: COLORS.gold, label: "Golden Age" };
  if (s >= 750) return { grade: "A", color: COLORS.teal, label: "Energy Superpower" };
  if (s >= 600) return { grade: "B", color: COLORS.blue, label: "Breaking the Loop" };
  if (s >= 450) return { grade: "C", color: COLORS.yellow, label: "Muddling Through" };
  if (s >= 300) return { grade: "D", color: COLORS.orange, label: "Managed Decline" };
  return { grade: "F", color: COLORS.red, label: "Doom Loop" };
}

const TT_STYLE = { background: "#0f172a", border: "1px solid #2a3441", borderRadius: 8, fontFamily: MONO, fontSize: 11 };
const CHART_TICK = { fontSize: 9, fontFamily: MONO, fill: "#5a6578" };
const GRID_STROKE = "rgba(255,255,255,0.04)";

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function EnergyAbundanceGame() {
  /* ─── TAB ─── */
  const [activeTab, setActiveTab] = useState<"model"|"whitepaper">("model");

  /* ─── SCENARIO ─── */
  const [scenario, setScenario] = useState<"pessimistic"|"central"|"optimistic">("central");
  const scenarioMult = scenario === "optimistic" ? 1.25 : scenario === "pessimistic" ? 0.55 : 1.0;
  // WP: historical discount 40-70%. Central 50-65%, Optimistic 85%, Pessimistic 45%
  const reformDiscount = scenario === "optimistic" ? 0.85 : scenario === "pessimistic" ? 0.45 : 0.60;

  /* ─── MACRO ─── */
  const [baseGrowth, setBaseGrowth] = useState(1.5);
  const [inflation, setInflation] = useState(2.5);
  const [giltRate, setGiltRate] = useState(4.5);
  const [giltSpread, setGiltSpread] = useState(0);  // bp over baseline (Truss = +130bp)

  /* ─── SPENDING ─── */
  const [nhsGrowth, setNhsGrowth] = useState(3.6);            // % real
  const [defenceTarget, setDefenceTarget] = useState(2.5);     // % GDP
  const [educationGrowth, setEducationGrowth] = useState(2.5); // % real
  const [asylumSpend, setAsylumSpend] = useState(4.5);         // £bn/yr
  const [publicSectorEfficiency, setPublicSectorEfficiency] = useState(0); // % annual saving on other depts
  const [localGovGrowth, setLocalGovGrowth] = useState(3.0);   // % real

  /* ─── PILLAR 1: NUCLEAR ─── */
  const [nuclearScale, setNuclearScale] = useState(100);     // % of WP programme
  const [costOverrun, setCostOverrun] = useState(0);         // % over baseline cost
  const [koreanPartnership, setKoreanPartnership] = useState(true); // KEPCO: £3.3bn/GW vs £14.4bn/GW HPC
  const [smrUnits, setSmrUnits] = useState(8);               // RR SMR units (Wylfa)
  const [koreanGW, setKoreanGW] = useState(0);               // additional APR1400 capacity

  /* ─── PILLAR 2: COMPUTE HUB (endogenous demand) ─── */
  // DC demand is computed from energy price + nuclear capacity — not a manual input
  // WP: "The country that can offer guaranteed, cheap, clean power captures
  //       a disproportionate share of the most valuable infrastructure buildout in history"
  const [dcInvestmentClimate, setDcInvestmentClimate] = useState(100); // % attractiveness multiplier
  const [twoTierPricing, setTwoTierPricing] = useState(true);

  /* ─── PILLAR 3: WELFARE REFORM ─── */
  const [tripleLockReform, setTripleLockReform] = useState(true);   // CPI + 0.5%
  const [spaAccelerate, setSpaAccelerate] = useState(false);        // SPA to 68 by 2033
  const [pipReform, setPipReform] = useState(true);                 // mild MH conditions
  const [wcaTighten, setWcaTighten] = useState(true);               // UC health element
  const [nhsMHInvest, setNhsMHInvest] = useState(true);             // £2-3bn reinvest
  const [aiPublicSector, setAiPublicSector] = useState(50);         // % of Public First est
  const [nationalOpportunityFund, setNationalOpportunityFund] = useState(true); // £5bn/yr

  /* ─── PILLAR 4: TAX & INDUSTRIAL ─── */
  const [employerNICut, setEmployerNICut] = useState(0);      // % cut (WP: partial cut)
  const [corpTaxRate, setCorpTaxRate] = useState(25);
  const [planningReform, setPlanningReform] = useState(100);   // % ambition
  const [freeportExpansion, setFreeportExpansion] = useState(50);
  const [lvt, setLvt] = useState(0);                          // % of 1% LVT (raises ~£55bn at 100%)
  const [greenSteelInvest, setGreenSteelInvest] = useState(true);
  const [gigafactories, setGigafactories] = useState(true);
  const [energyBonds, setEnergyBonds] = useState(true);       // 50-year dedicated bonds
  const [renewableScale, setRenewableScale] = useState(100);
  const [offshoreWindTarget, setOffshoreWindTarget] = useState(50); // GW by 2035 (govt: 43-50GW)
  const [cfdStrikeOverride, setCfdStrikeOverride] = useState(73);  // £/MWh new CfD strike
  const [gridInvestPace, setGridInvestPace] = useState(100);       // % of NESO plan
  const [curtailmentMitigation, setCurtailmentMitigation] = useState(50); // % — storage, interconnectors

  /* ─── ACHIEVEMENT TRACKING ─── */
  const [unlockedAchs, setUnlockedAchs] = useState<Set<string>>(new Set());
  const [toastQueue, setToastQueue] = useState<string[]>([]);

  /* ═══ COMPUTE MODEL ═══ */
  const data = useMemo(() => {
    const rows: Record<string, number | string>[] = [];
    let cumNucCapex = 0;
    let baseDebt = B.gdpNominal * (B.psnd / 100);
    let refDebt = baseDebt;

    for (let i = 0; i < YEARS; i++) {
      const t = i; // year index
      const nomGrowth = baseGrowth / 100 + inflation / 100;
      const gdp = B.gdpNominal * Math.pow(1 + nomGrowth, t);
      const rev = B.receipts * Math.pow(1 + B.receiptsGrowth / 100, t);

      // Previous year reformed GDP (for defence % GDP calc)
      const prevReformedGrowth = i > 0 ? (rows[i-1].reformedGrowth as number) : baseGrowth;
      const refGdpPrev = i > 0
        ? B.gdpNominal * Math.pow(1 + prevReformedGrowth / 100 + inflation / 100, t)
        : B.gdpNominal;

      // Energy bonds: reduce effective gilt cost by 15-20bp through dedicated issuance
      const bondBenefitVal = energyBonds ? 0.15 : 0;

      // ══ BASELINE (autopilot — no reform, realistic spending drift)
      // OBR assumes spending restraint that historically never materialises (IFS)
      const basePension = B.statePension * Math.pow(1 + B.pensionTripleLock / 100, t);
      const baseDisability = B.disabilityWA * Math.pow(1 + B.disabilityGrowth / 100, t);
      const baseUC = B.universalCredit * Math.pow(1 + B.ucGrowth / 100, t);
      const baseOtherW = (B.pensionOther + B.otherWelfare) * Math.pow(1 + B.otherWelfGrowth / 100, t);
      const baseWelfare = basePension + baseDisability + baseUC + baseOtherW;
      // Baseline depts use realistic drift rates (not user sliders)
      const baseNHS = B.nhsSpend * Math.pow(1 + B.baselineNhsGrowth / 100, t);
      const baseDefence = B.defenceSpend * Math.pow(1 + B.baselineDefenceGrowth / 100, t);
      const baseEdu = B.educationSpend * Math.pow(1 + B.baselineEduGrowth / 100, t);
      const baseOtherDept = (B.asylumSpend + B.justiceSpend + B.transportSpend + B.localGovSpend + B.otherDeptSpend)
        * Math.pow(1 + B.baselineOtherGrowth / 100, t);
      const baseDeptTotal = baseNHS + baseDefence + baseEdu + baseOtherDept;

      // Baseline debt interest (uses baseline debt stock trajectory)
      const effectiveGiltBase = 4.5; // OBR central gilt assumption
      const prevBaseDebtStock = i > 0 ? baseDebt : B.debtStock;
      const shareRepricedBase = Math.min(1, t / B.avgDebtMaturity);
      const blendedRateBase = B.avgCouponRate * (1 - shareRepricedBase) + effectiveGiltBase * shareRepricedBase;
      const baseDebtInt = prevBaseDebtStock * (blendedRateBase / 100) +
        (i > 0 ? Math.max(0, rows[i-1].baseDeficit as number) * (effectiveGiltBase / 100) : 0);

      const baseSpend = baseWelfare + baseDeptTotal + baseDebtInt;
      const baseDeficit = baseSpend - rev;

      // ══ REFORMED welfare & spending (user-controlled)
      const pension = B.statePension * Math.pow(1 + B.pensionTripleLock / 100, t);
      const disability = B.disabilityWA * Math.pow(1 + B.disabilityGrowth / 100, t);
      const uc = B.universalCredit * Math.pow(1 + B.ucGrowth / 100, t);
      const otherW = (B.pensionOther + B.otherWelfare) * Math.pow(1 + B.otherWelfGrowth / 100, t);
      const totalWelfare = pension + disability + uc + otherW;

      // Departmental spending (user sliders)
      const nhsSpd = B.nhsSpend * Math.pow(1 + nhsGrowth / 100, t);
      const defenceSpd = refGdpPrev * (defenceTarget / 100);
      const eduSpd = B.educationSpend * Math.pow(1 + educationGrowth / 100, t);
      const asylumSpd = asylumSpend;
      const justiceSpd = B.justiceSpend * Math.pow(1 + 2.5 / 100, t);
      const transportSpd = B.transportSpend * Math.pow(1 + 2.0 / 100, t);
      const localGovSpd = B.localGovSpend * Math.pow(1 + localGovGrowth / 100, t);
      const otherDeptSpd = B.otherDeptSpend * Math.pow(1 + Math.max(0, B.otherDeptGrowth - publicSectorEfficiency) / 100, t);
      const totalDeptSpend = nhsSpd + defenceSpd + eduSpd + asylumSpd + justiceSpd + transportSpd + localGovSpd + otherDeptSpd;

      // Reformed debt interest (responds to user's gilt rate + spread + bonds)
      const effectiveGilt = giltRate + giltSpread / 100 - bondBenefitVal;
      const prevDebtStock = i > 0 ? (rows[i-1].debtStock as number) : B.debtStock;
      const shareRepriced = Math.min(1, t / B.avgDebtMaturity);
      const blendedRate = B.avgCouponRate * (1 - shareRepriced) + effectiveGilt * shareRepriced;
      const debtInt = prevDebtStock * (blendedRate / 100) +
        (i > 0 ? Math.max(0, rows[i-1].deficit as number) * (effectiveGilt / 100) : 0);

      const reformedSpend = totalWelfare + totalDeptSpend + debtInt;

      // ── PILLAR 1: Nuclear capacity
      const ns = nuclearScale / 100;
      const costMult = 1 + costOverrun / 100;

      // Korean partnership: CHEAPER builds (£3.3bn/GW vs £14.4bn/GW HPC)
      // AND FASTER (they bring experienced workforce + project management)
      // WP: "importing Korean project management helps... perhaps half the Korean advantage transfers"
      const koreanCostFactor = koreanPartnership ? 0.7 : 1.0;  // 30% cheaper
      const koreanSpeedFactor = koreanPartnership ? 1.3 : 1.0;  // 30% faster build rate

      // AGR retirements (happen regardless — fleet drops to Sizewell B only)
      const agr = AGR_RETIREMENT[t] || 0;
      // HPC: unit 1 yr 5, unit 2 yr 6 (already under construction, not affected by Korean deal)
      const hpc = (HPC_ONLINE[t] || 0) * ns;
      // SZC: yr 10-11
      const szc = (SZC_ONLINE[t] || 0) * ns;
      // SMRs: RR SMR from year 6, ~2/yr ramp. Korean partnership speeds factory delivery.
      const smrOnline = t >= 6 ? Math.min(smrUnits, Math.floor((t - 5) * 2 * koreanSpeedFactor)) * B.smrGW * ns : 0;
      // Korean APR1400 reactors: from year 4, 1.4GW/yr. These are the Korean-built ones.
      const korOnline = t >= 4 ? Math.min(koreanGW, (t - 3) * 1.4 * koreanSpeedFactor) : 0;
      // Fleet expansion beyond named projects (yr 8+) — the programme's rolling build
      const fleetExpansion = t >= 8 ? (t - 7) * 2.0 * ns * koreanSpeedFactor : 0;

      const nucGW = Math.max(0, B.nuclearGW + agr + hpc + szc + smrOnline + korOnline + fleetExpansion);

      // Nuclear capex: WP schedule, scaled by programme size and cost factors
      // Korean partnership reduces cost. Cost overrun increases it. Both independent.
      const wpNucCost = (WP_NUCLEAR_NET_COST[t] || 10) * ns * costMult * koreanCostFactor;
      cumNucCapex += wpNucCost;

      // Nuclear electricity revenue
      const nucTWh = nucGW * B.nuclearCF * 8.766;
      const nucRevenue = nucTWh * (twoTierPricing ? 37.5 : 55) / 1000; // £/MWh blended price
      const nucNet = wpNucCost - nucRevenue;

      // Previous year's energy price (for CfD settlement — avoids circularity)
      const energyPricePrev = i > 0 ? (rows[i-1].energyPrice as number) : B.wholesalePrice;

      // ── Renewables (nuanced cost model)
      const renScale = renewableScale / 100;
      // Offshore wind ramps toward target, onshore/solar grow at DESNZ trajectory
      const offshoreGW = B.offshoreWind + (offshoreWindTarget - B.offshoreWind) * Math.min(1, t / 10) * renScale;
      const onshoreGW = B.onshoreWind * (1 + 0.02 * t) * renScale;   // slower: planning constraints
      const solarGW = B.solar * (1 + 0.06 * t) * renScale;           // faster: cheaper, easier
      const otherRenGW = B.otherRenewable;                            // biomass/hydro flat
      const renGW = offshoreGW + onshoreGW + solarGW + otherRenGW;

      // CfD costs: (strike - wholesale) * covered TWh. Negative = profit to Treasury
      const offshoreWindTWh = offshoreGW * B.offshoreWindCF * 8.766;
      const onshoreWindTWh = onshoreGW * B.onshoreWindCF * 8.766;
      const solarTWh = solarGW * B.solarCF * 8.766;
      // Existing CfD portfolio at legacy strikes + new build at user's strike price
      const legacyTWh = Math.min(B.cfdPortfolioTWh, offshoreWindTWh * 0.5); // legacy shrinks as % of total
      const newCfdTWh = offshoreWindTWh - legacyTWh + onshoreWindTWh * 0.3 + solarTWh * 0.4;
      // When wholesale > strike, CfD generators PAY BACK the difference
      const legacyCfdCost = legacyTWh * (B.cfdAvgStrike - energyPricePrev) / 1000; // £bn
      const newCfdCost = newCfdTWh * (cfdStrikeOverride - energyPricePrev) / 1000;
      const totalCfdCost = legacyCfdCost + newCfdCost; // can be negative (Treasury profit)

      // Curtailment: wind paid to NOT generate. Rises with penetration.
      // NESO: 8% in 2024. Rises ~1pp per 5GW offshore added without matching storage/interconnection.
      const curtailmentBase = B.curtailmentPct + Math.max(0, offshoreGW - B.offshoreWind) * 0.2;
      const curtailmentEffective = curtailmentBase * (1 - curtailmentMitigation / 100 * 0.6); // storage etc helps
      const curtailmentCost = (offshoreWindTWh + onshoreWindTWh) * (curtailmentEffective / 100) * B.curtailmentCostMWh / 1000;

      // Balancing costs: system integration cost for intermittency (backup, frequency response)
      const intermittentTWh = offshoreWindTWh + onshoreWindTWh + solarTWh;
      const intermittentShare = intermittentTWh / B.demandTWh;
      // Cost rises non-linearly with penetration (Imperial/UKERC: £10-25/MWh at 60%+ share)
      const balancingPerMWh = B.balancingCostMWh * (1 + Math.max(0, intermittentShare - 0.4) * 2);
      const balancingCost = intermittentTWh * balancingPerMWh / 1000;

      // Capacity market: backup gas/storage payments. Rises if closing gas without nuclear replacement.
      const capacityMktCost = B.capacityMarket * (1 + Math.max(0, 0.5 - nucGW / B.peakDemandGW) * 2);

      // Grid investment: offshore transmission + onshore reinforcement
      // NESO: £54bn offshore + £22bn onshore over ~10 years. Annualised and scaled.
      const gridBuildPace = gridInvestPace / 100;
      const annualGridCost = ((B.offshoreGridCost + B.onshoreGridCost) / 12) * gridBuildPace *
        (t < 10 ? 1.0 : 0.3); // front-loaded: most spend in first decade

      // Total renewable system cost (net of CfD — can be negative if wholesale high)
      const windCfd = totalCfdCost; // renamed for compatibility
      const gridCost = annualGridCost;
      const renewableSysCost = totalCfdCost + curtailmentCost + balancingCost + capacityMktCost + annualGridCost;

      // ── PILLAR 3: Reform savings (WP methodology — discounted)
      const rd = reformDiscount;
      // Triple lock: arithmetic, reliable. WP: £40.5bn by yr 10 (full), CPI+0.5%
      const pensionSaving = tripleLockReform
        ? (40.5 * Math.min(1, t / 10) * rd + (spaAccelerate && t >= 3 ? 7.5 * Math.min(1, (t - 3) / 5) * rd : 0))
        : 0;
      // PIP reform: CSJ £7.4bn gross → £4-6bn net. WP discount.
      const pipSaving = pipReform ? 6 * Math.min(1, t / 6) * rd : 0;
      // WCA tighten: £8.5bn gross → £4-6bn net
      const wcaSaving = wcaTighten ? 6 * Math.min(1, t / 6) * rd : 0;
      // AI public sector: Public First up to £38bn/yr. WP halved to £10-18bn
      const aiSaving = 18 * (aiPublicSector / 100) * Math.min(1, t / 8) * rd;
      // NHS MH reinvestment (offset)
      const nhsCost = nhsMHInvest ? 3 * Math.min(1, t / 3) : 0;
      // National Opportunity Fund (offset)
      const nofCost = nationalOpportunityFund ? 5 * Math.min(1, t / 2) : 0;

      const totalReformSaving = pensionSaving + pipSaving + wcaSaving + aiSaving - nhsCost - nofCost;

      // ── PILLAR 4: Tax & Industrial effects
      // Employer NIC cut: costs £108bn at 100%, stimulates growth
      const nicCost = B.employerNICs * (employerNICut / 100);
      const nicGrowthBoost = employerNICut * 0.008; // ~0.8% growth per 100% cut

      // Corp tax: deviation from 25% base
      const corpTaxChange = (corpTaxRate - 25) * B.corpTaxRevenue * 0.012; // ~1.2% of revenue per pp

      // LVT revenue: 1% on £5.5tn = £55bn (scales linearly)
      const lvtRevenue = 55 * (lvt / 100);

      // Planning reform: OBR +0.2% GDP by 2029, +0.4% by 2034
      const planningGrowth = (planningReform / 100) * (t < 5 ? 0.04 * t : 0.2 + 0.04 * Math.min(5, t - 5));

      // Freeport / IZ expansion (22 zones, £6.4bn attracted to date)
      const freeportGrowth = (freeportExpansion / 100) * 0.15 * Math.min(1, t / 5);
      const freeportTax = (freeportExpansion / 100) * 2 * Math.min(1, t / 5);

      // Industrial investments (cost now, revenue later)
      const steelCost = greenSteelInvest ? (t < 4 ? 0.6 : 0) : 0;
      const gigaCost = gigafactories ? (t < 4 ? 1.0 : 0) : 0;
      const gigaRev = gigafactories && t >= 4 ? 1.5 * Math.min(1, (t - 3) / 4) : 0;
      const industrialGrowth = (greenSteelInvest ? 0.05 : 0) + (gigafactories ? 0.1 : 0);

      // ── ENERGY PRICE (computed first — DC demand depends on it)
      const reliableCap = nucGW + renGW * 0.30; // wind CF ~0.30 equiv
      // Use previous year's DC to avoid circular dependency (price → DC → price)
      const prevDC = i > 0 ? (rows[i-1].dcDemand as number) : B.currentDC;
      const totalDemand = B.peakDemandGW + prevDC * 0.7;
      const capacityRatio = reliableCap / totalDemand;
      const priceEffect = capacityRatio > 1.3 ? 0.55 : capacityRatio > 1 ? 0.7 : capacityRatio > 0.8 ? 0.9 : 1.1;
      const energyPrice = Math.max(18, B.wholesalePrice * priceEffect * (1 + costOverrun * 0.001));

      // ── PILLAR 2: Data centre demand (ENDOGENOUS)
      // WP: "The country that can offer guaranteed, cheap, clean power with fast
      //  connection timelines captures a disproportionate share"
      // DC demand is driven by: energy price, nuclear capacity (reliability signal),
      // planning reform (connection speed), and investment climate multiplier
      // 50GW queued in grid (NESO). Hyperscalers need guaranteed clean baseload.
      const dcPriceSignal = Math.max(0, (80 - energyPrice) / 40); // 0 at £80+, 1 at £40
      const dcCapacitySignal = Math.min(1, nucGW / 25);           // confidence in supply
      const dcPlanningSignal = planningReform / 100 * 0.5;        // connection speed
      const dcClimate = dcInvestmentClimate / 100;
      // Peak potential: ~20GW (WP: 10-20GW). Ramps over time as infrastructure builds.
      const dcDemand = Math.min(30, 20 * (dcPriceSignal * 0.4 + dcCapacitySignal * 0.4 + dcPlanningSignal * 0.2) * dcClimate * Math.min(1, t / 5));

      const dcTaxRevenue = dcDemand * 0.5 * Math.min(1, t / 4);

      // ── GROWTH CALCULATION (WP table p13)
      const gm = scenarioMult;
      // WP channels: nuclear construction, cheap energy, AI, planning, data centres
      const cheapEnergyGrowth = nucGW > 20 ? 0.4 : nucGW > 10 ? 0.2 : nucGW > 5 ? 0.05 : 0;
      const nucConstructionGrowth = t < 12 ? 0.2 * ns : 0.05;
      const aiProdGrowth = (aiPublicSector / 100) * (t < 3 ? 0.1 : t < 6 ? 0.3 : 0.6);
      const dcGrowthEffect = (dcDemand / 15) * (t < 3 ? 0.05 : t < 6 ? 0.15 : 0.3);
      const growthUplift = (cheapEnergyGrowth + nucConstructionGrowth + aiProdGrowth +
        planningGrowth + dcGrowthEffect + freeportGrowth + nicGrowthBoost + industrialGrowth) * gm;
      const reformedGrowth = Math.min(6, baseGrowth + growthUplift);

      // ── CO2
      const co2 = Math.min(95, 25 + nucGW * 0.5 + renGW * 0.12 +
        (greenSteelInvest ? 3 : 0) + (gigafactories ? 2 : 0));

      // ── REFORMED DEFICIT
      // Reformed path: user's spending choices + reform savings + energy/industrial costs
      const reformedDeficit = reformedSpend - rev
        - totalReformSaving
        + nucNet
        + renewableSysCost
        - dcTaxRevenue
        + nicCost - corpTaxChange - lvtRevenue - freeportTax
        + steelCost + gigaCost - gigaRev;

      // ── DEBT
      baseDebt += baseDeficit;
      refDebt += reformedDeficit;
      const refGdp = B.gdpNominal * Math.pow(1 + reformedGrowth / 100 + inflation / 100, t);
      const debtGdp = (refDebt / refGdp) * 100;
      const baseDebtGdp = (baseDebt / gdp) * 100;
      // Net of asset (WP concept: subtract nuclear asset value)
      const assetValue = cumNucCapex * 0.8; // 80% of capex = asset value
      const netDebtGdp = ((refDebt - assetValue) / refGdp) * 100;

      // ── Export revenue
      const surplusGW = Math.max(0, reliableCap - totalDemand);
      const exportRev = surplusGW * 0.6; // £0.6bn per GW exported

      // ── Household bill estimate
      const billEffect = energyPrice / B.wholesalePrice;
      const householdBill = Math.round(B.householdBill * billEffect);

      // ── SCORES
      const energyScore = Math.min(100, Math.round(
        Math.max(0, (capacityRatio - 0.5) * 50) + Math.max(0, (85 - energyPrice) * 0.6) + (nucGW > 20 ? 15 : nucGW > 10 ? 8 : 0)
      ));
      const fiscalScore = Math.min(100, Math.round(
        Math.max(0, (115 - debtGdp) * 0.7) + (reformedDeficit < 50 ? 10 : 0) + (reformedDeficit < 0 ? 25 : 0)
      ));
      const greenScore = Math.min(100, Math.round(co2));
      const industrialScore = Math.min(100, Math.round(
        Math.min(dcDemand, 30) * 1.5 + exportRev * 1.5 +
        reformedGrowth * 5 + (gigafactories ? 8 : 0) + (greenSteelInvest ? 5 : 0)
      ));
      const growthScore = Math.min(100, Math.round(reformedGrowth / 4 * 100));

      rows.push({
        year: YR_LABELS[t],
        nuclearGW: +nucGW.toFixed(1),
        renewableGW: +renGW.toFixed(1),
        energyPrice: Math.round(energyPrice),
        householdBill,
        reformedGrowth: +reformedGrowth.toFixed(1),
        baseGrowth: +(B.obrBaseGrowth[t] || 1.5).toFixed(1),
        deficit: Math.round(reformedDeficit),
        baseDeficit: Math.round(baseDeficit),
        debtGdp: +debtGdp.toFixed(1),
        baseDebtGdp: +baseDebtGdp.toFixed(1),
        netDebtGdp: +netDebtGdp.toFixed(1),
        co2: Math.round(co2),
        totalReformSaving: Math.round(totalReformSaving),
        pensionSaving: Math.round(pensionSaving),
        pipSaving: Math.round(pipSaving + wcaSaving),
        aiSaving: Math.round(aiSaving),
        nucCost: Math.round(nucNet),
        dcTax: +dcTaxRevenue.toFixed(1),
        exportRev: +exportRev.toFixed(1),
        dcDemand: +dcDemand.toFixed(1),
        energyScore, fiscalScore, greenScore, industrialScore, growthScore,
        cfdCost: +totalCfdCost.toFixed(1),
        curtailCost: +curtailmentCost.toFixed(1),
        balanceCost: +balancingCost.toFixed(1),
        capMktCost: +capacityMktCost.toFixed(1),
        gridCost: +annualGridCost.toFixed(1),
        renewSysCost: +renewableSysCost.toFixed(1),
        windCfd: Math.round(windCfd),
        debtInt: Math.round(debtInt),
        debtStock: Math.round(refDebt),
        lvtRev: Math.round(lvtRevenue),
        nicCost: Math.round(nicCost),
        nhsSpend: Math.round(nhsSpd),
        defenceSpend: Math.round(defenceSpd),
        eduSpend: Math.round(eduSpd),
        totalDeptSpend: Math.round(totalDeptSpend),
      });
    }
    return rows;
  }, [baseGrowth, inflation, giltRate, giltSpread, nuclearScale, costOverrun,
      koreanPartnership, smrUnits, koreanGW,
      dcInvestmentClimate, twoTierPricing,
      tripleLockReform, spaAccelerate, pipReform, wcaTighten, nhsMHInvest,
      aiPublicSector, nationalOpportunityFund,
      employerNICut, corpTaxRate, planningReform, freeportExpansion, lvt,
      greenSteelInvest, gigafactories,
      energyBonds, renewableScale, offshoreWindTarget, cfdStrikeOverride,
      gridInvestPace, curtailmentMitigation,
      nhsGrowth, defenceTarget, educationGrowth, asylumSpend,
      publicSectorEfficiency, localGovGrowth,
      scenarioMult, reformDiscount]);

  const last = data[YEARS - 1] as Record<string, number>;
  const yr10 = data[Math.min(9, YEARS - 1)] as Record<string, number>;

  const totalScore = Math.round(
    (last.energyScore as number) * 3 + (last.fiscalScore as number) * 2 +
    (last.greenScore as number) * 2 + (last.industrialScore as number) * 2 +
    (last.growthScore as number)
  );
  const grade = getGrade(totalScore);

  // Achievement checks
  useEffect(() => {
    const newU = new Set(unlockedAchs);
    let added = false;
    const check = (id: string, cond: boolean) => { if (cond && !newU.has(id)) { newU.add(id); added = true; setToastQueue(q => [...q, id]); } };
    check("abundance", data.some(r => (r.energyPrice as number) < 40));
    check("titan", data.some(r => (r.nuclearGW as number) >= 30));
    check("independence", data.some(r => {
      const rel = (r.nuclearGW as number) + (r.renewableGW as number) * 0.3;
      return rel >= B.peakDemandGW * 1.2;
    }));
    check("green", data.some(r => (r.co2 as number) >= 70));
    check("surplus", data.some(r => (r.deficit as number) < 0));
    check("growth", data.some(r => (r.reformedGrowth as number) >= 3));
    check("hawk", (last.debtGdp as number) < 90);
    check("compute", data.some(r => (r.dcDemand as number) >= 20));
    check("exporter", data.some(r => (r.exportRev as number) > 8));
    check("golden", totalScore >= 900);
    if (added) setUnlockedAchs(newU);
  }, [data, totalScore]);

  useEffect(() => {
    if (toastQueue.length === 0) return;
    const t = setTimeout(() => setToastQueue(q => q.slice(1)), 3500);
    return () => clearTimeout(t);
  }, [toastQueue]);

  // Headline
  const headline = useMemo(() => {
    const l = last;
    if ((l.energyPrice as number) < 35) return { text: "BREAKING: UK energy prices hit all-time low — manufacturers return to Britain", type: "good" as const };
    if ((l.nuclearGW as number) > 40) return { text: "Britain becomes world's second-largest nuclear power — 'the French model, done faster'", type: "good" as const };
    if ((l.reformedGrowth as number) > 3.5) return { text: "UK leads G7 growth as energy abundance powers industrial renaissance", type: "good" as const };
    if ((last.dcDemand as number) > 15) return { text: "UK overtakes Ireland as Europe's AI compute capital — hyperscalers flock to cheap nuclear power", type: "good" as const };
    if ((l.deficit as number) < 0) return { text: "Chancellor announces first budget surplus in a generation — 'the doom loop is broken'", type: "good" as const };
    if ((l.debtGdp as number) > 115) return { text: "IMF warns UK debt trajectory 'unsustainable' — gilt vigilantes circle", type: "bad" as const };
    if (giltSpread > 80) return { text: "GILT CRISIS: Yields spike as markets question nuclear spending programme", type: "bad" as const };
    if ((l.energyPrice as number) > 85) return { text: "Energy crisis deepens: UK industrial electricity costs remain highest in G7", type: "bad" as const };
    if ((l.nuclearGW as number) < 3) return { text: "Britain's nuclear capacity hits historic low as last AGR stations close", type: "bad" as const };
    if ((l.reformedGrowth as number) < 1) return { text: "OBR slashes growth forecast — doom loop tightens", type: "bad" as const };
    if ((l.co2 as number) > 60) return { text: "UK emissions hit lowest level since 1880 as nuclear fleet powers the grid", type: "good" as const };
    return { text: "Simulation active — drag sliders to model Britain's energy future", type: "neutral" as const };
  }, [last, giltSpread]);

  const surplus = (last.deficit as number) < 0;
  const radarData = [
    { axis: "Energy", value: last.energyScore },
    { axis: "Fiscal", value: last.fiscalScore },
    { axis: "Green", value: last.greenScore },
    { axis: "Industry", value: last.industrialScore },
    { axis: "Growth", value: last.growthScore },
  ];

  const reset = () => {
    setBaseGrowth(1.5); setInflation(2.5); setGiltRate(4.5); setGiltSpread(0);
    setNuclearScale(100); setCostOverrun(0); setKoreanPartnership(true); setSmrUnits(8);
    setKoreanGW(0); setDcInvestmentClimate(100); setTwoTierPricing(true);
    setTripleLockReform(true); setSpaAccelerate(false); setPipReform(true);
    setWcaTighten(true); setNhsMHInvest(true); setAiPublicSector(50);
    setNationalOpportunityFund(true); setEmployerNICut(0); setCorpTaxRate(25);
    setPlanningReform(100); setFreeportExpansion(50); setLvt(0);
    setGreenSteelInvest(true); setGigafactories(true);
    setEnergyBonds(true); setRenewableScale(100);
    setOffshoreWindTarget(50); setCfdStrikeOverride(73); setGridInvestPace(100);
    setCurtailmentMitigation(50);
    setNhsGrowth(3.6); setDefenceTarget(2.5); setEducationGrowth(2.5);
    setAsylumSpend(4.5); setPublicSectorEfficiency(0); setLocalGovGrowth(3.0);
    setScenario("central"); setUnlockedAchs(new Set()); setToastQueue([]);
  };

  // Endogenous DC demand from last row for display
  const endogenousDC = data.length > 0 ? (data[data.length - 1].dcDemand as number) : 0;

  const quickScenarios = [
    { label: "Do Nothing", fn: () => { setNuclearScale(0); setSmrUnits(0); setKoreanGW(0); setPipReform(false); setWcaTighten(false); setTripleLockReform(false); setAiPublicSector(0); setPlanningReform(0); setDcInvestmentClimate(30); setPublicSectorEfficiency(0); setNhsGrowth(3.6); setDefenceTarget(2.3); } },
    { label: "White Paper Central", fn: reset },
    { label: "Korean + SMR Blitz", fn: () => { setKoreanPartnership(true); setKoreanGW(10); setSmrUnits(16); setNuclearScale(130); setCostOverrun(-20); } },
    { label: "Gilt Crisis (+130bp)", fn: () => { setGiltSpread(130); setBaseGrowth(0.8); } },
    { label: "AI Supercycle", fn: () => { setAiPublicSector(100); setDcInvestmentClimate(150); setPlanningReform(100); } },
    { label: "Full Radical Reform", fn: () => { reset(); setTripleLockReform(true); setSpaAccelerate(true); setAiPublicSector(80); setEmployerNICut(30); setLvt(50); setPlanningReform(100); setFreeportExpansion(100); setKoreanGW(8); setSmrUnits(16); setNuclearScale(130); setDcInvestmentClimate(130); setPublicSectorEfficiency(1.5); setAsylumSpend(2); } },
    { label: "Austerity", fn: () => { reset(); setNhsGrowth(1.5); setDefenceTarget(2.0); setEducationGrowth(1.0); setAsylumSpend(2); setPublicSectorEfficiency(2.5); setLocalGovGrowth(1.0); setNationalOpportunityFund(false); setNhsMHInvest(false); } },
    { label: "Reset All", fn: reset },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(155deg, #050a12 0%, #0f172a 40%, #0a1628 100%)", color: "#e8ecf2", fontFamily: SANS, padding: "18px 14px" }}>
      <div style={{ maxWidth: 1340, margin: "0 auto" }}>

        {/* TOASTS */}
        {toastQueue.length > 0 && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, display: "flex", flexDirection: "column", gap: 8 }}>
            {toastQueue.map(id => {
              const a = ACHS.find(x => x.id === id)!;
              return (<div key={id} style={{ background: "rgba(15,23,42,0.95)", border: `1px solid ${COLORS.gold}`, borderRadius: 10, padding: "12px 20px", backdropFilter: "blur(10px)", animation: "slideIn 0.3s ease-out", boxShadow: `0 0 30px ${COLORS.gold}22` }}>
                <div style={{ fontSize: 9, fontFamily: MONO, color: COLORS.gold, letterSpacing: "0.2em" }}>ACHIEVEMENT UNLOCKED</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.teal }}>{a.title}</div>
                <div style={{ fontSize: 10, color: "#6b7a8d", fontFamily: MONO }}>{a.desc}</div>
              </div>);
            })}
          </div>
        )}

        {/* HEADER */}
        <header style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(78,205,196,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 8.5, fontFamily: MONO, color: COLORS.teal, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 3 }}>
                Breaking the Doom Loop v2.0 · Parametric Fiscal Model
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em", background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ENERGY ABUNDANCE
              </h1>
              <div style={{ fontSize: 9.5, fontFamily: MONO, color: "#3a4558", marginTop: 3 }}>
                4 pillars: Nuclear Fleet · Compute Hub · Welfare Reform · Tax & Industrial Strategy
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 8, fontFamily: MONO, color: "#5a6578" }}>SCORE</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: MONO, color: COLORS.teal }}>{totalScore}</div>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: 11, border: `2px solid ${grade.color}`, background: `${grade.color}12`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 900, fontFamily: MONO, color: grade.color, lineHeight: 1 }}>{grade.grade}</div>
                <div style={{ fontSize: 6.5, fontFamily: MONO, color: grade.color }}>{grade.label.toUpperCase()}</div>
              </div>
            </div>
          </div>
          {/* Headline */}
          <div style={{ marginTop: 10, padding: "7px 12px", borderRadius: 8, background: headline.type === "good" ? "rgba(78,205,196,0.06)" : headline.type === "bad" ? "rgba(255,107,107,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${headline.type === "good" ? COLORS.teal + "22" : headline.type === "bad" ? COLORS.red + "22" : "#1e2836"}` }}>
            <span style={{ fontSize: 7.5, fontFamily: MONO, color: "#3a4558", marginRight: 8 }}>2040 OUTLOOK</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, fontFamily: SANS, color: headline.type === "good" ? COLORS.teal : headline.type === "bad" ? COLORS.red : "#8892a4" }}>{headline.text}</span>
          </div>
        </header>

        {/* TAB BAR */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid #1e2836" }}>
          {[
            { id: "model" as const, label: "PARAMETRIC MODEL" },
            { id: "whitepaper" as const, label: "WHITE PAPER" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "8px 20px", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? COLORS.teal : "transparent"}`,
              background: activeTab === tab.id ? "rgba(78,205,196,0.06)" : "transparent",
              color: activeTab === tab.id ? COLORS.teal : "#5a6578",
              fontSize: 11, fontFamily: MONO, fontWeight: activeTab === tab.id ? 700 : 400,
              letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.2s",
            }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === "whitepaper" && (
          <div style={{ background: "rgba(15,23,42,0.4)", borderRadius: 12, border: "1px solid rgba(78,205,196,0.08)", overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(78,205,196,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: SANS, color: "#e8ecf2" }}>Breaking the Doom Loop v2.0</div>
                <div style={{ fontSize: 9, fontFamily: MONO, color: "#5a6578" }}>A 4-Pillar Programme for Energy Abundance</div>
              </div>
              <a href="/Breaking_The_Doom_Loop_v2.pdf" target="_blank" rel="noopener noreferrer" style={{
                padding: "6px 14px", borderRadius: 6, border: `1px solid ${COLORS.teal}33`,
                background: `${COLORS.teal}12`, color: COLORS.teal,
                fontSize: 10, fontFamily: MONO, textDecoration: "none", fontWeight: 600,
              }}>DOWNLOAD PDF</a>
            </div>
            <WhitePaper />
          </div>
        )}

        {activeTab === "model" && (<>
        {/* SCENARIO + STATS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <ScenarioBtn label="PESSIMISTIC" active={scenario === "pessimistic"} onClick={() => setScenario("pessimistic")} color={COLORS.red} />
          <ScenarioBtn label="CENTRAL" active={scenario === "central"} onClick={() => setScenario("central")} color={COLORS.teal} />
          <ScenarioBtn label="OPTIMISTIC" active={scenario === "optimistic"} onClick={() => setScenario("optimistic")} color={COLORS.blue} />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 8, fontFamily: MONO, color: "#222b3a" }}>Reform discount: {Math.round(reformDiscount * 100)}% (IFS methodology: UK reforms deliver 40-70% of projections)</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <StatBox label="NUCLEAR 2040" value={`${last.nuclearGW}GW`} sub={`from ${B.nuclearGW}GW`} color={COLORS.blue} />
          <StatBox label="£/MWh" value={`£${last.energyPrice}`} sub={`household: £${last.householdBill}/yr`} color={(last.energyPrice as number) < 50 ? COLORS.green : (last.energyPrice as number) < 70 ? COLORS.yellow : COLORS.red} warn={(last.energyPrice as number) > 80} />
          <StatBox label="GROWTH" value={`${last.reformedGrowth}%`} sub={`OBR: ${last.baseGrowth}%`} color={(last.reformedGrowth as number) >= 3 ? COLORS.green : COLORS.yellow} />
          <StatBox label="DEFICIT" value={`£${Math.abs(last.deficit as number)}bn`} sub={surplus ? "SURPLUS" : "deficit"} color={surplus ? COLORS.green : COLORS.red} warn={!surplus && (last.deficit as number) > 80} />
          <StatBox label="DEBT/GDP" value={`${last.debtGdp}%`} sub={`net of asset: ${last.netDebtGdp}%`} color={(last.debtGdp as number) < 95 ? COLORS.teal : COLORS.red} warn={(last.debtGdp as number) > 110} />
          <StatBox label="DEBT INT" value={`£${last.debtInt}bn`} sub={`base: £${B.debtInterest}bn`} color={(last.debtInt as number) > 130 ? COLORS.red : COLORS.yellow} warn={(last.debtInt as number) > 150} />
          <StatBox label="DATA CENTRES" value={`${endogenousDC.toFixed(1)}GW`} sub="endogenous demand" color={COLORS.cyan} />
        </div>

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 14, alignItems: "start" }}>

          {/* ═══ LEFT: ALL CONTROLS ═══ */}
          <div className="controls-panel" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto", paddingRight: 4 }}>

            <Card title="Macro & Gilt Market" accent={COLORS.yellow}>
              <Slider label="Baseline Growth" min={0} max={3} step={0.1} value={baseGrowth} onChange={setBaseGrowth} unit="%" source="OBR Nov 2025: 1.5%" />
              <Slider label="Inflation" min={1} max={5} step={0.1} value={inflation} onChange={setInflation} unit="%" source="BoE target: 2.0%" />
              <Slider label="Gilt Yield" min={2} max={8} step={0.1} value={giltRate} onChange={setGiltRate} unit="%" source="Current: 4.5%. +1pp = +£20.8bn interest (OBR)" />
              <Slider label="Gilt Spread (bp)" min={-50} max={200} step={5} value={giltSpread} onChange={setGiltSpread} unit="bp" source="Truss crisis: +130bp. Energy Bonds can offset." />
              <Toggle label="50-Year Energy Bonds" checked={energyBonds} onChange={setEnergyBonds} source="Dedicated issuance backed by nuclear PPAs" />
            </Card>

            <Card title="Departmental Spending" accent={COLORS.pink}>
              <Slider label="NHS Real Growth" min={0} max={7} step={0.1} value={nhsGrowth} onChange={setNhsGrowth} unit="%" source="OBR: 3.4-3.8%. Wanless: 4.2% needed. Current: £180bn" />
              <Slider label="Defence (% GDP)" min={1.5} max={3.5} step={0.1} value={defenceTarget} onChange={setDefenceTarget} unit="%" source="NATO: 2.5% target. SDR 2025: £62.2bn (2.3%)" />
              <Slider label="Education Growth" min={0} max={5} step={0.1} value={educationGrowth} onChange={setEducationGrowth} unit="%" source="Schools + HE. Current: £105bn. IFS: real cut since 2010" />
              <Slider label="Asylum/Immigration" min={0} max={10} step={0.5} value={asylumSpend} onChange={setAsylumSpend} unit="£bn" source="Home Office: £4.5bn. Rwanda scheme was £0.7bn. Hotels £8m/day" />
              <Slider label="Local Gov Growth" min={0} max={5} step={0.1} value={localGovGrowth} onChange={setLocalGovGrowth} unit="%" source="DLUHC: £40bn. Councils face 3.5% cost growth (LGA)" />
              <Slider label="Dept Efficiency Saving" min={0} max={3} step={0.1} value={publicSectorEfficiency} onChange={setPublicSectorEfficiency} unit="%" source="Applies to other depts. 1% = ~£5bn/yr. Gershon: 2.5% max" />
              <div style={{ fontSize: 8.5, fontFamily: MONO, color: "#3a4558", lineHeight: 1.4, marginTop: 4 }}>
                Year {YEARS}: NHS £{last.nhsSpend}bn · Defence £{last.defenceSpend}bn · Edu £{last.eduSpend}bn · Dept Total £{last.totalDeptSpend}bn
              </div>
            </Card>

            <Card title="Pillar 1: Nuclear Fleet" accent={COLORS.blue}>
              <Slider label="Programme Scale" min={0} max={150} step={5} value={nuclearScale} onChange={setNuclearScale} unit="%" source="100% = WP schedule. 15-20GW by yr10, 50GW by yr20" />
              <Slider label="Cost Overrun / Underrun" min={-30} max={100} step={5} value={costOverrun} onChange={setCostOverrun} unit="%" source="HPC: 3x original. Korean builds: typically on budget." />
              <Slider label="SMR Units (Rolls-Royce)" min={0} max={20} step={1} value={smrUnits} onChange={setSmrUnits} source="£2.5bn/unit, 0.47GW each. Wylfa site: up to 8." />
              <Slider label="Korean APR1400 (GW)" min={0} max={15} step={0.5} value={koreanGW} onChange={setKoreanGW} unit="GW" source="£3.3bn/GW vs £14.4bn/GW HPC. 48-month design build." />
              <Toggle label="Korean Partnership (KEPCO)" checked={koreanPartnership} onChange={setKoreanPartnership} source="30% cost reduction + 30% faster build. Workforce + project mgmt." />
              <div style={{ fontSize: 8, fontFamily: MONO, color: "#2a3441", lineHeight: 1.4, marginTop: 4 }}>
                Assumes: BEC Act (legislative fast-track), Nuclear Skills Academy (50-80k workers),
                defence-civil nuclear integration, standardised design, primary legislation for approvals.
              </div>
            </Card>

            <Card title="Pillar 2: Compute Hub (Endogenous)" accent={COLORS.cyan}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: MONO, color: "#8892a4" }}>DC Demand (computed)</span>
                  <span style={{ fontSize: 14, fontFamily: MONO, fontWeight: 800, color: COLORS.cyan }}>{endogenousDC.toFixed(1)} GW</span>
                </div>
                <div style={{ fontSize: 8.5, fontFamily: MONO, color: "#3a4558", lineHeight: 1.4 }}>
                  Driven by energy price, nuclear capacity, and planning reform speed.
                  Hyperscalers go where cheap, clean, guaranteed power is. 50GW queued in grid (NESO).
                </div>
              </div>
              <Slider label="Investment Climate" min={30} max={200} step={5} value={dcInvestmentClimate} onChange={setDcInvestmentClimate} unit="%" source="Policy attractiveness: visas, tax, regulation, fibre." />
              <Toggle label="Two-Tier Pricing" checked={twoTierPricing} onChange={setTwoTierPricing} source="Firm nuclear £35-40/MWh + surplus wind £10-20/MWh" />
            </Card>

            <Card title="Pillar 3: Welfare Reform" accent={COLORS.purple}>
              <Toggle label="Reform Triple Lock → CPI+0.5%" checked={tripleLockReform} onChange={setTripleLockReform} source="IFS: saves £12bn/yr vs earnings-only. £40.5bn by yr10" />
              <Toggle label="Accelerate SPA to 68 (by 2033)" checked={spaAccelerate} onChange={setSpaAccelerate} source="Saves £5-10bn at full effect" />
              <Toggle label="PIP Reform (mild MH)" checked={pipReform} onChange={setPipReform} source="CSJ: £7.4bn gross → £4-6bn net after IFS discount" />
              <Toggle label="Tighten WCA (UC Health)" checked={wcaTighten} onChange={setWcaTighten} source="£8.5bn gross → £4-6bn net. 800k claimants affected" />
              <Toggle label="NHS Mental Health Investment" checked={nhsMHInvest} onChange={setNhsMHInvest} source="£2-3bn/yr. 'Treatment not cheques' requires treatment" />
              <Toggle label="National Opportunity Fund (£5bn/yr)" checked={nationalOpportunityFund} onChange={setNationalOpportunityFund} source="Retraining, transition payments. Reduces net savings." />
              <Slider label="AI Public Sector Adoption" min={0} max={100} step={5} value={aiPublicSector} onChange={setAiPublicSector} unit="%" source="Public First: £38bn/yr. WP halved: £10-18bn realistic" />
            </Card>

            <Card title="Pillar 4: Tax & Industrial Strategy" accent={COLORS.orange}>
              <Slider label="Employer NIC Cut" min={0} max={50} step={5} value={employerNICut} onChange={setEmployerNICut} unit="%" source="NICs raise £108bn/yr. WP: immediate benefit to every business" />
              <Slider label="Corporation Tax" min={15} max={30} step={1} value={corpTaxRate} onChange={setCorpTaxRate} unit="%" source="Current: 25%. Revenue: £91.2bn. IFS Laffer peak: ~36%" />
              <Slider label="Planning Reform" min={0} max={100} step={5} value={planningReform} onChange={setPlanningReform} unit="%" source="OBR: +0.2% GDP by 2029, +0.4% by 2034. Also drives DC demand." />
              <Slider label="Freeport/IZ Expansion" min={0} max={100} step={10} value={freeportExpansion} onChange={setFreeportExpansion} unit="%" source="22 zones, £6.4bn attracted to date. Extended to 2031-34" />
              <Slider label="Land Value Tax" min={0} max={100} step={5} value={lvt} onChange={setLvt} unit="%" source="1% on £5.5tn land = £55bn/yr. Radical: replaces business rates." />
              <Toggle label="Green Steel (£2.5bn)" checked={greenSteelInvest} onChange={setGreenSteelInvest} source="EAF transition. Tata Port Talbot, British Steel Scunthorpe" />
              <Toggle label="Gigafactory Programme" checked={gigafactories} onChange={setGigafactories} source="Agratas 40GWh + AESC 20GWh. UK needs 100GWh+ by 2030s" />
            </Card>

            <Card title="Renewables, CfDs & Grid" accent={COLORS.green}>
              <Slider label="Renewable Build Rate" min={50} max={200} step={5} value={renewableScale} onChange={setRenewableScale} unit="%" source="100% = DESNZ pipeline trajectory" />
              <Slider label="Offshore Wind Target" min={15} max={80} step={1} value={offshoreWindTarget} onChange={setOffshoreWindTarget} unit="GW" source="Govt: 43-50GW by 2030. Current: 15.8GW. AR6: £82/MWh" />
              <Slider label="CfD Strike Price (new)" min={30} max={120} step={1} value={cfdStrikeOverride} onChange={setCfdStrikeOverride} unit="£/MWh" source="AR4:£37 AR5:£58(failed) AR6:£82. Legacy avg: £58/MWh" />
              <Slider label="Grid Investment Pace" min={30} max={150} step={5} value={gridInvestPace} onChange={setGridInvestPace} unit="%" source="NESO: £54bn offshore + £22bn onshore. 100% = on schedule" />
              <Slider label="Curtailment Mitigation" min={0} max={100} step={5} value={curtailmentMitigation} onChange={setCurtailmentMitigation} unit="%" source="Storage + interconnectors. 0%: 2024 levels. 100%: halved." />
              <div style={{ fontSize: 8.5, fontFamily: MONO, color: "#3a4558", lineHeight: 1.5, marginTop: 4 }}>
                Year {YEARS} costs: CfD £{last.cfdCost}bn · Curtail £{last.curtailCost}bn · Balancing £{last.balanceCost}bn · Grid £{last.gridCost}bn · Cap Mkt £{last.capMktCost}bn
                <br/>Total renewable system cost: £{last.renewSysCost}bn/yr
              </div>
            </Card>

            <Card title="Quick Scenarios" accent={COLORS.yellow}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {quickScenarios.map(({ label, fn }) => (
                  <button key={label} onClick={fn} style={{
                    padding: "6px 12px", borderRadius: 6, border: "1px solid #2a3441",
                    background: "rgba(15,23,42,0.4)", color: "#8892a4",
                    fontSize: 10, fontFamily: MONO, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.teal; e.currentTarget.style.color = "#e8ecf2"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a3441"; e.currentTarget.style.color = "#8892a4"; }}
                  >{label}</button>
                ))}
              </div>
            </Card>
          </div>

          {/* ═══ RIGHT: CHARTS ═══ */}
          <div>
            {/* Scores + radar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 190px", gap: 14, marginBottom: 14 }}>
              <Card title="Performance Scores">
                <MeterBar label="Energy (x3)" value={last.energyScore as number} max={100} color={COLORS.teal} />
                <MeterBar label="Fiscal (x2)" value={last.fiscalScore as number} max={100} color={COLORS.purple} />
                <MeterBar label="Green (x2)" value={last.greenScore as number} max={100} color={COLORS.green} />
                <MeterBar label="Industrial (x2)" value={last.industrialScore as number} max={100} color={COLORS.orange} />
                <MeterBar label="Growth (x1)" value={last.growthScore as number} max={100} color={COLORS.blue} />
              </Card>
              <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, padding: "8px", border: "1px solid rgba(78,205,196,0.12)" }}>
                <ResponsiveContainer width="100%" height={170}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e2836" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 8, fontFamily: MONO, fill: "#6b7a8d" }} />
                    <Radar dataKey="value" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Deficit */}
            <Card title="Deficit Trajectory (£bn) — Baseline uses realistic spending drift, not OBR fantasy">
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.red} stopOpacity={0.2}/><stop offset="100%" stopColor={COLORS.red} stopOpacity={0}/></linearGradient>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.2}/><stop offset="100%" stopColor={COLORS.teal} stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE}/>
                  <XAxis dataKey="year" tick={CHART_TICK} stroke="#1e2836"/>
                  <YAxis tick={CHART_TICK} stroke="#1e2836"/>
                  <Tooltip contentStyle={TT_STYLE}/>
                  <ReferenceLine y={0} stroke={COLORS.green} strokeDasharray="5 5" strokeOpacity={0.3}/>
                  <Area type="monotone" dataKey="baseDeficit" name="OBR Baseline" stroke={COLORS.red} fill="url(#gB)" strokeWidth={1.5} strokeDasharray="5 5"/>
                  <Area type="monotone" dataKey="deficit" name="Reformed" stroke={COLORS.teal} fill="url(#gR)" strokeWidth={2.5}/>
                  <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 9 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Growth */}
            <Card title="Real GDP Growth (%) — WP Central: 2.8-3.3%">
              <ResponsiveContainer width="100%" height={175}>
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE}/>
                  <XAxis dataKey="year" tick={CHART_TICK} stroke="#1e2836"/>
                  <YAxis tick={CHART_TICK} stroke="#1e2836" domain={[0, "auto"]}/>
                  <Tooltip contentStyle={TT_STYLE}/>
                  <ReferenceLine y={3} stroke={COLORS.yellow} strokeDasharray="3 3" strokeOpacity={0.3} label={{ value: "3% target", fill: COLORS.yellow, fontSize: 8, fontFamily: MONO }}/>
                  <Line type="monotone" dataKey="baseGrowth" name="OBR Forecast" stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="5 5" dot={false}/>
                  <Line type="monotone" dataKey="reformedGrowth" name="With Reform" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 2.5, fill: COLORS.teal }}/>
                  <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 9 }}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Card title="Debt / GDP (%) — WP: peaks ~110% yr7">
                <ResponsiveContainer width="100%" height={175}>
                  <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE}/>
                    <XAxis dataKey="year" tick={{...CHART_TICK, fontSize: 8}} stroke="#1e2836"/>
                    <YAxis tick={CHART_TICK} stroke="#1e2836"/>
                    <Tooltip contentStyle={TT_STYLE}/>
                    <ReferenceLine y={100} stroke={COLORS.red} strokeDasharray="3 3" strokeOpacity={0.25}/>
                    <Line type="monotone" dataKey="baseDebtGdp" name="Baseline" stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="5 5" dot={false}/>
                    <Line type="monotone" dataKey="debtGdp" name="Gross" stroke={COLORS.yellow} strokeWidth={2} dot={false}/>
                    <Line type="monotone" dataKey="netDebtGdp" name="Net of Asset" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 2, fill: COLORS.teal }}/>
                    <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 8 }}/>
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card title="Nuclear Fleet (GW) + Renewables" accent={COLORS.blue}>
                <ResponsiveContainer width="100%" height={175}>
                  <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE}/>
                    <XAxis dataKey="year" tick={{...CHART_TICK, fontSize: 8}} stroke="#1e2836"/>
                    <YAxis tick={CHART_TICK} stroke="#1e2836"/>
                    <Tooltip contentStyle={TT_STYLE}/>
                    <Bar dataKey="nuclearGW" name="Nuclear" fill={COLORS.blue} radius={[3,3,0,0]}/>
                    <Line type="monotone" dataKey="renewableGW" name="Renewable" stroke={COLORS.green} strokeWidth={1.5} dot={false}/>
                    <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 8 }}/>
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Card title="Energy Price (£/MWh)" accent={COLORS.green}>
                <ResponsiveContainer width="100%" height={175}>
                  <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <defs><linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.2}/><stop offset="100%" stopColor={COLORS.teal} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE}/>
                    <XAxis dataKey="year" tick={{...CHART_TICK, fontSize: 8}} stroke="#1e2836"/>
                    <YAxis tick={CHART_TICK} stroke="#1e2836"/>
                    <Tooltip contentStyle={TT_STYLE}/>
                    <ReferenceLine y={40} stroke={COLORS.green} strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "Abundance", fill: COLORS.green, fontSize: 8, fontFamily: MONO }}/>
                    <Area type="monotone" dataKey="energyPrice" name="£/MWh" stroke={COLORS.teal} fill="url(#gP)" strokeWidth={2.5}/>
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              <Card title="Reform Savings (£bn/yr)" accent={COLORS.purple}>
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE}/>
                    <XAxis dataKey="year" tick={{...CHART_TICK, fontSize: 8}} stroke="#1e2836"/>
                    <YAxis tick={CHART_TICK} stroke="#1e2836"/>
                    <Tooltip contentStyle={TT_STYLE}/>
                    <Bar dataKey="pensionSaving" name="Pension" stackId="s" fill={COLORS.red}/>
                    <Bar dataKey="pipSaving" name="PIP/WCA" stackId="s" fill={COLORS.yellow}/>
                    <Bar dataKey="aiSaving" name="AI Efficiency" stackId="s" fill={COLORS.blue}/>
                    <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 8 }}/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Card title="Renewable System Costs (£bn/yr)" accent={COLORS.green}>
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE}/>
                    <XAxis dataKey="year" tick={{...CHART_TICK, fontSize: 8}} stroke="#1e2836"/>
                    <YAxis tick={CHART_TICK} stroke="#1e2836"/>
                    <Tooltip contentStyle={TT_STYLE}/>
                    <ReferenceLine y={0} stroke="#3a4558" strokeDasharray="3 3"/>
                    <Bar dataKey="cfdCost" name="CfD Net" stackId="r" fill={COLORS.green}/>
                    <Bar dataKey="curtailCost" name="Curtailment" stackId="r" fill={COLORS.yellow}/>
                    <Bar dataKey="balanceCost" name="Balancing" stackId="r" fill={COLORS.orange}/>
                    <Bar dataKey="capMktCost" name="Capacity Mkt" stackId="r" fill={COLORS.red}/>
                    <Bar dataKey="gridCost" name="Grid Build" stackId="r" fill={COLORS.blue}/>
                    <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 7 }}/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card title="Debt Interest (£bn/yr)" accent={COLORS.yellow}>
                <ResponsiveContainer width="100%" height={175}>
                  <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <defs><linearGradient id="gDI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.yellow} stopOpacity={0.2}/><stop offset="100%" stopColor={COLORS.yellow} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE}/>
                    <XAxis dataKey="year" tick={{...CHART_TICK, fontSize: 8}} stroke="#1e2836"/>
                    <YAxis tick={CHART_TICK} stroke="#1e2836"/>
                    <Tooltip contentStyle={TT_STYLE}/>
                    <ReferenceLine y={B.debtInterest} stroke={COLORS.red} strokeDasharray="3 3" strokeOpacity={0.3} label={{ value: `Base £${B.debtInterest}bn`, fill: COLORS.red, fontSize: 7, fontFamily: MONO }}/>
                    <Area type="monotone" dataKey="debtInt" name="Debt Interest" stroke={COLORS.yellow} fill="url(#gDI)" strokeWidth={2.5}/>
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Achievements */}
            <Card title={`Achievements (${unlockedAchs.size}/${ACHS.length})`} accent={COLORS.gold}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ACHS.map(a => {
                  const u = unlockedAchs.has(a.id);
                  return (<div key={a.id} title={u ? `${a.title}: ${a.desc}` : "???"} style={{ width: 38, height: 38, borderRadius: 7, background: u ? `${COLORS.gold}15` : "rgba(15,23,42,0.5)", border: `1px solid ${u ? COLORS.gold+"44" : "#1a2332"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: u ? 1 : 0.3, transition: "all 0.3s" }}>
                    <div style={{ fontSize: 13, fontWeight: 900, fontFamily: MONO, color: u ? COLORS.gold : "#2a3441" }}>{u ? a.icon : "?"}</div>
                    <div style={{ fontSize: 5, fontFamily: MONO, color: u ? COLORS.gold : "#2a3441", textAlign: "center", lineHeight: 1 }}>{u ? a.title.split(" ")[0] : ""}</div>
                  </div>);
                })}
              </div>
            </Card>

            {/* Table */}
            <Card title="Detailed Output — All Values £bn Unless Stated">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: MONO }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a3441" }}>
                      {["Year","Nuc","Ren","£/MWh","Growth","Deficit","Base Def","Debt Int","Debt%","Net D%","Reform","Nuc Cost","DC GW","DC Tax","Export"].map(h => (
                        <th key={h} style={{ padding: "3px 5px", textAlign: "right", color: "#4a5568", fontWeight: 500, fontSize: 8.5, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(42,52,65,0.3)" }}>
                        <td style={{ padding: "3px 5px", color: "#8892a4", fontWeight: 600 }}>{r.year}</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: COLORS.blue }}>{r.nuclearGW}</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: COLORS.green }}>{(r.renewableGW as number).toFixed(0)}</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: (r.energyPrice as number) < 50 ? COLORS.green : (r.energyPrice as number) < 70 ? COLORS.yellow : COLORS.red, fontWeight: 700 }}>£{r.energyPrice}</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: (r.reformedGrowth as number) >= 3 ? COLORS.green : COLORS.yellow, fontWeight: 700 }}>{r.reformedGrowth}%</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: (r.deficit as number) < 0 ? COLORS.green : COLORS.red, fontWeight: 700 }}>£{r.deficit}bn</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: COLORS.red }}>£{r.baseDeficit}bn</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: (r.debtInt as number) > 120 ? COLORS.red : "#6b7a8d" }}>£{r.debtInt}bn</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: (r.debtGdp as number) > 105 ? COLORS.red : "#6b7a8d" }}>{r.debtGdp}%</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: COLORS.teal }}>{r.netDebtGdp}%</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: COLORS.purple }}>£{r.totalReformSaving}bn</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: COLORS.yellow }}>£{r.nucCost}bn</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: COLORS.blue }}>{r.dcDemand}GW</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: COLORS.cyan }}>£{r.dcTax}bn</td>
                        <td style={{ padding: "3px 5px", textAlign: "right", color: COLORS.orange }}>£{r.exportRev}bn</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        </div>

        {/* ═══ CITATIONS ═══ */}
        <div style={{ marginTop: 24, padding: "20px 18px", background: "rgba(15,23,42,0.4)", borderRadius: 12, border: "1px solid rgba(78,205,196,0.08)" }}>
          <div style={{ fontSize: 11, fontFamily: MONO, color: COLORS.teal, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, fontWeight: 600 }}>
            Sources & Citations
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 9, fontFamily: MONO, color: "#4a5568", lineHeight: 1.6 }}>
            <div>
              <div style={{ color: "#6b7a8d", fontWeight: 600, marginBottom: 4, fontSize: 8.5, letterSpacing: "0.08em" }}>FISCAL & MACRO</div>
              <div>[1] OBR, <span style={{ color: "#5a6578" }}>Economic & Fiscal Outlook</span>, Nov 2025 — GDP, receipts, TME, PSNB, PSND, growth forecasts</div>
              <div>[2] OBR, <span style={{ color: "#5a6578" }}>Fiscal Risks & Sustainability Report</span>, Jul 2025 — gilt sensitivity (+1pp = +£20.8bn), debt dynamics</div>
              <div>[3] DMO, <span style={{ color: "#5a6578" }}>Debt Management Report 2025-26</span> — £299bn gross issuance, 14yr avg maturity, 3.8% avg coupon</div>
              <div>[4] HM Treasury, <span style={{ color: "#5a6578" }}>PESA 2024-25</span> — departmental spending breakdown (NHS £180bn, MoD £62bn, DfE £105bn)</div>
              <div>[5] IFS, <span style={{ color: "#5a6578" }}>Green Budget 2025</span> — reform delivery rates (40-70% historical), fiscal headroom analysis</div>
            </div>
            <div>
              <div style={{ color: "#6b7a8d", fontWeight: 600, marginBottom: 4, fontSize: 8.5, letterSpacing: "0.08em" }}>ENERGY & NUCLEAR</div>
              <div>[6] DESNZ, <span style={{ color: "#5a6578" }}>Energy Trends</span>, Dec 2025 — installed capacity (5.9GW nuclear, 60.6GW renewable)</div>
              <div>[7] DUKES 2025, <span style={{ color: "#5a6578" }}>Ch.5 & Ch.6</span> — capacity factors (nuclear 72%, offshore wind 35%, solar 9.5%)</div>
              <div>[8] Ofgem, <span style={{ color: "#5a6578" }}>Price Cap Q2 2025</span> — £1,720/yr household, ~£80/MWh wholesale</div>
              <div>[9] World Nuclear Association, <span style={{ color: "#5a6578" }}>Country Profile: UK</span> — HPC £46bn/3.2GW, SZC £38bn/3.2GW</div>
              <div>[10] LCCC, <span style={{ color: "#5a6578" }}>CfD Register & Allocation Results</span> — AR1 £155, AR4 £37, AR5 £58, AR6 £82/MWh strike prices</div>
              <div>[11] ESO/NESO, <span style={{ color: "#5a6578" }}>Constraint Payments Report 2024</span> — £1.4bn curtailment costs, 8% wind curtailed, rising trend</div>
              <div>[12] NESO, <span style={{ color: "#5a6578" }}>Beyond 2030 Transmission</span> — £54bn offshore + £22bn onshore grid reinforcement</div>
              <div>[13] Imperial/UKERC, <span style={{ color: "#5a6578" }}>System Integration Costs of Renewables</span> — £10-25/MWh at high penetration</div>
              <div>[14] EMR, <span style={{ color: "#5a6578" }}>Capacity Market Results T-4 2025</span> — £1.2bn/yr for backup gas + storage</div>
            </div>
            <div>
              <div style={{ color: "#6b7a8d", fontWeight: 600, marginBottom: 4, fontSize: 8.5, letterSpacing: "0.08em" }}>WELFARE & REFORM</div>
              <div>[15] IFS, <span style={{ color: "#5a6578" }}>The Triple Lock After 2025</span> — £12bn/yr savings from CPI+0.5%, compounding analysis</div>
              <div>[16] IFS, <span style={{ color: "#5a6578" }}>Disability Benefits: The Next Spending Challenge</span> — +£24bn since 2019-20 on £57bn base (8%/yr)</div>
              <div>[17] DWP, <span style={{ color: "#5a6578" }}>Annual Report 2024-25</span> — UC £32.5bn, state pension £146bn, PIP £19bn</div>
              <div>[18] CSJ, <span style={{ color: "#5a6578" }}>Reforming Disability Benefits</span> — £7.4bn gross savings, implementation pathway</div>
              <div>[19] Public First, <span style={{ color: "#5a6578" }}>AI in the Public Sector</span>, 2025 — up to £38bn/yr efficiency gains (WP halves to £10-18bn)</div>
            </div>
            <div>
              <div style={{ color: "#6b7a8d", fontWeight: 600, marginBottom: 4, fontSize: 8.5, letterSpacing: "0.08em" }}>INDUSTRIAL & TAX</div>
              <div>[20] National Grid ESO, <span style={{ color: "#5a6578" }}>Connections Queue Report</span> — 739GW queue, 283GW post-reform pipeline</div>
              <div>[21] HMRC, <span style={{ color: "#5a6578" }}>Tax Receipts Statistics</span> — employer NICs £108bn, corporation tax £91.2bn</div>
              <div>[22] OBR, <span style={{ color: "#5a6578" }}>Planning Reform Impact Assessment</span> — +0.2% GDP by 2029, +0.4% by 2034</div>
              <div>[23] DLUHC, <span style={{ color: "#5a6578" }}>Freeports & Investment Zones</span> — £6.4bn attracted, 22 zones operational</div>
              <div>[24] MoD, <span style={{ color: "#5a6578" }}>Strategic Defence Review 2025</span> — £62.2bn budget, 2.5% GDP target</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ color: "#6b7a8d", fontWeight: 600, marginBottom: 4, fontSize: 8.5, letterSpacing: "0.08em" }}>DEBT INTEREST MODEL</div>
              <div>[25] OBR, <span style={{ color: "#5a6578" }}>Supplementary Fiscal Tables</span>, Nov 2025 — net debt interest £105bn, 59% refinance share, gilt sensitivity parameters</div>
              <div>[26] DMO, <span style={{ color: "#5a6578" }}>Quarterly Review Q4 2025</span> — weighted avg coupon 3.8%, maturity profile, index-linked share</div>
              <div>[27] BoE, <span style={{ color: "#5a6578" }}>Yield Curve Data</span> — current 10yr gilt ~4.5%, term premium decomposition</div>
              <div style={{ color: "#3a4558", marginTop: 4 }}>
                Model: debt interest = (existing stock x blended rate) + (new borrowing x current gilt rate).
                Blended rate transitions from 3.8% avg coupon to market rate over 14yr avg maturity.
                Energy bonds reduce effective rate by 15bp on nuclear-related issuance.
                OBR sensitivity benchmark: +1pp across curve = +£20.8bn/yr at steady state.
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ color: "#6b7a8d", fontWeight: 600, marginBottom: 4, fontSize: 8.5, letterSpacing: "0.08em" }}>BASELINE METHODOLOGY</div>
              <div>[28] IFS, <span style={{ color: "#5a6578" }}>Green Budget 2025, Ch.5: Public Spending</span> — departments consistently overshoot plans by 1-2pp. NHS especially: 4.5% real trend vs 3.6% planned. OBR baseline assumes restraint that has never materialised over any 10-year horizon since 1980.</div>
              <div style={{ color: "#3a4558", marginTop: 4 }}>
                Baseline uses realistic spending drift: NHS 4.5%, defence 3%, other depts 2.8% (vs OBR assumed 1-2%).
                The &quot;do nothing&quot; trajectory is NOT the OBR forecast — it is what actually happens when govts promise restraint but NHS waiting lists, defence commitments, and council funding crises force spending up.
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ color: "#6b7a8d", fontWeight: 600, marginBottom: 4, fontSize: 8.5, letterSpacing: "0.08em" }}>WHITE PAPER</div>
              <div>[29] <span style={{ color: "#5a6578" }}>Breaking the Doom Loop v2.0: A 4-Pillar Programme for Energy Abundance</span> — nuclear fleet schedule, consolidated fiscal position (p12), growth arithmetic (p13), reform savings by scenario (p11), risk register (p14-15), Korean partnership model (£3.3bn/GW vs £14.4bn/GW HPC)</div>
            </div>
          </div>
          <div style={{ fontSize: 8, fontFamily: MONO, color: "#222b3a", marginTop: 12, lineHeight: 1.5, borderTop: "1px solid rgba(78,205,196,0.06)", paddingTop: 10 }}>
            All assumptions are adjustable via sliders and toggles. Reform savings discounted per IFS methodology — historical UK welfare reforms deliver 40-70% of projected savings.
            Debt interest model uses stock-flow consistent accounting: existing debt reprices gradually as gilts mature and are refinanced at current yields.
            Baseline uses realistic spending drift rates (IFS), not OBR fantasy restraint. Renewable costs include CfD net settlement, curtailment, balancing, capacity market, and grid build-out.
            Nuclear timeline: 15-20 GW by year 10, 50 GW by year 20. Binding constraint is workforce (50-80k skilled workers), not regulation.
          </div>
        </div>

        </>)}

        <footer style={{ textAlign: "center", padding: "20px 0 10px", borderTop: "1px solid rgba(78,205,196,0.06)", marginTop: 16 }}>
          <div style={{ fontSize: 8, fontFamily: MONO, color: "#151d2b", letterSpacing: "0.08em", lineHeight: 1.5 }}>
            BREAKING THE DOOM LOOP v2.0 · PARAMETRIC FISCAL MODEL · ALL ASSUMPTIONS ADJUSTABLE
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (max-width: 900px) {
          .controls-panel { max-height: none !important; overflow: visible !important; }
        }
        input[type="range"] { -webkit-appearance: none; appearance: none; background: #1e2836; border-radius: 4px; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #4ecdc4; cursor: pointer; border: 2px solid #0f172a; }
        input[type="range"]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #4ecdc4; cursor: pointer; border: 2px solid #0f172a; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a3441; border-radius: 3px; }
      `}</style>
    </div>
  );
}
