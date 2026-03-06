"use client";

import { useState } from "react";
import MandorTab from "./components/MandorTab";
import SupirTab from "./components/SupirTab";
import "./pengiriman.css";

export default function PengirimanPage() {
  const [activeTab, setActiveTab] = useState("mandor");

  return (
    <div className="pengiriman-container">
      <h1>MySawit - Sistem Pengiriman</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "mandor" ? "active" : ""}`}
          onClick={() => setActiveTab("mandor")}
          data-testid="tab-mandor"
        >
          Mandor
        </button>
        <button
          className={`tab-btn ${activeTab === "supir" ? "active" : ""}`}
          onClick={() => setActiveTab("supir")}
          data-testid="tab-supir"
        >
          Supir Truk
        </button>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === "mandor" && <MandorTab />}
        {activeTab === "supir" && <SupirTab />}
      </div>
    </div>
  );
}
