"use client";

import { PageHero, PageShell, StatusBadge, SurfaceCard } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Truck, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import MandorTab from "./components/MandorTab";
import SupirTab from "./components/SupirTab";

function getInitialUser() {
  if (typeof window === "undefined") {
    return { name: "Pengguna", role: "", tab: "mandor" };
  }

  const storedName =
    localStorage.getItem("userName") || localStorage.getItem("username");
  const storedRole = localStorage.getItem("userRole");

  if (storedRole) {
    const normalized = storedRole.toUpperCase();
    return {
      name: storedName || "Pengguna",
      role: normalized,
      tab: normalized === "SUPIR" ? "supir" : "mandor",
    };
  }

  const token = localStorage.getItem("token");
  if (!token) {
    return { name: storedName || "Pengguna", role: "", tab: "mandor" };
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return { name: storedName || "Pengguna", role: "", tab: "mandor" };
    }
    const parsed = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    const tokenName =
      parsed.fullname ||
      parsed.fullName ||
      parsed.name ||
      parsed.username ||
      parsed.sub;
    const tokenRole = parsed.role || parsed.roles?.[0] || parsed.authority;
    const normalized = tokenRole ? String(tokenRole).toUpperCase() : "";
    return {
      name: storedName || tokenName || "Pengguna",
      role: normalized,
      tab: normalized === "SUPIR" ? "supir" : "mandor",
    };
  } catch {
    return { name: storedName || "Pengguna", role: "", tab: "mandor" };
  }
}

export default function PengirimanPage() {
  const initialUser = useMemo(() => getInitialUser(), []);
  const [activeTab, setActiveTab] = useState(initialUser.tab);
  const [currentName] = useState(initialUser.name);
  const [currentRole, setCurrentRole] = useState(initialUser.role);

  const normalizedRole = useMemo(() => currentRole?.toUpperCase(), [currentRole]);
  const isMandor = normalizedRole === "MANDOR";
  const isSupir = normalizedRole === "SUPIR";
  const isAdmin = normalizedRole === "ADMIN";
  const isBuruh = normalizedRole === "BURUH";

  return (
    <PageShell>
      <PageHero
        eyebrow="Distribusi Komoditas"
        title="Manajemen Pengiriman Hasil Panen Sawit"
        description="Pantau penugasan supir, muatan komoditas, dan status perjalanan menuju pabrik pengolahan."
        actions={
          <div className="rounded-2xl border border-green-100 bg-white/80 px-4 py-3 text-sm shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <UserRound className="size-4 text-green-700" />
              {currentName}
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Peran: {normalizedRole || "Belum dipilih"}
            </p>
          </div>
        }
      />

        {!isMandor && !isSupir && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Pilih tampilan:
            </span>
            <Button
              variant={activeTab === "mandor" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("mandor");
                setCurrentRole("MANDOR");
                localStorage.setItem("userRole", "MANDOR");
              }}
              data-testid="tab-mandor"
            >
              <UserRound className="size-4" />
              Mandor
            </Button>
            <Button
              variant={activeTab === "supir" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("supir");
                setCurrentRole("SUPIR");
                localStorage.setItem("userRole", "SUPIR");
              }}
              data-testid="tab-supir"
            >
              <Truck className="size-4" />
              Supir Truk
            </Button>
          </div>
        )}

      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        {(isMandor || (!isMandor && !isSupir && activeTab === "mandor")) && <MandorTab />}
        {(isSupir || (!isMandor && !isSupir && activeTab === "supir")) && <SupirTab />}
      </div>
    </PageShell>
  );
}
