"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, ComposedChart,
} from "recharts";

/* ═══════════════════════════════════════════
   REAL UK DATA (OBR Nov 2025, IFS, DESNZ, National Grid ESO)
   Sources cited inline
   ═══════════════════════════════════════════ */
const MONO = "var(--font-mono), 'JetBrains Mono', 'Fira Code', monospace";
const SANS = "var(--font-sans), 'Space Grotesk', system-ui, sans-serif";
const YEARS = 10;
const YR = Array.from({ length: YEARS }, (_, i) => `${2025 + i}`);

// OBR Nov 2025 EFO baseline
const R = {
  // £bn, nominal
  gdpBase: 2790,           // 2024-25 nominal GDP ~£2.79tn (OBR)
  revBase: 1120,            // Total receipts 2024-25 (OBR)
  revGrowthRate: 4.2,       // Nominal receipt growth (OBR trend)
  tmeBase: 1270,            // Total managed expenditure 2024-25
  debtInterestBase: 105,    // Debt interest 2024-25 (OBR)
  debtGdpStart: 96,         // PSND % GDP 2024-25 (OBR: 95.9%)
  deficitBase: 150,         // PSNB 2024-25 ~£150bn (OBR)

  // Welfare breakdown (OBR/DWP 2024-25)
  statePension: 142,        // £142bn — state pension
  pensionOther: 9,          // pension credit, WFP etc
  disabilityWA: 57,         // working-age disability & incapacity
  universalCredit: 32.5,    // UC
  otherWelfare: 72.5,       // housing benefit, child benefit, other
  totalWelfare: 313,        // total welfare spend

  // Energy (DESNZ/Carbon Brief 2025)
  nuclearGW: 5.9,           // installed nuclear
  offshoreWindGW: 15.8,     // installed offshore wind
  onshoreWindGW: 17,        // installed onshore wind
  solarGW: 21,              // installed solar
  otherRenewableGW: 6.8,    // biomass, hydro etc
  totalRenewableGW: 60.6,   // total renewable
  demandTWh: 322,           // annual electricity demand
  peakDemandGW: 43.6,       // peak demand (Feb 2025)
  wholesalePrice: 80,       // £/MWh typical 2025
  householdBill: 1720,      // £/year Ofgem cap

  // Nuclear capacity factors & costs
  nuclearCF: 0.72,          // UK fleet avg load factor (DUKES)
  offshoreWindCF: 0.35,     // avg capacity factor
  solarCF: 0.095,           // avg capacity factor

  // Nuclear build costs (real)
  hpcCostBn: 46,            // HPC £46bn for 3.2 GW
  hpcGW: 3.2,
  szCostBn: 38,             // SZC £38bn for 3.2 GW
  szGW: 3.2,
  smrCostBn: 2.5,           // RR SMR ~£2.5bn per 0.47 GW
  smrGW: 0.47,
  koreanCostPerGW: 3.3,     // APR1400 ~£3.3bn/GW (vs £14.4bn/GW HPC)

  // OBR growth forecast (Nov 2025)
  obrGrowth: [1.5, 1.4, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5],

  // Welfare growth trajectories (OBR trend: disability +8%/yr, pension ~4.5%/yr triple lock)
  pensionGrowthTripleLock: 4.5,
  pensionGrowthDoubleLock: 2.8,
  disabilityGrowthRate: 8.0,  // IFS: £24bn increase since 2019-20 on £57bn base
  ucGrowthRate: 3.5,

  // IFS-sourced savings estimates
  tripleLockExtraCost: 12,     // £12bn/yr more than earnings-only (IFS)
  aiPublicSectorSavings: 38,   // Public First: up to £38bn/yr by 2030
  govEfficiencyTarget: 45,     // £45bn target (includes AI)

  // Reform savings (from OBR spring statement 2025)
  springWelfareSavings: 4.8,   // £4.8bn by 2029-30

  // Nuclear deployment curves (reactors coming online)
  // Realistic: AGRs retire, HPC yr5-6, SZC yr10, SMRs from yr7
  agRetirements: [0, -0.5, -1.2, -1.5, -0.5, 0, 0, 0, 0, 0], // losing AGR fleet
  hpcOnline: [0, 0, 0, 0, 1.6, 1.6, 0, 0, 0, 0],              // HPC unit 1 yr5, unit 2 yr6
  szcOnline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2],                 // SZC both units yr10

  // Growth multipliers from energy abundance (modelled)
  cheapEnergyGrowthMult: [0, 0, 0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
  nuclearConstructionGrowthMult: [0.1, 0.2, 0.3, 0.3, 0.2, 0.2, 0.15, 0.1, 0.1, 0.1],
  aiProductivityMult: [0, 0.05, 0.1, 0.15, 0.25, 0.35, 0.45, 0.55, 0.6, 0.65],
  datacentreGrowthMult: [0, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.25, 0.25, 0.25],
  planningReformMult: [0, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.25, 0.25, 0.25],
};

const COLORS = {
  teal: "#4ecdc4", red: "#ff6b6b", yellow: "#ffd93d", blue: "#45b7d1",
  purple: "#a78bfa", green: "#34d399", orange: "#fb923c", pink: "#f472b6",
  gold: "#ffd700",
};

/* ═══════════════════════════════════════════
   ACHIEVEMENTS — unlock dynamically as sliders move
   ═══════════════════════════════════════════ */
interface AchievementDef {
  id: string; title: string; desc: string; icon: string;
  check: (d: RowData[]) => boolean;
}

interface RowData {
  year: string; nuclearGW: number; totalCapGW: number; energyPrice: number;
  reformedGrowth: number; baseGrowth: number; debtGdp: number; baseDebtGdp: number;
  deficit: number; baseDeficit: number; co2: number; dcTax: number;
  exportRev: number; pensionSaving: number; disabilitySaving: number;
  aiSaving: number; nuclearCapex: number; nuclearRevenue: number;
  totalReformSaving: number; renewableGW: number;
  energyScore: number; fiscalScore: number; greenScore: number;
  industrialScore: number;
}

const ACHIEVEMENTS: AchievementDef[] = [
  { id: "abundance", title: "ENERGY ABUNDANCE", desc: "Energy price below £40/MWh", icon: "A",
    check: (d) => d.some(r => r.energyPrice < 40) },
  { id: "nuclear_titan", title: "NUCLEAR TITAN", desc: "50+ GW nuclear online", icon: "T",
    check: (d) => d.some(r => r.nuclearGW >= 50) },
  { id: "independence", title: "ENERGY INDEPENDENCE", desc: "Reliable capacity exceeds peak demand + 20%", icon: "I",
    check: (d) => d.some(r => (r.nuclearGW + r.renewableGW * 0.35) >= R.peakDemandGW * 1.2) },
  { id: "green_grid", title: "GREEN GRID", desc: "CO2 reduction exceeds 70%", icon: "G",
    check: (d) => d.some(r => r.co2 >= 70) },
  { id: "surplus", title: "BUDGET SURPLUS", desc: "Achieve a fiscal surplus", icon: "$",
    check: (d) => d.some(r => r.deficit < 0) },
  { id: "growth_engine", title: "GROWTH ENGINE", desc: "GDP growth exceeds 3.5%", icon: "R",
    check: (d) => d.some(r => r.reformedGrowth >= 3.5) },
  { id: "debt_hawk", title: "FISCAL HAWK", desc: "Debt/GDP below 85%", icon: "F",
    check: (d) => d[d.length - 1]?.debtGdp < 85 },
  { id: "ai_state", title: "AI SUPERPOWER", desc: "Data centre demand exceeds 20 GW", icon: "D",
    check: (d) => true }, // checked separately with slider value
  { id: "exporter", title: "NET EXPORTER", desc: "Export revenue exceeds £10bn", icon: "E",
    check: (d) => d.some(r => r.exportRev > 10) },
  { id: "golden_age", title: "GOLDEN AGE", desc: "Achieve S rank", icon: "S",
    check: (d) => false }, // checked separately with total score
];

/* ═══════════════════════════════════════════
   UI BUILDING BLOCKS
   ═══════════════════════════════════════════ */
function Slider({ label, min, max, step, value, onChange, unit = "", source = "" }: {
  label: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; unit?: string; source?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontFamily: MONO, color: "#8892a4", letterSpacing: "0.02em" }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: MONO, fontWeight: 700, color: "#e8ecf2" }}>
          {typeof value === "number" ? (step < 1 ? value.toFixed(1) : value) : value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#4ecdc4", height: 5, cursor: "pointer" }}
      />
      {source && <div style={{ fontSize: 8, fontFamily: MONO, color: "#2a3441", marginTop: 1 }}>{source}</div>}
    </div>
  );
}

function Card({ title, children, accent = "#4ecdc4" }: {
  title: string; children: React.ReactNode; accent?: string;
}) {
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

function StatBox({ label, value, sub, color = "#4ecdc4", warn = false }: {
  label: string; value: string; sub?: string; color?: string; warn?: boolean;
}) {
  return (
    <div style={{
      background: warn ? "rgba(255,107,107,0.08)" : "rgba(15,23,42,0.5)",
      borderRadius: 10, padding: "12px 14px",
      border: `1px solid ${warn ? "rgba(255,107,107,0.25)" : "rgba(78,205,196,0.1)"}`,
      textAlign: "center", flex: 1, minWidth: 110,
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, fontFamily: MONO, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9.5, color: "#8892a4", marginTop: 4, fontFamily: MONO, letterSpacing: "0.05em" }}>{label}</div>
      {sub && <div style={{ fontSize: 8.5, color: "#4a5568", marginTop: 2, fontFamily: MONO }}>{sub}</div>}
    </div>
  );
}

function MeterBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 9.5, fontFamily: MONO, color: "#6b7a8d" }}>{label}</span>
        <span style={{ fontSize: 10, fontFamily: MONO, fontWeight: 700, color }}>{Math.round(value)}/{max}</span>
      </div>
      <div style={{ height: 5, background: "#1a2332", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}66, ${color})`,
          borderRadius: 3, transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

function ScenarioBtn({ label, active, onClick, color }: {
  label: string; active: boolean; onClick: () => void; color: string;
}) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 13px", borderRadius: 6,
      border: `1px solid ${active ? color : "#2a3441"}`,
      background: active ? `${color}18` : "transparent",
      color: active ? color : "#5a6578",
      fontSize: 10.5, fontFamily: MONO, cursor: "pointer",
      fontWeight: active ? 700 : 400, letterSpacing: "0.05em", transition: "all 0.2s",
    }}>{label}</button>
  );
}

function getGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 900) return { grade: "S", color: COLORS.gold, label: "Golden Age" };
  if (score >= 750) return { grade: "A", color: COLORS.teal, label: "Energy Superpower" };
  if (score >= 600) return { grade: "B", color: COLORS.blue, label: "Breaking the Loop" };
  if (score >= 450) return { grade: "C", color: COLORS.yellow, label: "Muddling Through" };
  if (score >= 300) return { grade: "D", color: COLORS.orange, label: "Managed Decline" };
  return { grade: "F", color: COLORS.red, label: "Doom Loop" };
}

function generateHeadline(last: RowData, nuclearGW: number, energyPrice: number, growth: number, debtGdp: number, dcDemand: number): { text: string; type: "good" | "bad" | "neutral" } {
  if (energyPrice < 35) return { text: "BREAKING: UK energy prices hit all-time low — manufacturers flock to Britain", type: "good" };
  if (nuclearGW > 45) return { text: "Britain overtakes France as Europe's nuclear powerhouse", type: "good" };
  if (growth > 3.5) return { text: "UK leads G7 growth as energy abundance powers industrial renaissance", type: "good" };
  if (dcDemand > 25) return { text: "UK becomes world's second-largest AI compute hub behind the US", type: "good" };
  if (last.deficit < 0) return { text: "Chancellor announces first budget surplus in 20 years", type: "good" };
  if (debtGdp > 115) return { text: "IMF warns UK debt trajectory 'unsustainable' — gilt yields spike", type: "bad" };
  if (energyPrice > 90) return { text: "Energy crisis deepens: households face record bills as gas dependence persists", type: "bad" };
  if (nuclearGW < 3) return { text: "Last AGR station closes — Britain's nuclear capacity hits historic low", type: "bad" };
  if (growth < 0.8) return { text: "OBR slashes growth forecast — productivity puzzle remains unsolved", type: "bad" };
  if (energyPrice < 55) return { text: "Energy prices fall below European average for first time since 2003", type: "good" };
  return { text: "Policy simulation: drag sliders to explore Britain's energy future", type: "neutral" };
}

const TT_STYLE = { background: "#0f172a", border: "1px solid #2a3441", borderRadius: 8, fontFamily: MONO, fontSize: 11 };
const CHART_TICK = { fontSize: 9, fontFamily: MONO, fill: "#5a6578" };
const GRID_STROKE = "rgba(255,255,255,0.04)";

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function EnergyAbundanceGame() {
  // ── Scenario
  const [scenario, setScenario] = useState<"pessimistic" | "central" | "optimistic">("central");
  const scenarioMult = scenario === "optimistic" ? 1.25 : scenario === "pessimistic" ? 0.55 : 1.0;
  const reformDiscount = scenario === "optimistic" ? 0.85 : scenario === "pessimistic" ? 0.45 : 0.65;

  // ── Macro sliders
  const [baseGrowth, setBaseGrowth] = useState(1.5);
  const [inflation, setInflation] = useState(2.5);
  const [giltRate, setGiltRate] = useState(4.5);
  const [welfarePressure, setWelfarePressure] = useState(100); // % of OBR baseline

  // ── Nuclear sliders
  const [nuclearAmbition, setNuclearAmbition] = useState(100); // % scale
  const [nuclearCost, setNuclearCost] = useState(100);          // % of baseline cost
  const [smrUnits, setSmrUnits] = useState(8);                  // number of SMRs ordered
  const [koreanDeal, setKoreanDeal] = useState(0);              // GW from Korean partnership

  // ── Reform sliders
  const [tripleLockReform, setTripleLockReform] = useState(false);
  const [disabilityReform, setDisabilityReform] = useState(50); // % of spring statement ambition
  const [aiAdoption, setAiAdoption] = useState(50);             // % of Public First estimate
  const [planningReform, setPlanningReform] = useState(50);

  // ── Industry sliders
  const [dcDemand, setDcDemand] = useState(15);                 // GW data centres
  const [renewableScale, setRenewableScale] = useState(100);    // % of planned pipeline
  const [exportAmbition, setExportAmbition] = useState(50);     // % of capacity exported
  const [hydrogenHubs, setHydrogenHubs] = useState(0);

  // ── Achievement tracking
  const [shownAchievements, setShownAchievements] = useState<string[]>([]);
  const [toastQueue, setToastQueue] = useState<string[]>([]);
  const prevAchRef = useRef<Set<string>>(new Set());

  // ═══ COMPUTE MODEL ═══
  const data = useMemo(() => {
    const rows: RowData[] = [];
    let cumNucCapex = 0;
    let baseDebt = R.gdpBase * (R.debtGdpStart / 100);
    let refDebt = baseDebt;

    for (let i = 0; i < YEARS; i++) {
      const nomGrowth = baseGrowth / 100 + inflation / 100;
      const gdp = R.gdpBase * Math.pow(1 + nomGrowth, i);
      const rev = R.revBase * Math.pow(1 + R.revGrowthRate / 100, i);

      // ── Welfare baseline (OBR trajectory)
      const wp = welfarePressure / 100;
      const pensionSpend = R.statePension * Math.pow(1 + R.pensionGrowthTripleLock / 100, i) * wp;
      const disabilitySpend = R.disabilityWA * Math.pow(1 + R.disabilityGrowthRate / 100, i) * wp;
      const ucSpend = R.universalCredit * Math.pow(1 + R.ucGrowthRate / 100, i) * wp;
      const otherWelf = (R.pensionOther + R.otherWelfare) * Math.pow(1 + 3.0 / 100, i);
      const totalWelfare = pensionSpend + disabilitySpend + ucSpend + otherWelf;
      const otherSpend = (R.tmeBase - R.totalWelfare) * Math.pow(1 + 3.0 / 100, i);
      const debtInterest = R.debtInterestBase * Math.pow(1 + (giltRate - 4) / 100, i) * (1 + Math.max(0, giltRate - 4.5) * 0.1);
      const baseSpend = totalWelfare + otherSpend + debtInterest;
      const baseDeficit = baseSpend - rev;

      // ── Nuclear capacity (realistic trajectory)
      const ns = nuclearAmbition / 100;
      const nc = nuclearCost / 100;

      // AGR retirements happen regardless
      const agr = R.agRetirements[i];
      // HPC scaled by ambition
      const hpc = R.hpcOnline[i] * ns;
      // SZC
      const szc = R.szcOnline[i] * ns;
      // SMRs: 0.47 GW each, start coming online from year 5
      const smrOnline = i >= 5 ? Math.min(smrUnits, Math.floor((i - 4) * 2.5)) * R.smrGW * ns : 0;
      // Korean reactors: 1.4 GW each, start from year 4
      const koreanOnline = i >= 4 ? Math.min(koreanDeal, (i - 3) * 1.5) : 0;

      const nucGW = Math.max(0, R.nuclearGW + agr + hpc + szc + smrOnline + koreanOnline);

      // Nuclear capex this year
      const hpcCapex = i < 5 ? (R.hpcCostBn / 6) * ns : 0;
      const szcCapex = i >= 3 && i < 9 ? (R.szCostBn / 6) * ns : 0;
      const smrCapex = i >= 2 && i < 7 ? (smrUnits * R.smrCostBn / 5) * ns : 0;
      const koreanCapex = i >= 1 && i < 6 ? (koreanDeal * R.koreanCostPerGW / 5) : 0;
      const totalNucCapex = (hpcCapex + szcCapex + smrCapex + koreanCapex) * nc;
      cumNucCapex += totalNucCapex;

      // Nuclear electricity revenue
      const nucTWh = nucGW * R.nuclearCF * 8.766;
      const nucRevenue = nucTWh * 55 / 1000; // £55/MWh blended price
      const nucNetCost = totalNucCapex + cumNucCapex * giltRate / 100 * 0.3 - nucRevenue;

      // ── Renewables
      const renGW = R.totalRenewableGW * (renewableScale / 100) * (1 + 0.04 * i);

      // ── Reform savings
      const pensionSaving = tripleLockReform ? R.tripleLockExtraCost * (i / YEARS) * reformDiscount : 0;
      const disabilitySaving = R.springWelfareSavings * (disabilityReform / 100) * Math.min(1, i / 4) * reformDiscount;
      const aiSaving = R.aiPublicSectorSavings * (aiAdoption / 100) * Math.min(1, i / 6) * reformDiscount;
      const totalReformSaving = pensionSaving + disabilitySaving + aiSaving;

      // ── Data centre tax revenue
      const dcTaxRev = Math.min(dcDemand, nucGW * 0.4) * 0.5 * Math.min(1, i / 4);
      // Export revenue
      const totalCap = nucGW + renGW * R.offshoreWindCF / R.nuclearCF;
      const surplus = Math.max(0, totalCap - R.peakDemandGW - dcDemand);
      const exportRev = surplus * (exportAmbition / 100) * 0.8;

      // ── Growth effects
      const gm = scenarioMult;
      const cheapEnergy = R.cheapEnergyGrowthMult[i] * (nucGW > 20 ? 1.5 : nucGW > 10 ? 1 : 0.3);
      const nucConstruction = R.nuclearConstructionGrowthMult[i] * ns;
      const aiProd = R.aiProductivityMult[i] * (aiAdoption / 100);
      const dcGrowth = R.datacentreGrowthMult[i] * (dcDemand / 15);
      const planGrowth = R.planningReformMult[i] * (planningReform / 100);
      const growthBoost = (cheapEnergy + nucConstruction + aiProd + dcGrowth + planGrowth) * gm;
      const reformedGrowth = Math.min(6, baseGrowth + growthBoost);

      // ── Energy price
      const reliableCap = nucGW + renGW * 0.3;
      const totalDemand = R.peakDemandGW + dcDemand * 0.7;
      const capacityRatio = reliableCap / totalDemand;
      const energyPrice = Math.max(20, R.wholesalePrice * (1.8 - capacityRatio * 0.9) * (nc * 0.3 + 0.7));

      // ── CO2 reduction
      const co2 = Math.min(95, 25 + nucGW * 0.6 + renGW * 0.15 + hydrogenHubs * 2);

      // ── Reformed deficit
      const reformedDeficit = baseDeficit - totalReformSaving + nucNetCost - dcTaxRev - exportRev;

      // ── Debt dynamics
      baseDebt += baseDeficit;
      refDebt += reformedDeficit;
      const refGdp = R.gdpBase * Math.pow(1 + reformedGrowth / 100 + inflation / 100, i);
      const debtGdp = (refDebt / refGdp) * 100;
      const baseDebtGdp = (baseDebt / gdp) * 100;

      // ── Scores (game-like)
      const energyScore = Math.min(100, Math.round(
        Math.max(0, (capacityRatio - 0.5) * 60) + Math.max(0, (90 - energyPrice) * 0.5) + (nucGW > 20 ? 15 : nucGW > 10 ? 8 : 0)
      ));
      const fiscalScore = Math.min(100, Math.round(
        Math.max(0, (110 - debtGdp) * 0.8) + (reformedDeficit < 50 ? 15 : 0) + (reformedDeficit < 0 ? 20 : 0)
      ));
      const greenScore = Math.min(100, Math.round(co2));
      const industrialScore = Math.min(100, Math.round(
        dcDemand * 1.5 + exportRev * 2 + hydrogenHubs * 3 + reformedGrowth * 5
      ));

      rows.push({
        year: YR[i],
        nuclearGW: +nucGW.toFixed(1),
        renewableGW: +renGW.toFixed(1),
        totalCapGW: +(nucGW + renGW).toFixed(1),
        energyPrice: Math.round(energyPrice),
        reformedGrowth: +reformedGrowth.toFixed(1),
        baseGrowth: +R.obrGrowth[i].toFixed(1),
        debtGdp: +debtGdp.toFixed(1),
        baseDebtGdp: +baseDebtGdp.toFixed(1),
        deficit: Math.round(reformedDeficit),
        baseDeficit: Math.round(baseDeficit),
        co2: Math.round(co2),
        dcTax: +dcTaxRev.toFixed(1),
        exportRev: +exportRev.toFixed(1),
        pensionSaving: Math.round(pensionSaving),
        disabilitySaving: Math.round(disabilitySaving),
        aiSaving: Math.round(aiSaving),
        nuclearCapex: Math.round(totalNucCapex),
        nuclearRevenue: Math.round(nucRevenue),
        totalReformSaving: Math.round(totalReformSaving),
        energyScore,
        fiscalScore,
        greenScore,
        industrialScore,
      });
    }
    return rows;
  }, [baseGrowth, inflation, giltRate, welfarePressure, nuclearAmbition, nuclearCost,
      smrUnits, koreanDeal, tripleLockReform, disabilityReform, aiAdoption, planningReform,
      dcDemand, renewableScale, exportAmbition, hydrogenHubs, scenarioMult, reformDiscount]);

  const last = data[YEARS - 1];
  const totalScore = Math.round(
    last.energyScore * 3 + last.fiscalScore * 2 + last.greenScore * 2 + last.industrialScore * 2 + Math.min(100, Math.max(0, (last.reformedGrowth / 4) * 100))
  );
  const grade = getGrade(totalScore);

  // ── Check achievements
  useEffect(() => {
    const newUnlocked: string[] = [];
    ACHIEVEMENTS.forEach(a => {
      if (prevAchRef.current.has(a.id)) return;
      let unlocked = false;
      if (a.id === "ai_state") unlocked = dcDemand >= 20;
      else if (a.id === "golden_age") unlocked = totalScore >= 900;
      else unlocked = a.check(data);
      if (unlocked) {
        newUnlocked.push(a.id);
        prevAchRef.current.add(a.id);
      }
    });
    if (newUnlocked.length > 0) {
      setShownAchievements(prev => [...prev, ...newUnlocked]);
      setToastQueue(prev => [...prev, ...newUnlocked]);
    }
  }, [data, dcDemand, totalScore]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastQueue.length === 0) return;
    const timer = setTimeout(() => setToastQueue(prev => prev.slice(1)), 3500);
    return () => clearTimeout(timer);
  }, [toastQueue]);

  const headline = generateHeadline(last, last.nuclearGW, last.energyPrice, last.reformedGrowth, last.debtGdp, dcDemand);
  const surplus = last.deficit < 0;
  const radarData = [
    { axis: "Energy", value: last.energyScore },
    { axis: "Fiscal", value: last.fiscalScore },
    { axis: "Green", value: last.greenScore },
    { axis: "Industry", value: last.industrialScore },
    { axis: "Growth", value: Math.min(100, Math.round(last.reformedGrowth / 4 * 100)) },
  ];

  const quickScenarios = [
    { label: "Do Nothing", fn: () => { setNuclearAmbition(0); setSmrUnits(0); setKoreanDeal(0); setDisabilityReform(0); setAiAdoption(0); setPlanningReform(0); setTripleLockReform(false); } },
    { label: "Korean Partnership", fn: () => { setKoreanDeal(10); setNuclearCost(70); setNuclearAmbition(120); } },
    { label: "Gilt Crisis", fn: () => { setGiltRate(7); setBaseGrowth(0.8); } },
    { label: "AI Boom", fn: () => { setAiAdoption(100); setDcDemand(30); setPlanningReform(100); } },
    { label: "Full Reform", fn: () => { setTripleLockReform(true); setDisabilityReform(100); setAiAdoption(80); setPlanningReform(100); setNuclearAmbition(130); setSmrUnits(16); setKoreanDeal(8); } },
    { label: "Reset", fn: () => { setBaseGrowth(1.5); setInflation(2.5); setGiltRate(4.5); setWelfarePressure(100); setNuclearAmbition(100); setNuclearCost(100); setSmrUnits(8); setKoreanDeal(0); setTripleLockReform(false); setDisabilityReform(50); setAiAdoption(50); setPlanningReform(50); setDcDemand(15); setRenewableScale(100); setExportAmbition(50); setHydrogenHubs(0); setScenario("central"); prevAchRef.current.clear(); setShownAchievements([]); } },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(155deg, #050a12 0%, #0f172a 40%, #0a1628 100%)",
      color: "#e8ecf2", fontFamily: SANS, padding: "20px 16px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* ── ACHIEVEMENT TOASTS ── */}
        {toastQueue.length > 0 && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, display: "flex", flexDirection: "column", gap: 8 }}>
            {toastQueue.map(id => {
              const a = ACHIEVEMENTS.find(x => x.id === id)!;
              return (
                <div key={id} style={{
                  background: "rgba(15,23,42,0.95)", border: `1px solid ${COLORS.gold}`,
                  borderRadius: 10, padding: "12px 20px", backdropFilter: "blur(10px)",
                  animation: "slideIn 0.3s ease-out", boxShadow: `0 0 30px ${COLORS.gold}22`,
                }}>
                  <div style={{ fontSize: 9, fontFamily: MONO, color: COLORS.gold, letterSpacing: "0.2em" }}>
                    ACHIEVEMENT UNLOCKED
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.teal, fontFamily: SANS }}>{a.title}</div>
                  <div style={{ fontSize: 10, color: "#6b7a8d", fontFamily: MONO }}>{a.desc}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── HEADER ── */}
        <header style={{ marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid rgba(78,205,196,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 9, fontFamily: MONO, color: COLORS.teal, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 4 }}>
                UK Policy Simulation · Real OBR/IFS Data
              </div>
              <h1 style={{
                fontSize: 30, fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em",
                background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.blue})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                ENERGY ABUNDANCE
              </h1>
            </div>
            {/* GRADE HUD */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, fontFamily: MONO, color: "#5a6578", letterSpacing: "0.1em" }}>SCORE</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: MONO, color: COLORS.teal }}>{totalScore}</div>
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                border: `2px solid ${grade.color}`,
                background: `${grade.color}12`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: MONO, color: grade.color, lineHeight: 1 }}>{grade.grade}</div>
                <div style={{ fontSize: 7, fontFamily: MONO, color: grade.color, letterSpacing: "0.05em" }}>{grade.label.toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* Headline ticker */}
          <div style={{
            marginTop: 12, padding: "8px 14px", borderRadius: 8,
            background: headline.type === "good" ? "rgba(78,205,196,0.06)" : headline.type === "bad" ? "rgba(255,107,107,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${headline.type === "good" ? COLORS.teal + "22" : headline.type === "bad" ? COLORS.red + "22" : "#1e2836"}`,
          }}>
            <span style={{ fontSize: 8, fontFamily: MONO, color: "#3a4558", marginRight: 8 }}>2035 OUTLOOK</span>
            <span style={{
              fontSize: 12, fontWeight: 600, fontFamily: SANS,
              color: headline.type === "good" ? COLORS.teal : headline.type === "bad" ? COLORS.red : "#8892a4",
            }}>{headline.text}</span>
          </div>
        </header>

        {/* ── SCENARIO + STAT CARDS ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <ScenarioBtn label="PESSIMISTIC" active={scenario === "pessimistic"} onClick={() => setScenario("pessimistic")} color={COLORS.red} />
          <ScenarioBtn label="CENTRAL" active={scenario === "central"} onClick={() => setScenario("central")} color={COLORS.teal} />
          <ScenarioBtn label="OPTIMISTIC" active={scenario === "optimistic"} onClick={() => setScenario("optimistic")} color={COLORS.blue} />
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#2d3a4a" }}>
            Scenario applies {Math.round(reformDiscount * 100)}% discount to reform savings (IFS methodology)
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <StatBox label="2035 NUCLEAR" value={`${last.nuclearGW}GW`} sub={`from ${R.nuclearGW}GW today`} color={COLORS.blue} />
          <StatBox label="ENERGY PRICE" value={`£${last.energyPrice}`} sub="£/MWh" color={last.energyPrice < 50 ? COLORS.green : last.energyPrice < 70 ? COLORS.yellow : COLORS.red} warn={last.energyPrice > 80} />
          <StatBox label="GDP GROWTH" value={`${last.reformedGrowth}%`} sub={`OBR base: ${last.baseGrowth}%`} color={last.reformedGrowth >= 3 ? COLORS.green : last.reformedGrowth >= 2 ? COLORS.yellow : COLORS.red} />
          <StatBox label="DEFICIT" value={`£${Math.abs(last.deficit)}bn`} sub={surplus ? "SURPLUS" : "deficit"} color={surplus ? COLORS.green : COLORS.red} warn={!surplus && last.deficit > 80} />
          <StatBox label="DEBT/GDP" value={`${last.debtGdp}%`} sub={`baseline: ${last.baseDebtGdp}%`} color={last.debtGdp < 90 ? COLORS.teal : COLORS.red} warn={last.debtGdp > 110} />
          <StatBox label="CO2 CUT" value={`${last.co2}%`} sub="vs 2025" color={COLORS.green} />
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 14, alignItems: "start" }}>

          {/* ═══ LEFT: CONTROLS ═══ */}
          <div className="controls-panel">
            <Card title="Macro · OBR Baseline">
              <Slider label="Baseline Growth" min={0} max={3} step={0.1} value={baseGrowth} onChange={setBaseGrowth} unit="%" source="OBR Nov 2025: 1.5%" />
              <Slider label="Inflation" min={1} max={5} step={0.1} value={inflation} onChange={setInflation} unit="%" source="BoE target: 2.0%" />
              <Slider label="Gilt Rate" min={2} max={8} step={0.1} value={giltRate} onChange={setGiltRate} unit="%" source="OBR: 4.5%" />
              <Slider label="Welfare Pressure" min={50} max={150} step={5} value={welfarePressure} onChange={setWelfarePressure} unit="%" source="100% = OBR baseline trajectory" />
            </Card>

            <Card title="Nuclear Programme" accent={COLORS.blue}>
              <Slider label="Programme Scale" min={0} max={150} step={5} value={nuclearAmbition} onChange={setNuclearAmbition} unit="%" source="100% = HPC + SZC on schedule" />
              <Slider label="Cost Overrun" min={50} max={200} step={5} value={nuclearCost} onChange={setNuclearCost} unit="%" source="100% = current estimates" />
              <Slider label="SMR Units (RR)" min={0} max={20} step={1} value={smrUnits} onChange={setSmrUnits} unit="" source="£2.5bn each, 0.47 GW" />
              <Slider label="Korean Deal (GW)" min={0} max={15} step={0.5} value={koreanDeal} onChange={setKoreanDeal} unit=" GW" source="APR1400 @ £3.3bn/GW" />
            </Card>

            <Card title="Reform & Productivity" accent={COLORS.purple}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontFamily: MONO, color: "#8892a4", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={tripleLockReform} onChange={(e) => setTripleLockReform(e.target.checked)} style={{ accentColor: COLORS.red }} />
                  Reform Triple Lock
                  <span style={{ fontSize: 8, color: "#3a4558" }}>(IFS: saves £12bn/yr)</span>
                </label>
              </div>
              <Slider label="Disability Reform" min={0} max={100} step={5} value={disabilityReform} onChange={setDisabilityReform} unit="%" source="OBR: £4.8bn by 2029-30" />
              <Slider label="AI Adoption" min={0} max={100} step={5} value={aiAdoption} onChange={setAiAdoption} unit="%" source="Public First: up to £38bn/yr" />
              <Slider label="Planning Reform" min={0} max={100} step={5} value={planningReform} onChange={setPlanningReform} unit="%" />
            </Card>

            <Card title="Industry & Export" accent={COLORS.orange}>
              <Slider label="Data Centre Demand" min={0} max={40} step={1} value={dcDemand} onChange={setDcDemand} unit=" GW" source="Current: ~3 GW" />
              <Slider label="Renewable Scale" min={50} max={200} step={5} value={renewableScale} onChange={setRenewableScale} unit="%" source="100% = DESNZ pipeline" />
              <Slider label="Export Ambition" min={0} max={100} step={5} value={exportAmbition} onChange={setExportAmbition} unit="%" />
              <Slider label="Hydrogen Hubs" min={0} max={10} step={1} value={hydrogenHubs} onChange={setHydrogenHubs} unit="" />
            </Card>

            {/* Quick scenarios */}
            <Card title="Quick Scenarios" accent={COLORS.yellow}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {quickScenarios.map(({ label, fn }) => (
                  <button key={label} onClick={fn} style={{
                    padding: "6px 12px", borderRadius: 6, border: "1px solid #2a3441",
                    background: "rgba(15,23,42,0.4)", color: "#8892a4",
                    fontSize: 10.5, fontFamily: MONO, cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.teal; e.currentTarget.style.color = "#e8ecf2"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a3441"; e.currentTarget.style.color = "#8892a4"; }}
                  >{label}</button>
                ))}
              </div>
            </Card>
          </div>

          {/* ═══ RIGHT: CHARTS + DATA ═══ */}
          <div>
            {/* Score meters + radar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 14, marginBottom: 14 }}>
              <Card title="Performance Scores">
                <MeterBar label="Energy (x3)" value={last.energyScore} max={100} color={COLORS.teal} />
                <MeterBar label="Fiscal (x2)" value={last.fiscalScore} max={100} color={COLORS.purple} />
                <MeterBar label="Green (x2)" value={last.greenScore} max={100} color={COLORS.green} />
                <MeterBar label="Industrial (x2)" value={last.industrialScore} max={100} color={COLORS.orange} />
                <MeterBar label="Growth (x1)" value={Math.min(100, Math.round(last.reformedGrowth / 4 * 100))} max={100} color={COLORS.blue} />
              </Card>
              <div style={{
                background: "rgba(15,23,42,0.6)", borderRadius: 12, padding: "10px",
                border: "1px solid rgba(78,205,196,0.12)",
              }}>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e2836" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 8, fontFamily: MONO, fill: "#6b7a8d" }} />
                    <Radar dataKey="value" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Deficit trajectory */}
            <Card title="Deficit Trajectory (£bn) — Baseline vs Reformed">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="gBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.red} stopOpacity={0.2} /><stop offset="100%" stopColor={COLORS.red} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gRef" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.2} /><stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="year" tick={CHART_TICK} stroke="#1e2836" />
                  <YAxis tick={CHART_TICK} stroke="#1e2836" />
                  <Tooltip contentStyle={TT_STYLE} />
                  <ReferenceLine y={0} stroke={COLORS.green} strokeDasharray="5 5" strokeOpacity={0.3} label={{ value: "Surplus", fill: COLORS.green, fontSize: 9, fontFamily: MONO }} />
                  <Area type="monotone" dataKey="baseDeficit" name="OBR Baseline" stroke={COLORS.red} fill="url(#gBase)" strokeWidth={1.5} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="deficit" name="Reformed" stroke={COLORS.teal} fill="url(#gRef)" strokeWidth={2.5} />
                  <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* GDP Growth */}
            <Card title="Real GDP Growth (%)">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="year" tick={CHART_TICK} stroke="#1e2836" />
                  <YAxis tick={CHART_TICK} stroke="#1e2836" domain={[0, "auto"]} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <ReferenceLine y={3} stroke={COLORS.yellow} strokeDasharray="3 3" strokeOpacity={0.3}
                    label={{ value: "3% target", fill: COLORS.yellow, fontSize: 9, fontFamily: MONO }} />
                  <Line type="monotone" dataKey="baseGrowth" name="OBR Forecast" stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="reformedGrowth" name="With Reform" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.teal }} />
                  <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Debt/GDP */}
              <Card title="Debt / GDP (%)">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                    <XAxis dataKey="year" tick={{ ...CHART_TICK, fontSize: 8 }} stroke="#1e2836" />
                    <YAxis tick={CHART_TICK} stroke="#1e2836" />
                    <Tooltip contentStyle={TT_STYLE} />
                    <ReferenceLine y={100} stroke={COLORS.red} strokeDasharray="3 3" strokeOpacity={0.25} />
                    <Line type="monotone" dataKey="baseDebtGdp" name="Baseline" stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="debtGdp" name="Reformed" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 2, fill: COLORS.teal }} />
                    <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 9 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Nuclear Fleet */}
              <Card title="Nuclear Fleet (GW)" accent={COLORS.blue}>
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                    <XAxis dataKey="year" tick={{ ...CHART_TICK, fontSize: 8 }} stroke="#1e2836" />
                    <YAxis tick={CHART_TICK} stroke="#1e2836" />
                    <Tooltip contentStyle={TT_STYLE} />
                    <Bar dataKey="nuclearGW" name="Nuclear GW" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="renewableGW" name="Renewable GW" stroke={COLORS.green} strokeWidth={1.5} dot={false} />
                    <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 9 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Energy Price */}
              <Card title="Wholesale Energy Price (£/MWh)" accent={COLORS.green}>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="gPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.2} /><stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                    <XAxis dataKey="year" tick={{ ...CHART_TICK, fontSize: 8 }} stroke="#1e2836" />
                    <YAxis tick={CHART_TICK} stroke="#1e2836" />
                    <Tooltip contentStyle={TT_STYLE} />
                    <ReferenceLine y={40} stroke={COLORS.green} strokeDasharray="3 3" strokeOpacity={0.4}
                      label={{ value: "Abundance", fill: COLORS.green, fontSize: 8, fontFamily: MONO }} />
                    <Area type="monotone" dataKey="energyPrice" name="£/MWh" stroke={COLORS.teal} fill="url(#gPrice)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Reform Savings */}
              <Card title="Reform Savings (£bn/yr)" accent={COLORS.purple}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                    <XAxis dataKey="year" tick={{ ...CHART_TICK, fontSize: 8 }} stroke="#1e2836" />
                    <YAxis tick={CHART_TICK} stroke="#1e2836" />
                    <Tooltip contentStyle={TT_STYLE} />
                    <Bar dataKey="pensionSaving" name="Pension" stackId="s" fill={COLORS.red} />
                    <Bar dataKey="disabilitySaving" name="Disability" stackId="s" fill={COLORS.yellow} />
                    <Bar dataKey="aiSaving" name="AI Efficiency" stackId="s" fill={COLORS.blue} />
                    <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 9 }} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Achievements bar */}
            <Card title={`Achievements (${shownAchievements.length}/${ACHIEVEMENTS.length})`} accent={COLORS.gold}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ACHIEVEMENTS.map(a => {
                  const unlocked = shownAchievements.includes(a.id);
                  return (
                    <div key={a.id} title={unlocked ? `${a.title}: ${a.desc}` : "???"} style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: unlocked ? `${COLORS.gold}15` : "rgba(15,23,42,0.5)",
                      border: `1px solid ${unlocked ? COLORS.gold + "44" : "#1a2332"}`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      opacity: unlocked ? 1 : 0.3, transition: "all 0.3s",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 900, fontFamily: MONO, color: unlocked ? COLORS.gold : "#2a3441" }}>
                        {unlocked ? a.icon : "?"}
                      </div>
                      <div style={{ fontSize: 5.5, fontFamily: MONO, color: unlocked ? COLORS.gold : "#2a3441", textAlign: "center", lineHeight: 1 }}>
                        {unlocked ? a.title.split(" ")[0] : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Detailed table */}
            <Card title="Detailed Output">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5, fontFamily: MONO }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a3441" }}>
                      {["Year", "Nuc GW", "Ren GW", "£/MWh", "Growth", "Deficit", "Debt%", "Reform", "CO2%", "DC Tax", "Export"].map(h => (
                        <th key={h} style={{ padding: "4px 6px", textAlign: "right", color: "#4a5568", fontWeight: 500, fontSize: 9, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(42,52,65,0.3)" }}>
                        <td style={{ padding: "3px 6px", color: "#8892a4", fontWeight: 600 }}>{r.year}</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: COLORS.blue }}>{r.nuclearGW}</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: COLORS.green }}>{r.renewableGW}</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: r.energyPrice < 50 ? COLORS.green : r.energyPrice < 70 ? COLORS.yellow : COLORS.red, fontWeight: 700 }}>£{r.energyPrice}</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: r.reformedGrowth >= 3 ? COLORS.green : r.reformedGrowth >= 2 ? COLORS.yellow : COLORS.red, fontWeight: 700 }}>{r.reformedGrowth}%</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: r.deficit < 0 ? COLORS.green : COLORS.red }}>£{r.deficit}bn</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: r.debtGdp > 100 ? COLORS.red : "#6b7a8d" }}>{r.debtGdp}%</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: COLORS.purple }}>£{r.totalReformSaving}bn</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: COLORS.green }}>{r.co2}%</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: COLORS.teal }}>£{r.dcTax}bn</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: COLORS.orange }}>£{r.exportRev}bn</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Sources */}
            <div style={{ fontSize: 8, fontFamily: MONO, color: "#1e2836", lineHeight: 1.6, marginTop: 8 }}>
              Sources: OBR Economic & Fiscal Outlook (Nov 2025) · IFS Triple Lock Analysis · IFS Disability Benefits Report ·
              DESNZ Energy Trends (Dec 2025) · Carbon Brief UK Renewables Analysis (2025) · National Grid ESO ·
              Public First AI in the Public Sector · Ofgem Price Cap Q2 2025 · World Nuclear Association ·
              DWP Annual Report 2024-25 · DUKES 2025
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "24px 0 12px", borderTop: "1px solid rgba(78,205,196,0.06)", marginTop: 20 }}>
          <div style={{ fontSize: 8.5, fontFamily: MONO, color: "#1a2332", letterSpacing: "0.1em", lineHeight: 1.6 }}>
            ENERGY ABUNDANCE · UK POLICY SIMULATION · BASED ON BREAKING THE DOOM LOOP MODEL<br />
            All assumptions adjustable · Central scenario applies IFS-methodology discount rates to reform savings<br />
            Nuclear deployment curves based on HPC/SZC/SMR actual programme timelines
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 850px) {
          .controls-panel { display: contents; }
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
