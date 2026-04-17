"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, MapPin } from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
        kiriAtasX: "", kiriAtasY: "",
        kiriBawahX: "", kiriBawahY: "",
        kananAtasX: "", kananAtasY: "",
        kananBawahX: "", kananBawahY: "",
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
            } catch (err) {
                setError("Gagal memuat data kebun");
            } finally {
                setFetching(false);
            }
        };
        fetchDetail();
    }, [kebunId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const body = {
            namaKebun: form.namaKebun,
            kiriAtas: { x: parseFloat(form.kiriAtasX), y: parseFloat(form.kiriAtasY) },
            kiriBawah: { x: parseFloat(form.kiriBawahX), y: parseFloat(form.kiriBawahY) },
            kananAtas: { x: parseFloat(form.kananAtasX), y: parseFloat(form.kananAtasY) },
            kananBawah: { x: parseFloat(form.kananBawahX), y: parseFloat(form.kananBawahY) },
        };

        try {
            const res = await fetch(`${API}/kebun/${kebunId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const data = await res.json();
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

    const coordFields = [
        { label: "Kiri Atas", xName: "kiriAtasX", yName: "kiriAtasY" },
        { label: "Kanan Atas", xName: "kananAtasX", yName: "kananAtasY" },
        { label: "Kanan Bawah", xName: "kananBawahX", yName: "kananBawahY" },
        { label: "Kiri Bawah", xName: "kiriBawahX", yName: "kiriBawahY" },
    ];

    if (fetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628] flex items-center justify-center">
                <Loader2 className="size-8 text-emerald-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628] text-white">
            <div className="max-w-2xl mx-auto px-6 py-10">
                <button
                    onClick={() => router.push("/kebun")}
                    className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Daftar Kebun
                </button>

                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold tracking-tight">Edit Kebun</h1>
                    <span className="px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                        {kodeUnik}
                    </span>
                </div>
                <p className="text-sm text-white/40 mb-8">Kode unik kebun tidak dapat diubah</p>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Nama Kebun</label>
                        <input
                            type="text"
                            name="namaKebun"
                            value={form.namaKebun}
                            onChange={handleChange}
                            required
                            className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Kode Unik</label>
                        <input
                            type="text"
                            value={kodeUnik}
                            disabled
                            className="w-full h-11 px-4 rounded-lg bg-white/[0.02] border border-white/[0.06] text-sm text-white/30 font-mono cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="size-4 text-emerald-400" />
                            <h2 className="text-sm font-medium text-white/60">Koordinat (dalam meter)</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {coordFields.map(({ label, xName, yName }) => (
                                <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                                    <label className="block text-xs font-medium text-white/40 mb-2.5">{label}</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            name={xName}
                                            value={form[xName]}
                                            onChange={handleChange}
                                            placeholder="X"
                                            step="any"
                                            required
                                            className="flex-1 h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                        <input
                                            type="number"
                                            name={yName}
                                            value={form[yName]}
                                            onChange={handleChange}
                                            placeholder="Y"
                                            step="any"
                                            required
                                            className="flex-1 h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/kebun")}
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white/60 hover:text-white rounded-lg transition-all cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
