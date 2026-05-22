"use client";

import {
  EmptyState,
  PageHero,
  PageShell,
  SurfaceCard,
} from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { getStoredToken, parseRoleFromToken } from "@/lib/auth";
import { LogIn, ShieldAlert } from "lucide-react";
import Link from "next/link";

function normalizeRole(role) {
  return role ? role.replace(/^ROLE_/, "").toUpperCase() : null;
}

export function getHasilAccessStatus(requiredRole) {
  if (typeof window === "undefined") {
    return "loading";
  }

  const token = getStoredToken();
  if (!token) {
    return "no-token";
  }

  const role = normalizeRole(parseRoleFromToken(token));
  return role === requiredRole ? "authorized" : "unauthorized";
}

export function HasilAccessGuard({
  status,
  requiredRole,
  title = "Manajemen Hasil",
}) {
  if (status === "loading") {
    return null;
  }

  const roleLabel = requiredRole === "MANDOR" ? "Mandor" : "Buruh";

  if (status === "no-token") {
    return (
      <PageShell>
        <PageHero
          eyebrow={title}
          title="Silakan Login"
          description="Anda belum login. Silakan login terlebih dahulu untuk mengakses halaman ini."
        />
        <SurfaceCard>
          <EmptyState
            title="Token login tidak ditemukan"
            description="Masuk kembali agar akses modul hasil dapat diverifikasi."
            actions={
              <Button asChild>
                <Link href="/login">
                  <LogIn className="size-4" />
                  Masuk
                </Link>
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
          eyebrow={title}
          title="Akses Ditolak"
          description={`Halaman ini hanya dapat diakses oleh ${roleLabel}.`}
        />
        <SurfaceCard>
          <EmptyState
            title="Akun tidak memiliki izin"
            description="Gunakan akun dengan peran yang sesuai untuk membuka halaman ini."
            actions={
              <Button asChild variant="outline">
                <Link href="/">
                  <ShieldAlert className="size-4" />
                  Kembali ke Beranda
                </Link>
              </Button>
            }
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  return null;
}
