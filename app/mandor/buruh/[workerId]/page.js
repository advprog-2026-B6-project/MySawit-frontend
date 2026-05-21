"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function MandorWorkerHistoryPage() {
  const params = useParams();
  const workerId = useMemo(() => {
    if (!params || !params.workerId) {
      return "";
    }
    return decodeURIComponent(params.workerId);
  }, [params]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
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
    if (startDate) {
      params.set("startDate", startDate);
    }
    if (endDate) {
      params.set("endDate", endDate);
    }
    if (status) {
      params.set("status", status);
    }

    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const fetchHistory = async () => {
    if (!workerId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${backendUrl}/hasil-reports/mandor/workers/${encodeURIComponent(workerId)}/history${buildQuery()}`,
        {
          headers: getAuthHeader(),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal mengambil riwayat buruh");
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
    // TODO: Integrasikan role guard dari auth context agar hanya role MANDOR dapat mengakses halaman ini.
  }, [workerId]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchHistory();
  };

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1>Riwayat Panen Buruh Spesifik</h1>
      <p style={{ marginTop: "6px", color: "#555" }}>
        Worker ID: <strong>{workerId || "-"}</strong>
      </p>

      {error ? <p style={{ color: "crimson", marginTop: "8px" }}>{error}</p> : null}

      <form onSubmit={handleFilterSubmit} style={{ marginTop: "16px" }}>
        <div
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            marginBottom: "12px",
          }}
        >
          <div>
            <label htmlFor="startDate">Start date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              style={{ display: "block", width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label htmlFor="endDate">End date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              style={{ display: "block", width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{ display: "block", width: "100%", padding: "8px" }}
            >
              <option value="">Semua</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Memuat..." : "Terapkan Filter"}
        </button>
      </form>

      {loading ? <p style={{ marginTop: "16px" }}>Memuat riwayat...</p> : null}

      {!loading && reports.length === 0 ? (
        <p style={{ marginTop: "16px" }}>Belum ada riwayat panen untuk buruh ini.</p>
      ) : null}

      {!loading && reports.length > 0 ? (
        <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
          {reports.map((report) => (
            <article
              key={report.id}
              style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "12px" }}
            >
              <p>
                <strong>Tanggal:</strong> {report.hasilDate || "-"}
              </p>
              <p>
                <strong>Nama Buruh:</strong> {report.workerName || report.workerId || "-"}
              </p>
              <p>
                <strong>Kilogram:</strong> {report.weightKg ?? "-"}
              </p>
              <p>
                <strong>Status:</strong> {report.status || "-"}
              </p>
              <p>
                <strong>Berita:</strong> {report.news || "-"}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}
