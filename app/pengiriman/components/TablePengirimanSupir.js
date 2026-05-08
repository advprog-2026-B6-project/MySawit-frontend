"use client";

import { formatDate } from "../lib/api";
import { Button } from "@/components/ui/button";

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

export default function TablePengirimanSupir({ data, loading, onUbahStatus, supirId }) {
  if (loading) {
    return <div className="py-6 text-sm text-muted-foreground">Memuat data pengiriman...</div>;
  }

  const getStatusButtons = (pengiriman) => {
    if (pengiriman.status === "DISETUJUI") {
      return <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">Disetujui</span>;
    }

    if (pengiriman.status === "DITOLAK") {
      return <span className="text-sm font-semibold text-rose-500 dark:text-rose-300">Ditolak</span>;
    }

    if (pengiriman.status === "TIBA") {
      return <span className="text-sm font-semibold text-muted-foreground">Menunggu Approval</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {pengiriman.status !== "MEMUAT" && (pengiriman.status === "MENUNGGU" || pengiriman.status === "MEMUAT") && (
          <Button
            key="memuat"
            size="xs"
            variant="secondary"
            onClick={() => onUbahStatus(pengiriman.id, supirId, "MEMUAT")}
            data-testid={`btn-memuat-${pengiriman.id}`}
          >
            Memuat
          </Button>
        )}
        {(pengiriman.status === "MENUNGGU" || pengiriman.status === "MEMUAT") && (
          <Button
            key="mengirim"
            size="xs"
            variant="default"
            onClick={() => onUbahStatus(pengiriman.id, supirId, "MENGIRIM")}
            data-testid={`btn-mengirim-${pengiriman.id}`}
          >
            Mengirim
          </Button>
        )}
        {pengiriman.status === "MENGIRIM" && (
          <Button
            key="tiba"
            size="xs"
            variant="outline"
            onClick={() => onUbahStatus(pengiriman.id, supirId, "TIBA")}
            data-testid={`btn-tiba-${pengiriman.id}`}
          >
            Tiba
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border" data-testid="table-pengiriman-supir">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">ID Pengiriman</th>
            <th className="px-4 py-3 text-left font-semibold">Muatan (kg)</th>
            <th className="px-4 py-3 text-left font-semibold">Tujuan</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Alasan Penolakan</th>
            <th className="px-4 py-3 text-left font-semibold">Waktu Dibuat</th>
            <th className="px-4 py-3 text-left font-semibold">Ubah Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data && data.length > 0 ? (
            data.map((pengiriman) => (
              <tr key={pengiriman.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-xs text-muted-foreground">{pengiriman.id}</td>
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
                <td className="px-4 py-3">{getStatusButtons(pengiriman)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada pengiriman ditemukan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
