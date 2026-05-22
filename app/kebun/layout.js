"use client";

import {
  EmptyState,
  PageHero,
  PageShell,
  SurfaceCard,
} from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { LogIn, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

function getAccessStatus() {
  if (typeof window === "undefined") {
    return "loading";
  }

  const token = localStorage.getItem("token");
  if (!token) {
    return "no-token";
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "ADMIN" ? "authorized" : "unauthorized";
  } catch {
    return "no-token";
  }
}

export default function KebunLayout({ children }) {
  const router = useRouter();
  const status = getAccessStatus();

  if (status === "loading") {
    return null;
  }

  if (status === "no-token") {
    return (
      <PageShell>
        <PageHero
          eyebrow="Manajemen Kebun"
          title="Silakan Login"
          description="Anda belum login. Silakan login terlebih dahulu untuk mengakses halaman ini."
        />
        <SurfaceCard>
          <EmptyState
            title="Token login tidak ditemukan"
            description="Masuk kembali agar akses admin kebun dapat diverifikasi."
            actions={
              <Button onClick={() => router.push("/login")}>
                <LogIn className="size-4" />
                Masuk
              </Button>
            }
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  if (status === "unauthorized") {
    return (
      <PageShell>
        <PageHero
          eyebrow="Manajemen Kebun"
          title="Akses Ditolak"
          description="Halaman Manajemen Kebun hanya dapat diakses oleh Admin Utama."
        />
        <SurfaceCard>
          <EmptyState
            title="Akun tidak memiliki izin"
            description="Hubungi Admin Utama jika Anda memerlukan akses."
            actions={
              <Button variant="outline" onClick={() => router.push("/")}>
                <ShieldAlert className="size-4" />
                Kembali ke Beranda
              </Button>
            }
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  return <>{children}</>;
}
