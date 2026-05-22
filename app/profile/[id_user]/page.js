"use client";

import {
  EmptyState,
  PageHero,
  PageShell,
  SurfaceCard,
} from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { requestJson } from "@/lib/api-client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const roleBadgeStyles = {
  ADMIN: "border-emerald-200 bg-emerald-50 text-emerald-800",
  MANDOR: "border-amber-200 bg-amber-50 text-amber-800",
  BURUH: "border-sky-200 bg-sky-50 text-sky-800",
  SUPIR: "border-violet-200 bg-violet-50 text-violet-800",
  DRIVER: "border-violet-200 bg-violet-50 text-violet-800",
};

function DetailItem({ label, value, children }) {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <div className="mt-3 text-base font-semibold text-slate-900">
        {children || value}
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const idUser = params.id_user;
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        setError("");
        const data = await requestJson(`/users/${idUser}`);
        setUser(data);
      } catch (loadError) {
        setError(loadError.message || "Gagal memuat profil pengguna.");
        toast.error(loadError.message || "Gagal memuat profil pengguna.");
      } finally {
        setIsLoading(false);
      }
    }

    if (idUser) {
      loadUser();
    }
  }, [idUser]);

  const initials = useMemo(() => {
    if (!user?.fullname) {
      return "?";
    }

    return user.fullname.charAt(0).toUpperCase();
  }, [user]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Profil Pengguna"
        title="Detail akun operasional"
        description="Lihat identitas, peran, dan informasi pendukung pegawai yang terdaftar di MySawit."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
        }
      />

      {isLoading ? (
        <SurfaceCard className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          Memuat profil pengguna...
        </SurfaceCard>
      ) : error || !user ? (
        <EmptyState
          title="Profil tidak ditemukan"
          description={error || "Data pengguna yang diminta tidak dapat dimuat."}
          actions={
            <Button variant="outline" onClick={() => router.push("/admin")}>
              Kembali ke admin
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <SurfaceCard>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex size-24 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-800">
                  {initials}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    {user.fullname}
                  </h2>
                  <p className="mt-2 text-base text-slate-600">
                    @{user.username}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${roleBadgeStyles[user.role] || "border-slate-200 bg-slate-50 text-slate-700"}`}
              >
                {user.role}
              </span>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                Detail Profil
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Informasi akun
              </h2>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <DetailItem label="Nama lengkap" value={user.fullname} />
              <DetailItem label="Nama pengguna" value={`@${user.username}`} />
              <DetailItem label="Peran">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${roleBadgeStyles[user.role] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                >
                  {user.role}
                </span>
              </DetailItem>
              {user.email ? (
                <DetailItem label="Email" value={user.email} />
              ) : null}
              {user.role === "MANDOR" ? (
                <DetailItem
                  label="Nomor sertifikasi"
                  value={user.certificationNumber || "Belum tersedia"}
                />
              ) : null}
            </div>
          </SurfaceCard>
        </div>
      )}
    </PageShell>
  );
}
