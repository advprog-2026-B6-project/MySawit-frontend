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
import { Textarea } from "@/components/ui/textarea";
import {
  getHasilAccessStatus,
  HasilAccessGuard,
} from "@/app/hasil/_components/accessguard";
import { getAuthHeaders } from "@/lib/auth";
import { CheckCircle2, Filter, Loader2, User, XCircle } from "lucide-react";
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
  const [actionReport, setActionReport] = useState(null);
  const [actionType, setActionType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const accessStatus = getHasilAccessStatus("MANDOR");

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (workerName) params.set("workerName", workerName);

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
        `${backendUrl}/hasil-reports/mandor/history${buildQuery()}`,
        { headers: getAuthHeaders() },
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
    if (accessStatus === "authorized") {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessStatus]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchHistory();
  };

  const closeActionDialog = () => {
    if (actionLoading) {
      return;
    }

    setActionReport(null);
    setActionType("");
    setRejectionReason("");
    setActionError("");
  };

  const openApproveDialog = (report) => {
    setActionReport(report);
    setActionType("approve");
    setRejectionReason("");
    setActionError("");
  };

  const openRejectDialog = (report) => {
    setActionReport(report);
    setActionType("reject");
    setRejectionReason("");
    setActionError("");
  };

  const submitAction = async (event) => {
    event.preventDefault();

    if (!actionReport || !actionType) {
      return;
    }

    if (actionType === "reject" && !rejectionReason.trim()) {
      setActionError("Alasan penolakan wajib diisi.");
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const response = await fetch(
        `${backendUrl}/hasil-reports/mandor/${actionReport.id}/${actionType}`,
        {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            ...(actionType === "reject"
              ? { "Content-Type": "application/json" }
              : {}),
          },
          body:
            actionType === "reject"
              ? JSON.stringify({ rejectionReason: rejectionReason.trim() })
              : undefined,
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal memproses laporan panen");
      }

      await fetchHistory();
      closeActionDialog();
    } catch (err) {
      setActionError(err.message || "Terjadi kesalahan saat memproses data");
    } finally {
      setActionLoading(false);
    }
  };

  if (accessStatus !== "authorized") {
    return (
      <HasilAccessGuard
        status={accessStatus}
        requiredRole="MANDOR"
        title="Verifikasi Panen"
      />
    );
  }

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
              <div className="col-span-2">Nama Buruh</div>
              <div className="col-span-2">Kilogram</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Bukti foto</div>
              <div className="col-span-2">Aksi</div>
            </div>
            {reports.map((report) => (
              <div
                key={report.id}
                className="grid grid-cols-12 gap-4 border-t border-slate-100 px-5 py-4 text-sm"
              >
                <div className="col-span-2 text-slate-700">
                  {report.hasilDate || "-"}
                </div>
                <div className="col-span-2 font-medium text-slate-900">
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
                <div className="col-span-2 text-slate-700">
                  {Array.isArray(report.photoUrls) && report.photoUrls.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {report.photoUrls.map((photoUrl) => (
                        <span
                          key={photoUrl}
                          className="break-all rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs text-green-800"
                        >
                          {photoUrl}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </div>
                <div className="col-span-2 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="border-green-200 text-green-800 hover:bg-green-50 hover:text-green-900">
                    <Link
                      href={`/mandor/buruh/${encodeURIComponent(report.workerId)}`}
                    >
                      <User className="size-4" />
                      Lihat Profil Buruh
                    </Link>
                  </Button>
                  {report.status === "SUBMITTED" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-500"
                        onClick={() => openApproveDialog(report)}
                      >
                        <CheckCircle2 className="size-4" />
                        Setujui
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                        onClick={() => openRejectDialog(report)}
                      >
                        <XCircle className="size-4" />
                        Tolak
                      </Button>
                    </>
                  ) : (
                    <span className="self-center text-xs font-medium text-slate-500">
                      Laporan sudah diproses
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>

      {actionReport ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-green-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Verifikasi Panen
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {actionType === "approve" ? "Setujui laporan panen" : "Tolak laporan panen"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {actionReport.workerName || actionReport.workerId || "-"} · {actionReport.hasilDate || "-"} · {actionReport.weightKg ?? "-"} kg
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={closeActionDialog} disabled={actionLoading}>
                <span className="text-lg leading-none">×</span>
              </Button>
            </div>

            {actionError ? (
              <AlertMessage type="error" className="mb-4">
                {actionError}
              </AlertMessage>
            ) : null}

            <form onSubmit={submitAction} className="space-y-5">
              {actionType === "approve" ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                  Laporan ini akan berubah menjadi <span className="font-semibold">VERIFIED</span> dan diteruskan ke proses payroll.
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Alasan penolakan</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    rows={4}
                    placeholder="Contoh: Foto tidak jelas atau berita panen kurang lengkap"
                    disabled={actionLoading}
                    required
                  />
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={closeActionDialog} disabled={actionLoading}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className={actionType === "approve" ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-rose-600 text-white hover:bg-rose-500"}
                >
                  {actionLoading ? "Memproses..." : actionType === "approve" ? "Konfirmasi Setujui" : "Konfirmasi Tolak"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
