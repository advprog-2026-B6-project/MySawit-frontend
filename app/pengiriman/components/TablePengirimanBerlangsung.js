"use client";

import { useState } from "react";
import { formatDate } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const statusBadge = (status) => {
  const styles = {
    MENUNGGU: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    MEMUAT: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
    MENGIRIM: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    TIBA: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    DISETUJUI: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    DITOLAK: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  };

  return styles[status] ?? "bg-muted text-muted-foreground";
};

export default function TablePengirimanBerlangsung({
  data,
  loading,
  mandorId,
  onApprove,
  onReject,
  loadingApprovalId,
}) {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  if (loading) {
    return <div className="py-6 text-sm text-muted-foreground">Memuat data pengiriman...</div>;
  }

  const handleStartReject = (pengirimanId) => {
    setRejectingId(pengirimanId);
    setRejectReason("");
    setReasonError("");
  };

  const handleCancelReject = () => {
    setRejectingId(null);
    setRejectReason("");
    setReasonError("");
  };

  const handleConfirmReject = (pengirimanId) => {
    if (!rejectReason.trim()) {
      setReasonError("Alasan penolakan wajib diisi.");
      return;
    }
    onReject?.(pengirimanId, rejectReason.trim());
    setRejectingId(null);
    setRejectReason("");
    setReasonError("");
  };

  return (
    <div className="overflow-hidden rounded-lg border" data-testid="table-pengiriman-berlangsung">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">ID</th>
            <th className="px-4 py-3 text-left font-semibold">Supir Truk ID</th>
            <th className="px-4 py-3 text-left font-semibold">Muatan (kg)</th>
            <th className="px-4 py-3 text-left font-semibold">Tujuan</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Alasan Penolakan</th>
            <th className="px-4 py-3 text-left font-semibold">Waktu Dibuat</th>
            <th className="px-4 py-3 text-left font-semibold">Waktu Diperbarui</th>
            <th className="px-4 py-3 text-left font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data && data.length > 0 ? (
            data.map((pengiriman) => (
              <tr key={pengiriman.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-xs text-muted-foreground">{pengiriman.id}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{pengiriman.supirTrukId}</td>
                <td className="px-4 py-3 font-medium">{pengiriman.muatanKg} kg</td>
                <td className="px-4 py-3">{pengiriman.tujuan}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(pengiriman.status)}`}>
                    {pengiriman.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {pengiriman.alasanPenolakan ? pengiriman.alasanPenolakan : "-"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(pengiriman.waktuDibuat)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(pengiriman.waktuDiperbarui)}</td>
                <td className="px-4 py-3">
                  {pengiriman.status === "TIBA" && !rejectingId && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="xs"
                        variant="default"
                        onClick={() => onApprove?.(pengiriman.id)}
                        disabled={!mandorId || loadingApprovalId === pengiriman.id}
                      >
                        {loadingApprovalId === pengiriman.id ? "Memproses..." : "Setujui"}
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleStartReject(pengiriman.id)}
                        disabled={!mandorId || loadingApprovalId === pengiriman.id}
                      >
                        Tolak
                      </Button>
                    </div>
                  )}
                  {pengiriman.status === "TIBA" && rejectingId === pengiriman.id && (
                    <div className="space-y-2">
                      <Textarea
                        value={rejectReason}
                        onChange={(e) => {
                          setRejectReason(e.target.value);
                          setReasonError("");
                        }}
                        placeholder="Masukkan alasan penolakan"
                      />
                      {reasonError && (
                        <p className="text-xs text-rose-500">{reasonError}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => handleConfirmReject(pengiriman.id)}
                          disabled={loadingApprovalId === pengiriman.id}
                        >
                          {loadingApprovalId === pengiriman.id ? "Memproses..." : "Kirim Penolakan"}
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={handleCancelReject}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  )}
                  {pengiriman.status !== "TIBA" && (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada pengiriman berlangsung
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
