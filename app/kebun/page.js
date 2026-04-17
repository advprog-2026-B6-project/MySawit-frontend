"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Eye, Pencil, Trash2, TreePalm, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function KebunListPage() {
  const [kebunList, setKebunList] = useState([]);
  const [searchNama, setSearchNama] = useState("");
  const [searchKode, setSearchKode] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  const fetchKebun = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchNama) params.append("nama", searchNama);
      if (searchKode) params.append("kode", searchKode);
      const res = await fetch(`${API}/kebun?${params.toString()}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setKebunList(data);
    } catch (err) {
      console.error("Gagal fetch kebun:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKebun();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
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
        const data = await res.json();
        alert(data.error || "Gagal menghapus kebun");
      } else {
        fetchKebun();
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <TreePalm className="size-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Manajemen Kebun</h1>
              <p className="text-xs text-white/40">BurhanSawit — MySawit Platform</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/kebun/create")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 cursor-pointer"
          >
            <Plus className="size-4" />
            Tambah Kebun
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <input
              type="text"
              placeholder="Cari nama kebun..."
              value={searchNama}
              onChange={(e) => setSearchNama(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <input
              type="text"
              placeholder="Cari kode kebun..."
              value={searchKode}
              onChange={(e) => setSearchKode(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-6 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-all cursor-pointer"
          >
            Cari
          </button>
        </form>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="size-8 text-emerald-400 animate-spin" />
          </div>
        ) : kebunList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-white/30">
            <TreePalm className="size-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Tidak ada kebun ditemukan</p>
            <p className="text-sm mt-1">Mulai dengan menambahkan kebun baru</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {kebunList.map((kebun) => (
              <div
                key={kebun.id}
                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 rounded-xl p-5 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                        {kebun.namaKebun}
                      </h3>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                        {kebun.kodeUnik}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-white/40">
                      <span>
                        Luas: <span className="text-white/60 font-medium">{kebun.luasHektare?.toFixed(2)} ha</span>
                      </span>
                      <span className="text-white/10">|</span>
                      <span className="font-mono text-xs">
                        ({kebun.kiriAtas?.x},{kebun.kiriAtas?.y}) → ({kebun.kananBawah?.x},{kebun.kananBawah?.y})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => router.push(`/kebun/detail/${kebun.id}`)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-blue-400 transition-all cursor-pointer"
                      title="Lihat Detail"
                    >
                      <Eye className="size-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/kebun/edit/${kebun.id}`)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-amber-400 transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(kebun.id, kebun.namaKebun)}
                      disabled={deleting === kebun.id}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all cursor-pointer disabled:opacity-50"
                      title="Hapus"
                    >
                      {deleting === kebun.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {!loading && kebunList.length > 0 && (
          <div className="mt-6 text-center text-xs text-white/20">
            Menampilkan {kebunList.length} kebun
          </div>
        )}
      </div>
    </div>
  );
}