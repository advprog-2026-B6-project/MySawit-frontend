"use client";

import {
  AlertMessage,
  LoadingState,
  PageHero,
  PageShell,
  SurfaceCard,
} from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import KebunForm from "../../_components/KebunForm";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

function authHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function EditKebunPage() {
  const router = useRouter();
  const params = useParams();
  const kebunId = params.id;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [kodeUnik, setKodeUnik] = useState("");
  const [form, setForm] = useState({
    namaKebun: "",
    kiriAtasX: "",
    kiriAtasY: "",
    kiriBawahX: "",
    kiriBawahY: "",
    kananAtasX: "",
    kananAtasY: "",
    kananBawahX: "",
    kananBawahY: "",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API}/kebun/detail/${kebunId}`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Kebun tidak ditemukan");
        const data = await res.json();
        setKodeUnik(data.kodeUnik);
        setForm({
          namaKebun: data.namaKebun || "",
          kiriAtasX: data.kiriAtas?.x?.toString() || "",
          kiriAtasY: data.kiriAtas?.y?.toString() || "",
          kiriBawahX: data.kiriBawah?.x?.toString() || "",
          kiriBawahY: data.kiriBawah?.y?.toString() || "",
          kananAtasX: data.kananAtas?.x?.toString() || "",
          kananAtasY: data.kananAtas?.y?.toString() || "",
          kananBawahX: data.kananBawah?.x?.toString() || "",
          kananBawahY: data.kananBawah?.y?.toString() || "",
        });
      } catch {
        setError("Gagal memuat data kebun");
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [kebunId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      namaKebun: form.namaKebun,
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
      const res = await fetch(`${API}/kebun/${kebunId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Gagal mengupdate kebun");
        setLoading(false);
        return;
      }

      router.push("/kebun");
    } catch {
      setError("Terjadi kesalahan koneksi ke server");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <PageShell>
        <LoadingState label="Memuat data kebun..." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Manajemen Kebun"
        title="Edit kebun"
        description="Perbarui informasi lahan dan koordinat kebun tanpa mengubah kode unik yang telah terdaftar."
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
          kodeUnik={kodeUnik}
          isEdit
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/kebun")}
        />
      </SurfaceCard>
    </PageShell>
  );
}
