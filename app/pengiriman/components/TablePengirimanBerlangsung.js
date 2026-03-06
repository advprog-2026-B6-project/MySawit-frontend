"use client";

import { formatDate } from "../lib/api";

export default function TablePengirimanBerlangsung({ data, loading }) {
  if (loading) {
    return <div className="loading">Memuat data pengiriman...</div>;
  }

  return (
    <div className="table-container">
      <table data-testid="table-pengiriman-berlangsung">
        <thead>
          <tr>
            <th>ID</th>
            <th>Supir Truk ID</th>
            <th>Muatan (kg)</th>
            <th>Tujuan</th>
            <th>Status</th>
            <th>Waktu Dibuat</th>
            <th>Waktu Diperbarui</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((pengiriman) => (
              <tr key={pengiriman.id}>
                <td>{pengiriman.id}</td>
                <td>{pengiriman.supirTrukId}</td>
                <td>{pengiriman.muatanKg} kg</td>
                <td>{pengiriman.tujuan}</td>
                <td>
                  <span className={`status-badge status-${pengiriman.status}`}>
                    {pengiriman.status}
                  </span>
                </td>
                <td>{formatDate(pengiriman.waktuDibuat)}</td>
                <td>{formatDate(pengiriman.waktuDiperbarui)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                Tidak ada pengiriman berlangsung
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
