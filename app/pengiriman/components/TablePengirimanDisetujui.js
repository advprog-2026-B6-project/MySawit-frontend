"use client";

import { formatDate } from "../lib/api";

const statusBadge = (status) => {
  const styles = {
    DISETUJUI: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  };

  return styles[status] ?? "bg-muted text-muted-foreground";
};

export default function TablePengirimanDisetujui({ data, loading }) {
  if (loading) {
    return <div className="py-6 text-sm text-muted-foreground">Memuat data pengiriman...</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border" data-testid="table-pengiriman-disetujui">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">ID Pengiriman</th>
            <th className="px-4 py-3 text-left font-semibold">Mandor</th>
            <th className="px-4 py-3 text-left font-semibold">Mandor ID</th>
            <th className="px-4 py-3 text-left font-semibold">Supir Truk ID</th>
            <th className="px-4 py-3 text-left font-semibold">Muatan (kg)</th>
            <th className="px-4 py-3 text-left font-semibold">Tujuan</th>
            <th className="px-4 py-3 text-left font-semibold">Waktu Disetujui</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data && data.length > 0 ? (
            data.map((pengiriman) => (
              <tr key={pengiriman.pengirimanId} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {pengiriman.pengirimanId}
                </td>
                <td className="px-4 py-3 font-medium">
                  {pengiriman.mandorName || "-"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {pengiriman.mandorId ?? "-"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {pengiriman.supirTrukId ?? "-"}
                </td>
                <td className="px-4 py-3 font-medium">{pengiriman.muatanKg} kg</td>
                <td className="px-4 py-3">{pengiriman.tujuan}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(pengiriman.waktuDisetujui)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(
                      pengiriman.status
                    )}`}
                  >
                    {pengiriman.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada pengiriman yang disetujui.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
