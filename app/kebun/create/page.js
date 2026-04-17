"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import KebunForm from "../_components/KebunForm";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CreateKebunPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        namaKebun: "",
        kodeUnik: "",
        kiriAtasX: "", kiriAtasY: "",
        kiriBawahX: "", kiriBawahY: "",
        kananAtasX: "", kananAtasY: "",
        kananBawahX: "", kananBawahY: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const kodeRegex = /^[A-Z]{2}-\d{4}$/;
        if (!kodeRegex.test(form.kodeUnik)) {
            setError("Format kode unik tidak valid. Gunakan format: XX-0000 (contoh: KB-0001)");
            setLoading(false);
            return;
        }

        const body = {
            namaKebun: form.namaKebun,
            kodeUnik: form.kodeUnik,
            kiriAtas: { x: parseFloat(form.kiriAtasX), y: parseFloat(form.kiriAtasY) },
            kiriBawah: { x: parseFloat(form.kiriBawahX), y: parseFloat(form.kiriBawahY) },
            kananAtas: { x: parseFloat(form.kananAtasX), y: parseFloat(form.kananAtasY) },
            kananBawah: { x: parseFloat(form.kananBawahX), y: parseFloat(form.kananBawahY) },
        };

        try {
            const res = await fetch(`${API}/kebun`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const data = await res.json();
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
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628] text-white">
            <div className="max-w-2xl mx-auto px-6 py-10">
                <button
                    onClick={() => router.push("/kebun")}
                    className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Daftar Kebun
                </button>

                <h1 className="text-2xl font-bold tracking-tight mb-1">Buat Kebun Baru</h1>
                <p className="text-sm text-white/40 mb-8">Isi data di bawah untuk mendaftarkan kebun sawit baru</p>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <KebunForm 
                    form={form} 
                    setForm={setForm} 
                    isEdit={false} 
                    loading={loading} 
                    onSubmit={handleSubmit} 
                    onCancel={() => router.push("/kebun")} 
                />
            </div>
        </div>
    );
}