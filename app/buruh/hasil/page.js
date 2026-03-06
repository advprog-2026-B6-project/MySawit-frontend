"use client";

import { useEffect, useState } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function BuruhPanenPage() {
  const [kilogram, setKilogram] = useState("");
  const [news, setNews] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formLocked, setFormLocked] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token login tidak ditemukan. Silakan login kembali.");
    }
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const fetchTodayStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/hasil-reports/me/today`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil status panen hari ini");
        }

        const data = await response.json();
        setFormLocked(Boolean(data.formLocked));
        setMessage(data.message || "");
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil status");
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchTodayStatus();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (formLocked) {
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("kilogram", kilogram);
      formData.append("news", news);

      photos.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch(`${backendUrl}/hasil-reports`, {
        method: "POST",
        headers: getAuthHeader(),
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal menyimpan laporan panen");
      }

      const data = await response.json();
      setFormLocked(Boolean(data.locked));
      setMessage(data.message || "Laporan berhasil disimpan");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return <main style={{ padding: "24px" }}>Memuat status form panen...</main>;
  }

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "24px" }}>
      <h1>Form Pelaporan Hasil Panen</h1>

      {message ? <p style={{ color: "green" }}>{message}</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="kilogram">Kilogram panen</label>
          <input
            id="kilogram"
            type="number"
            min="0.01"
            step="0.01"
            value={kilogram}
            onChange={(event) => setKilogram(event.target.value)}
            disabled={formLocked || submitting}
            required
            style={{ display: "block", width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="news">Berita hasil panen</label>
          <textarea
            id="news"
            value={news}
            onChange={(event) => setNews(event.target.value)}
            disabled={formLocked || submitting}
            required
            rows={4}
            style={{ display: "block", width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="photos">Bukti foto (bisa lebih dari satu)</label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            disabled={formLocked || submitting}
            required
            onChange={(event) => setPhotos(Array.from(event.target.files || []))}
            style={{ display: "block", width: "100%", padding: "8px" }}
          />
        </div>

        <button type="submit" disabled={formLocked || submitting}>
          {submitting ? "Menyimpan..." : "Simpan Hasil Panen"}
        </button>
      </form>
    </main>
  );
}

