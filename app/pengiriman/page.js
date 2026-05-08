"use client";

import { useMemo, useState } from "react";
import MandorTab from "./components/MandorTab";
import SupirTab from "./components/SupirTab";
import { Button } from "@/components/ui/button";

export default function PengirimanPage() {
  const getInitialUser = () => {
    if (typeof window === "undefined") {
      return { name: "Pengguna", role: "", tab: "mandor" };
    }

    const storedName = localStorage.getItem("userName") || localStorage.getItem("username");
    const storedRole = localStorage.getItem("userRole");
    let name = storedName || "Pengguna";
    let role = storedRole ? storedRole.toUpperCase() : "";
    let tab = role === "SUPIR" ? "supir" : "mandor";

    if (!storedName || !storedRole) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const [, payload] = token.split(".");
          if (payload) {
            const parsed = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
            const tokenName =
              parsed.fullname || parsed.fullName || parsed.name || parsed.username || parsed.sub;
            const tokenRole = parsed.role || parsed.roles?.[0] || parsed.authority;
            if (!storedName && tokenName) {
              name = tokenName;
              localStorage.setItem("userName", tokenName);
            }
            if (!storedRole && tokenRole) {
              const normalized = String(tokenRole).toUpperCase();
              role = normalized;
              tab = normalized === "SUPIR" ? "supir" : "mandor";
              localStorage.setItem("userRole", normalized);
            }
          }
        } catch {
          // ignore invalid token payload
        }
      }
    }

    return { name, role, tab };
  };

  const initialUser = useMemo(() => getInitialUser(), []);
  const [activeTab, setActiveTab] = useState(initialUser.tab);
  const [currentName, setCurrentName] = useState(initialUser.name);
  const [currentRole, setCurrentRole] = useState(initialUser.role);

  const normalizedRole = useMemo(() => currentRole?.toUpperCase(), [currentRole]);
  const isMandor = normalizedRole === "MANDOR";
  const isSupir = normalizedRole === "SUPIR";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">MySawit</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Sistem Pengiriman
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola supir, muatan, dan status pengiriman secara real-time.
            </p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-card-foreground shadow-sm">
            <p className="text-xs uppercase text-muted-foreground">User aktif</p>
            <p className="text-sm font-semibold">{currentName}</p>
            <p className="text-xs text-muted-foreground">
              Role: {normalizedRole || "Belum dipilih"}
            </p>
          </div>
        </div>

        {!isMandor && !isSupir && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Pilih tampilan:
            </span>
            <Button
              variant={activeTab === "mandor" ? "default" : "secondary"}
              onClick={() => {
                setActiveTab("mandor");
                setCurrentRole("MANDOR");
                localStorage.setItem("userRole", "MANDOR");
              }}
              data-testid="tab-mandor"
            >
              Mandor
            </Button>
            <Button
              variant={activeTab === "supir" ? "default" : "secondary"}
              onClick={() => {
                setActiveTab("supir");
                setCurrentRole("SUPIR");
                localStorage.setItem("userRole", "SUPIR");
              }}
              data-testid="tab-supir"
            >
              Supir Truk
            </Button>
          </div>
        )}

        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          {(isMandor || (!isMandor && !isSupir && activeTab === "mandor")) && <MandorTab />}
          {(isSupir || (!isMandor && !isSupir && activeTab === "supir")) && <SupirTab />}
        </div>
      </div>
    </div>
  );
}
