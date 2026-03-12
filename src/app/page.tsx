"use client";
import dynamic from "next/dynamic";

const EnergyAbundanceGame = dynamic(
  () => import("@/components/EnergyAbundanceGame"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(155deg, #050a12 0%, #0f172a 40%, #0a1628 100%)",
          fontFamily: "var(--font-mono), monospace",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 14,
              color: "#4ecdc4",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            INITIALISING ENERGY GRID...
          </div>
          <div style={{ fontSize: 11, color: "#2d3a4a", marginTop: 12 }}>
            Loading policy simulation engine
          </div>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <EnergyAbundanceGame />;
}
