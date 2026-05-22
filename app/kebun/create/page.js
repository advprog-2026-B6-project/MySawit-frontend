"use client";

import { AlertMessage, PageHero, PageShell, SurfaceCard } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import KebunForm from "../_components/KebunForm";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

function authHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CreateKebunPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    namaKebun: "",
    kodeUnik: "",
    kiriAtasX: "",
    kiriAtasY: "",
    kiriBawahX: "",
    kiriBawahY: "",
    kananAtasX: "",
    kananAtasY: "",
    kananBawahX: "",
    kananBawahY: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const kodeRegex = /^[A-Z]{2}-\d{4}$/;
    if (!kodeRegex.test(form.kodeUnik)) {
      setError(
        "Format kode unik tidak valid. Gunakan format: XX-0000 (contoh: KB-0001)",
      );
      setLoading(false);
      return;
    }

    const body = {
      namaKebun: form.namaKebun,
      kodeUnik: form.kodeUnik,
      kiriAtas: { x: parseFloat(form.kiriAtasX), y: parseFloat(form.kiriAtasY) },
      kiriBawah: {
        x: parseFloat(form.kiriBawahX),
        y: parseFloat(form.kiriBawahY),
      },
      kananAtas: {
        x: parseFloat(form.kananAtasX),
        y: parseFloat(form.kananAtasY),
      },
      kananBawah: {
        x: parseFloat(form.kananBawahX),
        y: parseFloat(form.kananBawahY),
      },
    };

    try {
      const res = await fetch(`${API}/kebun`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Gagal membuat kebun");
        setLoading(false);
        return;
      }

      router.push("/kebun");
    } catch {
      setError("Terjadi kesalahan koneksi ke server");
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Manajemen Kebun"
        title="Buat kebun baru"
        description="Tambahkan data kebun baru agar area produksi dapat tercatat dan dipantau secara menyeluruh."
        actions={
          <Button variant="outline" onClick={() => router.push("/kebun")}>
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
        }
      />

      <SurfaceCard className="mx-auto max-w-3xl">
        {error ? (
          <AlertMessage type="error" className="mb-6">
            {error}
          </AlertMessage>
        ) : null}

        <KebunForm
          form={form}
          setForm={setForm}
          isEdit={false}
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/kebun")}
        />
      </SurfaceCard>
    </PageShell>
  );
}
