"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import AdminTab from "./components/AdminTab";
import MandorTab from "./components/MandorTab";
import SupirTab from "./components/SupirTab";
import { Button } from "@/components/ui/button";

const DEFAULT_USER = { name: "Pengguna", role: "", tab: "mandor" };
let cachedUserSnapshot = DEFAULT_USER;

const isSameSnapshot = (nextSnapshot, prevSnapshot) =>
  nextSnapshot.name === prevSnapshot.name &&
  nextSnapshot.role === prevSnapshot.role &&
  nextSnapshot.tab === prevSnapshot.tab;

const getUserSnapshot = () => {
  if (typeof window === "undefined") {
    return cachedUserSnapshot;
  }

  const storedName = localStorage.getItem("userName") || localStorage.getItem("username");
  const storedRole = localStorage.getItem("userRole");
  let name = storedName || "Pengguna";
  let role = storedRole ? storedRole.toUpperCase() : "";
  let tab = role === "SUPIR" ? "supir" : role === "ADMIN" ? "admin" : "mandor";

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
            tab = normalized === "SUPIR" ? "supir" : normalized === "ADMIN" ? "admin" : "mandor";
            localStorage.setItem("userRole", normalized);
          }
        }
      } catch {
        // ignore invalid token payload
      }
    }
  }

  const nextSnapshot = { name, role, tab };
  if (!isSameSnapshot(nextSnapshot, cachedUserSnapshot)) {
    cachedUserSnapshot = nextSnapshot;
  }

  return cachedUserSnapshot;
};

const subscribeToUser = (callback) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("mysawit-user", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("mysawit-user", handler);
  };
};

export default function PengirimanPage() {
  const user = useSyncExternalStore(subscribeToUser, getUserSnapshot, () => DEFAULT_USER);
  const [activeTab, setActiveTab] = useState("mandor");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setActiveTab(user.tab);
    }
  }, [isMounted, user.tab]);

  const displayUser = isMounted ? user : DEFAULT_USER;

  const normalizedRole = useMemo(() => displayUser.role?.toUpperCase(), [displayUser.role]);
  const isMandor = normalizedRole === "MANDOR";
  const isSupir = normalizedRole === "SUPIR";
  const isAdmin = normalizedRole === "ADMIN";

  const updateRole = (role, tab) => {
    localStorage.setItem("userRole", role);
    setActiveTab(tab);
    window.dispatchEvent(new Event("mysawit-user"));
  };

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
            <p className="text-sm font-semibold" suppressHydrationWarning>
              {displayUser.name}
            </p>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
              Role: {normalizedRole || "Belum dipilih"}
            </p>
          </div>
        </div>

        {!isMandor && !isSupir && !isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Pilih tampilan:
            </span>
            <Button
              variant={activeTab === "mandor" ? "default" : "secondary"}
              onClick={() => updateRole("MANDOR", "mandor")}
              data-testid="tab-mandor"
            >
              Mandor
            </Button>
            <Button
              variant={activeTab === "supir" ? "default" : "secondary"}
              onClick={() => updateRole("SUPIR", "supir")}
              data-testid="tab-supir"
            >
              Supir Truk
            </Button>
            <Button
              variant={activeTab === "admin" ? "default" : "secondary"}
              onClick={() => updateRole("ADMIN", "admin")}
              data-testid="tab-admin"
            >
              Admin Utama
            </Button>
          </div>
        )}

        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          {(isMandor || (!isMandor && !isSupir && !isAdmin && activeTab === "mandor")) && (
            <MandorTab />
          )}
          {(isSupir || (!isMandor && !isSupir && !isAdmin && activeTab === "supir")) && (
            <SupirTab />
          )}
          {(isAdmin || (!isMandor && !isSupir && !isAdmin && activeTab === "admin")) && (
            <AdminTab />
          )}
        </div>
      </div>
    </div>
  );
}
