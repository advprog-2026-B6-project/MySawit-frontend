"use client";

import {
  EmptyState,
  LoadingState,
  PageHero,
  PageShell,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  TreePalm,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

function authHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function KebunListPage() {
  const [kebunList, setKebunList] = useState([]);
  const [searchNama, setSearchNama] = useState("");
  const [searchKode, setSearchKode] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchKebun = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchNama) params.append("nama", searchNama);
      if (searchKode) params.append("kode", searchKode);
      const res = await fetch(`${API}/kebun?${params.toString()}`, {
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data kebun");
      }

      const data = await res.json();
      setKebunList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Gagal mengambil data kebun");
      toast.error(err.message || "Gagal mengambil data kebun");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKebun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchKebun();
  };

  const handleDelete = async (id, namaKebun) => {
    if (!confirm(`Yakin ingin menghapus kebun "${namaKebun}"?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/kebun/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menghapus kebun");
      }

      toast.success(`Kebun ${namaKebun} berhasil dihapus.`);
      fetchKebun();
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Manajemen Kebun"
        title="Manajemen Kebun Sawit"
        description="Kelola data lahan secara terpusat, mulai dari kode kebun, luas area, hingga koordinat batas lahan."
        actions={
          <Button onClick={() => router.push("/kebun/create")}>
            <Plus className="size-4" />
            Tambah Kebun
          </Button>
        }
      />

      <SurfaceCard>
        <SectionHeader
          eyebrow="Direktori Kebun"
          title="Daftar kebun"
          description="Gunakan pencarian untuk meninjau kebun berdasarkan nama atau kode unik sebelum melakukan pembaruan data."
        />

        <form
          onSubmit={handleSearch}
          className="grid gap-3 md:grid-cols-[1fr_240px_auto]"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari nama kebun..."
              value={searchNama}
              onChange={(event) => setSearchNama(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari kode kebun..."
              value={searchKode}
              onChange={(event) => setSearchKode(event.target.value)}
              className="pl-9 font-mono"
            />
          </div>
          <Button type="submit" variant="outline">
            Cari
          </Button>
        </form>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <LoadingState label="Memuat daftar kebun..." />
          ) : kebunList.length === 0 ? (
            <EmptyState
              title="Tidak ada kebun ditemukan"
              description="Mulai dengan menambahkan kebun sawit baru."
              actions={
                <Button onClick={() => router.push("/kebun/create")}>
                  <Plus className="size-4" />
                  Tambah Kebun
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4">
              {kebunList.map((kebun) => (
                <div
                  key={kebun.id}
                  className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition hover:border-green-200 hover:bg-green-50/40"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                        <TreePalm className="size-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {kebun.namaKebun}
                          </h3>
                          <StatusBadge tone="green" className="font-mono">
                            {kebun.kodeUnik}
                          </StatusBadge>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          Luas:{" "}
                          <span className="font-semibold text-slate-900">
                            {kebun.luasHektare?.toFixed(2)} ha
                          </span>
                        </p>
                        <p className="mt-1 text-xs font-mono text-slate-500">
                          ({kebun.kiriAtas?.x},{kebun.kiriAtas?.y}) to (
                          {kebun.kananBawah?.x},{kebun.kananBawah?.y})
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/kebun/detail/${kebun.id}`)}
                      >
                        <Eye className="size-4" />
                        Detail
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/kebun/edit/${kebun.id}`)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(kebun.id, kebun.namaKebun)}
                        disabled={deleting === kebun.id}
                      >
                        {deleting === kebun.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && kebunList.length > 0 ? (
          <p className="mt-6 text-center text-xs text-slate-500">
            Menampilkan {kebunList.length} kebun
          </p>
        ) : null}
      </SurfaceCard>
    </PageShell>
  );
}
