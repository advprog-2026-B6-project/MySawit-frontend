"use client";

import {
  AlertMessage,
  EmptyState,
  PageHero,
  PageShell,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Loader2, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const statusTones = {
  SUBMITTED: "sky",
  VERIFIED: "green",
  REJECTED: "red",
};

export default function MandorRiwayatPage() {
  const [date, setDate] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token login tidak ditemukan. Silakan login kembali.");
    }
    return { Authorization: `Bearer ${token}` };
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (workerName) params.set("workerName", workerName);

    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${backendUrl}/hasil-reports/mandor/history${buildQuery()}`,
        { headers: getAuthHeader() },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal mengambil riwayat panen mandor");
      }

      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchHistory();
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Verifikasi Panen"
        title="Riwayat Panen Buruh (Mandor)"
        description="Pantau laporan panen buruh untuk memastikan data produksi siap diverifikasi dan ditindaklanjuti."
      />

      <SurfaceCard>
        <SectionHeader
          eyebrow="Filter Mandor"
          title="Cari laporan buruh"
          description="Pilih tanggal atau nama buruh untuk menyaring riwayat panen."
        />

        {error ? (
          <AlertMessage type="error" className="mb-5">
            {error}
          </AlertMessage>
        ) : null}

        <form
          onSubmit={handleFilterSubmit}
          className="grid gap-4 md:grid-cols-[220px_1fr_auto]"
        >
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workerName">Nama Buruh</Label>
            <Input
              id="workerName"
              type="text"
              value={workerName}
              onChange={(event) => setWorkerName(event.target.value)}
              placeholder="Contoh: Budi"
            />
          </div>

          <Button type="submit" disabled={loading} className="self-end">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Filter className="size-4" />
            )}
            Terapkan Filter
          </Button>
        </form>
      </SurfaceCard>

      <SurfaceCard className="mt-6">
        <SectionHeader
          eyebrow="Daftar Laporan"
          title="Hasil pencarian"
          description={`${reports.length} laporan ditemukan.`}
        />

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Memuat riwayat panen...
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            title="Tidak ada data riwayat panen"
            description="Tidak ada laporan yang sesuai dengan filter saat ini."
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-green-100 bg-white">
            <div className="grid grid-cols-12 gap-4 bg-green-50 px-5 py-4 text-sm font-semibold text-green-900">
              <div className="col-span-2">Tanggal</div>
              <div className="col-span-3">Nama Buruh</div>
              <div className="col-span-2">Kilogram</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3">Aksi</div>
            </div>
            {reports.map((report) => (
              <div
                key={report.id}
                className="grid grid-cols-12 gap-4 border-t border-slate-100 px-5 py-4 text-sm"
              >
                <div className="col-span-2 text-slate-700">
                  {report.hasilDate || "-"}
                </div>
                <div className="col-span-3 font-medium text-slate-900">
                  {report.workerName || report.workerId || "-"}
                </div>
                <div className="col-span-2 text-slate-700">
                  {report.weightKg ?? "-"} kg
                </div>
                <div className="col-span-2">
                  <StatusBadge tone={statusTones[report.status] || "slate"}>
                    {report.status || "-"}
                  </StatusBadge>
                </div>
                <div className="col-span-3">
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/mandor/buruh/${encodeURIComponent(report.workerId)}`}
                    >
                      <User className="size-4" />
                      Lihat Profil Buruh
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </PageShell>
  );
}
