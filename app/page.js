"use client";

import { PageHero, PageShell, SurfaceCard } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import {
  clearStoredToken,
  getStoredToken,
  parseRoleFromToken,
} from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

const defaultHighlights = [
  "Akses kerja disesuaikan untuk admin, mandor, buruh, dan supir truk.",
  "Data kebun sawit, luas lahan, dan koordinat tercatat terpusat.",
  "Laporan hasil panen buruh tersimpan untuk proses verifikasi mandor.",
  "Pengiriman komoditas ke pabrik dapat dipantau dari penugasan hingga tiba.",
  "Perhitungan upah dan pembayaran mengikuti catatan operasional yang tervalidasi.",
];

const authChangeEvent = "mysawit-auth-change";

function getAuthRoleSnapshot() {
  return parseRoleFromToken(getStoredToken());
}

function getServerAuthRoleSnapshot() {
  return null;
}

function subscribeToAuthChanges(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(authChangeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(authChangeEvent, callback);
  };
}

export default function Home() {
  const authRole = useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthRoleSnapshot,
    getServerAuthRoleSnapshot,
  );
  const [, setBackendMessage] = useState("Memeriksa layanan...");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/hello`)
      .then((res) => res.json())
      .then((data) =>
        setBackendMessage(
          data?.message ?? "Layanan belum mengirimkan respons yang valid.",
        ),
      )
      .catch(() =>
        setBackendMessage("Layanan backend belum dapat dihubungi."),
      );
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    window.dispatchEvent(new Event(authChangeEvent));
    toast.success("Sesi pengguna telah diakhiri.");
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="ADPRO B6"
        title="MySawit"
        description="Platform operasional terpadu untuk mengelola kebun, tenaga kerja, pengiriman komoditas, dan pembayaran."
        actions={
          authRole ? (
            <>
              {authRole === "BURUH" ? (
                <>
                  <Button asChild>
                    <Link href="/buruh/hasil">Input Hasil Panen</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/buruh/riwayat">Riwayat Panen Saya</Link>
                  </Button>
                </>
              ) : null}
              {authRole === "MANDOR" ? (
                <Button asChild>
                  <Link href="/mandor/riwayat">Verifikasi Panen</Link>
                </Button>
              ) : null}
              <Button variant="outline" onClick={handleLogout}>
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Daftar Akun</Link>
              </Button>
            </>
          )
        }
      />

      <SurfaceCard>
        <div className="overflow-hidden rounded-[2rem] border border-green-100 bg-linear-to-br from-green-50 via-white to-lime-50">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Deskripsi Sistem
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Integrasi data operasional perkebunan
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  MySawit menyelaraskan koordinasi antara
                  buruh kebun, mandor, armada transportasi, dan administrasi
                  pembayaran agar setiap perpindahan komoditas tercatat akurat.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {defaultHighlights.map((highlight, index) => (
                  <div
                    key={highlight}
                    className={cn(
                      "rounded-2xl border border-green-100 bg-white/85 p-4 text-sm text-slate-700 shadow-sm",
                      index < 3 ? "lg:col-span-2" : "lg:col-span-3",
                    )}
                  >
                    <div className="mb-3 inline-flex rounded-full bg-green-100 p-2 text-green-700">
                      <Sparkles className="size-4" />
                    </div>
                    <p>{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto min-h-[24rem] w-full max-w-xl">
              <Image
                src="/panda.png"
                alt="Maskot MySawit"
                fill
                priority
                className="object-contain drop-shadow-[0_24px_48px_rgba(22,101,52,0.18)]"
              />
            </div>
          </div>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
