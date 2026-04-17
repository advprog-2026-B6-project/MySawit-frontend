"use client";

import { formatDate } from "../lib/api";

const statusBadge = (status) => {
  const styles = {
    MENUNGGU: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    MEMUAT: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
    MENGIRIM: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    TIBA: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  };

  return styles[status] ?? "bg-muted text-muted-foreground";
};

export default function TablePengirimanBerlangsung({ data, loading }) {
  if (loading) {
    return <div className="py-6 text-sm text-muted-foreground">Memuat data pengiriman...</div>;
  }

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
            <th className="px-4 py-3 text-left font-semibold">Waktu Dibuat</th>
            <th className="px-4 py-3 text-left font-semibold">Waktu Diperbarui</th>
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
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(pengiriman.waktuDibuat)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(pengiriman.waktuDiperbarui)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada pengiriman berlangsung
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
