"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import KebunForm from "../../_components/KebunForm";

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

                <KebunForm 
                    form={form} 
                    setForm={setForm} 
                    kodeUnik={kodeUnik} 
                    isEdit={true} 
                    loading={loading} 
                    onSubmit={handleSubmit} 
                    onCancel={() => router.push("/kebun")} 
                />
            </div>
        </div>
    );
}
