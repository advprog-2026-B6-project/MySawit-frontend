"use client";

import { useState } from "react";
import MandorTab from "./components/MandorTab";
import SupirTab from "./components/SupirTab";
import { Button } from "@/components/ui/button";

export default function PengirimanPage() {
  const [activeTab, setActiveTab] = useState("mandor");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">MySawit</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Sistem Pengiriman
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola supir, muatan, dan status pengiriman secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === "mandor" ? "default" : "secondary"}
            onClick={() => setActiveTab("mandor")}
            data-testid="tab-mandor"
          >
            Mandor
          </Button>
          <Button
            variant={activeTab === "supir" ? "default" : "secondary"}
            onClick={() => setActiveTab("supir")}
            data-testid="tab-supir"
          >
            Supir Truk
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          {activeTab === "mandor" && <MandorTab />}
          {activeTab === "supir" && <SupirTab />}
        </div>
      </div>
    </div>
  );
}
