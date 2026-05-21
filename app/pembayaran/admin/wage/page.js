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
import { ArrowLeft, DollarSign, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WageSettingPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    upahBuruhPerKg: "",
    upahSupirPerKg: "",
    upahMandorPerKg: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.role !== "ADMIN") {
        alert("Akses ditolak! Halaman ini khusus Admin.");
        router.push("/");
        return;
      }

      setIsAuthorized(true);

      const fetchWages = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/pembayaran/admin/wages`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (res.ok) {
            const data = await res.json();
            setForm({
              upahBuruhPerKg: data.upahBuruhPerKg || "",
              upahSupirPerKg: data.upahSupirPerKg || "",
              upahMandorPerKg: data.upahMandorPerKg || "",
            });
          }
        } catch (err) {
          console.error("Gagal fetch data upah:", err);
        }
      };

      fetchWages();
    } catch (error) {
      console.error("Token tidak valid", error);
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    const body = {
      upahBuruhPerKg: parseFloat(form.upahBuruhPerKg),
      upahSupirPerKg: parseFloat(form.upahSupirPerKg),
      upahMandorPerKg: parseFloat(form.upahMandorPerKg),
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pembayaran/admin/wages`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        setMessage({
          type: "error",
          text: "Gagal memperbarui. Pastikan Anda memiliki akses Admin.",
        });
        setLoading(false);
        return;
      }

      setMessage({
        type: "success",
        text: "Variabel upah berhasil diperbarui!",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan koneksi ke server",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <PageShell>
        <LoadingState label="Memverifikasi otorisasi..." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Pembayaran"
        title="Pengaturan Tarif Upah"
        description="Tetapkan tarif upah per kilogram sebagai dasar perhitungan pembayaran buruh, mandor, dan supir."
        actions={
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
        }
      />

      <SurfaceCard className="mx-auto max-w-3xl">
        <SectionHeader
          eyebrow="Tarif Pembayaran"
          title="Upah per kilogram"
          description="Nilai ini menjadi basis perhitungan untuk buruh, supir truk, dan mandor."
        />

        {message.text ? (
          <AlertMessage
            type={message.type === "error" ? "error" : "success"}
            className="mb-6"
          >
            {message.text}
          </AlertMessage>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <WageInput
            label="Upah Buruh (per Kg)"
            name="upahBuruhPerKg"
            value={form.upahBuruhPerKg}
            onChange={handleChange}
          />
          <WageInput
            label="Upah Supir Truk (per Kg)"
            name="upahSupirPerKg"
            value={form.upahSupirPerKg}
            onChange={handleChange}
          />
          <WageInput
            label="Upah Mandor (per Kg)"
            name="upahMandorPerKg"
            value={form.upahMandorPerKg}
            onChange={handleChange}
          />

          <div className="flex flex-col gap-3 border-t border-green-100 pt-5 sm:flex-row">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="size-4" />
              Kembali
            </Button>
          </div>
        </form>
      </SurfaceCard>
    </PageShell>
  );
}

function WageInput({ label, name, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <DollarSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          id={name}
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          placeholder="0.00"
          step="0.01"
          required
          className="pl-9"
        />
      </div>
    </div>
  );
}
