"use client";

import { formatDate } from "../lib/api";

export default function TableSupirBertugas({ data, loading }) {
  if (loading) {
    return <div className="loading">Memuat data supir...</div>;
  }

  return (
    <div className="table-container">
      <table data-testid="table-supir-bertugas">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>No. Telepon</th>
            <th>Plat Nomor Truk</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((supir) => (
              <tr key={supir.id}>
                <td>{supir.id}</td>
                <td>{supir.nama}</td>
                <td>{supir.nomorTelepon}</td>
                <td>{supir.platNomorTruk}</td>
                <td className={supir.sedangBertugas ? "bertugas-ya" : "bertugas-tidak"}>
                  {supir.sedangBertugas ? "Bertugas" : "Tidak Bertugas"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Tidak ada supir bertugas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
