"use client";

import { formatDate } from "../lib/api";

export default function TablePengirimanSupir({ data, loading, onUbahStatus, supirId }) {
  if (loading) {
    return <div className="loading">Memuat data pengiriman...</div>;
  }

  const getStatusButtons = (pengiriman) => {
    const buttons = [];

    if (pengiriman.status === "MENUNGGU" || pengiriman.status === "MEMUAT") {
      if (pengiriman.status !== "MEMUAT") {
        buttons.push(
          <button
            key="memuat"
            className="btn btn-status btn-memuat"
            onClick={() => onUbahStatus(pengiriman.id, supirId, "MEMUAT")}
            data-testid={`btn-memuat-${pengiriman.id}`}
          >
            Memuat
          </button>
        );
      }
      buttons.push(
        <button
          key="mengirim"
          className="btn btn-status btn-mengirim"
          onClick={() => onUbahStatus(pengiriman.id, supirId, "MENGIRIM")}
          data-testid={`btn-mengirim-${pengiriman.id}`}
        >
          Mengirim
        </button>
      );
    }

    if (pengiriman.status === "MENGIRIM") {
      buttons.push(
        <button
          key="tiba"
          className="btn btn-status btn-tiba"
          onClick={() => onUbahStatus(pengiriman.id, supirId, "TIBA")}
          data-testid={`btn-tiba-${pengiriman.id}`}
        >
          Tiba
        </button>
      );
    }

    if (pengiriman.status === "TIBA") {
      return <span style={{ color: "#4caf50", fontWeight: "bold" }}>Selesai</span>;
    }

    return buttons.length > 0 ? buttons : "-";
  };

  return (
    <div className="table-container">
      <table data-testid="table-pengiriman-supir">
        <thead>
          <tr>
            <th>ID Pengiriman</th>
            <th>Muatan (kg)</th>
            <th>Tujuan</th>
            <th>Status</th>
            <th>Waktu Dibuat</th>
            <th>Ubah Status</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((pengiriman) => (
              <tr key={pengiriman.id}>
                <td>{pengiriman.id}</td>
                <td>{pengiriman.muatanKg} kg</td>
                <td>{pengiriman.tujuan}</td>
                <td>
                  <span className={`status-badge status-${pengiriman.status}`}>
                    {pengiriman.status}
                  </span>
                </td>
                <td>{formatDate(pengiriman.waktuDibuat)}</td>
                <td>{getStatusButtons(pengiriman)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Tidak ada pengiriman ditemukan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
