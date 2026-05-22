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
import { fetchPengirimanSupirTruk, fetchSupirById } from "../../lib/api";

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
          fetchPengirimanSupirTruk(id),
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

      <div className="space-y-6">
        <SurfaceCard>
          <SectionHeader
            eyebrow="Profil Supir"
            title="Informasi Supir"
            description="Data identitas supir dan status penugasan armada saat ini."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="ID Supir" value={supir?.id ?? "-"} mono />
            <DetailItem
              label="Nomor Telepon"
              value={supir?.nomorTelepon ?? "-"}
            />
            <DetailItem
              label="Plat Nomor Truk"
              value={supir?.platNomorTruk ?? "-"}
            />
            <div className="rounded-2xl border border-green-100 bg-green-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Status Bertugas
              </p>
              <div className="mt-3">
                <StatusBadge tone={supir?.sedangBertugas ? "green" : "slate"}>
                  {supir?.sedangBertugas ? "Bertugas" : "Tidak Bertugas"}
                </StatusBadge>
              </div>
            </div>
          </div>
        </SurfaceCard>

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
      </div>
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
