"use client";

import {
  PageHero,
  PageShell,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Alert from "../../components/Alert";
import TablePengirimanSupirReadonly from "../../components/TablePengirimanSupirReadonly";
import { fetchMandorAssignmentsBySupirId, fetchSupirById } from "../../lib/api";

export default function SupirProfilePage() {
  const { id } = useParams();
  const [supir, setSupir] = useState(null);
  const [pengiriman, setPengiriman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (!id) return;
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [supirResult, pengirimanResult] = await Promise.all([
          fetchSupirById(id),
          fetchMandorAssignmentsBySupirId(id),
        ]);

        if (!active) return;

        if (supirResult?.success) {
          setSupir(supirResult.data);
        } else {
          setAlert({
            message: supirResult?.message || "Supir tidak ditemukan",
            type: "error",
          });
        }

        if (pengirimanResult?.success) {
          setPengiriman(pengirimanResult.data || []);
        } else if (pengirimanResult?.message) {
          setAlert({
            message: pengirimanResult.message,
            type: "error",
          });
        }
      } catch (error) {
        if (!active) return;
        setAlert({
          message: `Gagal memuat profil supir: ${error.message}`,
          type: "error",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Distribusi Komoditas"
        title={supir?.nama ?? "Detail Supir"}
        description="Profil supir truk dan daftar pengiriman yang ditugaskan."
        actions={
          <Button asChild variant="outline">
            <Link href="/pengiriman">
              <ArrowLeft className="size-4" />
              Kembali ke Pengiriman
            </Link>
          </Button>
        }
      />

      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "success" })}
      />

        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold">Informasi Supir</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">ID Supir</p>
              <p className="text-sm font-medium text-muted-foreground">{supir?.id ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Nomor Telepon</p>
              <p className="text-sm font-medium">{supir?.nomorTelepon ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Plat Nomor Truk</p>
              <p className="text-sm font-medium">{supir?.platNomorTruk ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Status Bertugas</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  supir?.sedangBertugas
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {supir?.sedangBertugas ? "Bertugas" : "Tidak Bertugas"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Pengiriman Supir</h2>
              <p className="text-sm text-muted-foreground">
                Daftar pengiriman yang ditugaskan kepada supir ini.
              </p>
            </div>
          </div>
        </div>

      <SurfaceCard>
        <SectionHeader
          eyebrow="Pengiriman"
          title="Pengiriman Supir"
          description="Daftar muatan yang menjadi tanggung jawab supir dalam proses distribusi."
        />
        {loading ? (
          <div className="py-6 text-sm text-slate-500">Memuat...</div>
        ) : (
          <TablePengirimanSupirReadonly
            data={pengiriman}
            loading={loading}
          />
        )}
      </SurfaceCard>
    </PageShell>
  );
}

function DetailItem({ label, value, mono }) {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-3 text-sm font-semibold text-slate-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
