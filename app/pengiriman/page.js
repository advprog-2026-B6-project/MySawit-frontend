"use client";

import { useEffect, useMemo, useState } from "react";
import MandorTab from "./components/MandorTab";
import SupirTab from "./components/SupirTab";
import AdminTab from "./components/AdminTab";
import { Button } from "@/components/ui/button";

export default function PengirimanPage() {
  const [activeTab, setActiveTab] = useState("mandor");
  const [currentName, setCurrentName] = useState("Pengguna");
  const [currentRole, setCurrentRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const [, payload] = token.split(".");
        if (payload) {
          const parsed = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
          const tokenName =
            parsed.fullname || parsed.fullName || parsed.name || parsed.username || parsed.sub;
          const tokenRole = parsed.role || parsed.roles?.[0] || parsed.authority;
          if (tokenName) {
            setCurrentName(tokenName);
            localStorage.setItem("userName", tokenName);
            localStorage.setItem("username", parsed.username || parsed.sub || tokenName);
          }
          if (tokenRole) {
            const normalized = String(tokenRole).toUpperCase();
            setCurrentRole(normalized);
            if (normalized === "SUPIR") setActiveTab("supir");
            else if (normalized === "ADMIN") setActiveTab("admin");
            else setActiveTab("mandor");
            localStorage.setItem("userRole", normalized);
          }
          return;
        }
      } catch {
        // fallback to localStorage below
      }
    }

    const storedName = localStorage.getItem("userName") || localStorage.getItem("username");
    const storedRole = localStorage.getItem("userRole");
    if (storedName) setCurrentName(storedName);
    if (storedRole) {
      setCurrentRole(storedRole.toUpperCase());
      if (storedRole.toUpperCase() === "SUPIR") setActiveTab("supir");
      else if (storedRole.toUpperCase() === "ADMIN") setActiveTab("admin");
      else setActiveTab("mandor");
    }

    // token-first flow handled above
  }, []);

  const normalizedRole = useMemo(() => currentRole?.toUpperCase(), [currentRole]);
  const isMandor = normalizedRole === "MANDOR";
  const isSupir = normalizedRole === "SUPIR";
  const isAdmin = normalizedRole === "ADMIN";
  const isBuruh = normalizedRole === "BURUH";

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

        {!isMandor && !isSupir && !isAdmin && !isBuruh && (
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
            <Button
              variant={activeTab === "admin" ? "default" : "secondary"}
              onClick={() => {
                setActiveTab("admin");
                setCurrentRole("ADMIN");
                localStorage.setItem("userRole", "ADMIN");
              }}
              data-testid="tab-admin"
            >
              Admin
            </Button>
          </div>
        )}

        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          {isBuruh && (
            <p className="text-sm text-muted-foreground">Tidak ada data pengiriman untuk role BURUH.</p>
          )}
          {(isMandor || (!isMandor && !isSupir && !isAdmin && !isBuruh && activeTab === "mandor")) && <MandorTab />}
          {(isSupir || (!isMandor && !isSupir && !isAdmin && !isBuruh && activeTab === "supir")) && <SupirTab />}
          {(isAdmin || (!isMandor && !isSupir && !isAdmin && !isBuruh && activeTab === "admin")) && <AdminTab />}
        </div>
      </div>
    </div>
  );
}
