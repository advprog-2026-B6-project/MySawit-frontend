"use client";

import {
  AlertMessage,
  LoadingState,
  PageHero,
  PageShell,
  SectionHeader,
  SurfaceCard,
} from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

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
    return (
      <PageShell>
        <LoadingState label="Memuat status form panen..." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Pelaporan Panen"
        title="Manajemen Hasil Panen Sawit"
        description="Laporkan hasil panen harian, kondisi lapangan, dan bukti foto agar data produksi tercatat akurat."
      />

      <SurfaceCard className="mx-auto max-w-3xl">
        <SectionHeader
          eyebrow="Input Harian"
          title="Laporan panen hari ini"
          description="Laporan harian hanya dapat dikirim satu kali setelah data diterima untuk proses verifikasi."
        />

        <div className="space-y-4">
          {message ? <AlertMessage type="success">{message}</AlertMessage> : null}
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="kilogram">Kilogram panen</Label>
            <Input
              id="kilogram"
              type="number"
              min="0.01"
              step="0.01"
              value={kilogram}
              onChange={(event) => setKilogram(event.target.value)}
              disabled={formLocked || submitting}
              required
              placeholder="Contoh: 125.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="news">Berita hasil panen</Label>
            <Textarea
              id="news"
              value={news}
              onChange={(event) => setNews(event.target.value)}
              disabled={formLocked || submitting}
              required
              rows={4}
              placeholder="Ringkas kondisi panen hari ini"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photos">Bukti foto</Label>
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              disabled={formLocked || submitting}
              required
              onChange={(event) =>
                setPhotos(Array.from(event.target.files || []))
              }
              className="pt-1.5"
            />
            <p className="text-xs text-slate-500">
              Bisa unggah lebih dari satu foto.
            </p>
          </div>

          <Button
            type="submit"
            disabled={formLocked || submitting}
            className="w-full"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : formLocked ? (
              <Upload className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {submitting
              ? "Menyimpan..."
              : formLocked
                ? "Laporan hari ini terkunci"
                : "Simpan Hasil Panen"}
          </Button>
        </form>
      </SurfaceCard>
    </PageShell>
  );
}
