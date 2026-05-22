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
import {
  getHasilAccessStatus,
  HasilAccessGuard,
} from "@/app/hasil/_components/accessguard";
import { getAuthHeaders } from "@/lib/auth";
import { Filter, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const statusTones = {
  SUBMITTED: "sky",
  VERIFIED: "green",
  REJECTED: "red",
};

export default function BuruhRiwayatPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const accessStatus = getHasilAccessStatus("BURUH");

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (status) params.set("status", status);

    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const fetchHistory = async () => {
    if (accessStatus !== "authorized") {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${backendUrl}/hasil-reports/me/history${buildQuery()}`,
        { headers: getAuthHeaders() },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal mengambil riwayat panen pribadi");
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
    if (accessStatus === "authorized") {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessStatus]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchHistory();
  };

  if (accessStatus !== "authorized") {
    return (
      <HasilAccessGuard
        status={accessStatus}
        requiredRole="BURUH"
        title="Riwayat Panen"
      />
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Riwayat Panen"
        title="Riwayat Panen Pribadi Buruh"
        description="Pantau laporan panen pribadi berdasarkan tanggal dan status verifikasi."
      />

      <SurfaceCard>
        <SectionHeader
          eyebrow="Filter Riwayat"
          title="Cari laporan panen"
          description="Gunakan filter untuk melihat laporan dalam periode dan status tertentu."
        />

        {error ? (
          <AlertMessage type="error" className="mb-5">
            {error}
          </AlertMessage>
        ) : null}

        <form
          onSubmit={handleFilterSubmit}
          className="grid gap-4 md:grid-cols-[1fr_1fr_220px_auto]"
        >
          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Semua</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
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
            title="Belum ada riwayat panen"
            description="Tidak ada laporan yang sesuai dengan filter saat ini."
          />
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {report.hasilDate || "-"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {report.weightKg ?? "-"} kg
                    </p>
                  </div>
                  <StatusBadge tone={statusTones[report.status] || "slate"}>
                    {report.status || "-"}
                  </StatusBadge>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {report.news || "-"}
                </p>
                {report.status === "REJECTED" && report.rejectionReason ? (
                  <AlertMessage type="warning" className="mt-4">
                    <span className="font-semibold">Alasan penolakan:</span> {report.rejectionReason}
                  </AlertMessage>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </SurfaceCard>
    </PageShell>
  );
}
