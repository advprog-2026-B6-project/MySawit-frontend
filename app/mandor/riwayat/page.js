"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

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
    if (date) {
      params.set("date", date);
    }
    if (workerName) {
      params.set("workerName", workerName);
    }

    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${backendUrl}/hasil-reports/mandor/history${buildQuery()}`,
        {
          headers: getAuthHeader(),
        },
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
    // TODO: role guard dari auth context, only role MANDOR yang bisa access page ini
  }, []);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchHistory();
  };

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <h1>Riwayat Panen Buruh (Mandor)</h1>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <form onSubmit={handleFilterSubmit} style={{ marginTop: "16px" }}>
        <div
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            marginBottom: "12px",
          }}
        >
          <div>
            <label htmlFor="date">Tanggal</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              style={{ display: "block", width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label htmlFor="workerName">Nama Buruh</label>
            <input
              id="workerName"
              type="text"
              value={workerName}
              onChange={(event) => setWorkerName(event.target.value)}
              placeholder="Contoh: Budi"
              style={{ display: "block", width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Memuat..." : "Terapkan Filter"}
        </button>
      </form>

      {loading ? <p style={{ marginTop: "16px" }}>Memuat riwayat panen...</p> : null}

      {!loading && reports.length === 0 ? (
        <p style={{ marginTop: "16px" }}>Tidak ada data riwayat panen untuk filter saat ini.</p>
      ) : null}

      {!loading && reports.length > 0 ? (
        <div style={{ marginTop: "20px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeadCell}>Tanggal</th>
                <th style={tableHeadCell}>Nama Buruh</th>
                <th style={tableHeadCell}>Kilogram</th>
                <th style={tableHeadCell}>Status</th>
                <th style={tableHeadCell}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td style={tableBodyCell}>{report.hasilDate || "-"}</td>
                  <td style={tableBodyCell}>{report.workerName || report.workerId || "-"}</td>
                  <td style={tableBodyCell}>{report.weightKg ?? "-"}</td>
                  <td style={tableBodyCell}>{report.status || "-"}</td>
                  <td style={tableBodyCell}>
                    <Link
                      href={`/mandor/buruh/${encodeURIComponent(report.workerId)}`}
                      style={{ color: "#1f5eff", textDecoration: "underline" }}
                    >
                      Lihat Profil Buruh
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}

const tableHeadCell = {
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  padding: "10px 8px",
};

const tableBodyCell = {
  borderBottom: "1px solid #eee",
  padding: "10px 8px",
};
