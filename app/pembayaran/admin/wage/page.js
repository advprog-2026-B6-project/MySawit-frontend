"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, DollarSign, Save, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function WageSettingPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false); // State pelindung route
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
            const payload = JSON.parse(atob(token.split('.')[1]));

            if (payload.role !== "ADMIN") {
                alert("Akses ditolak! Halaman ini khusus Admin.");
                router.push("/");
                return;
            }

            setIsAuthorized(true);

            const fetchWages = async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pembayaran/admin/wages`, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setForm({
                            upahBuruhPerKg: data.upahBuruhPerKg || "",
                            upahSupirPerKg: data.upahSupirPerKg || "",
                            upahMandorPerKg: data.upahMandorPerKg || ""
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        setLoading(true);

        const body = {
            upahBuruhPerKg: parseFloat(form.upahBuruhPerKg),
            upahSupirPerKg: parseFloat(form.upahSupirPerKg),
            upahMandorPerKg: parseFloat(form.upahMandorPerKg)
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pembayaran/admin/wages`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                setMessage({ type: "error", text: "Gagal memperbarui. Pastikan Anda memiliki akses Admin." });
                setLoading(false);
                return;
            }

            setMessage({ type: "success", text: "Variabel upah berhasil diperbarui!" });
        } catch (err) {
            setMessage({ type: "error", text: "Terjadi kesalahan koneksi ke server" });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium">Memverifikasi otorisasi...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 font-sans">
            <div className="max-w-3xl mx-auto w-full">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 group flex items-center gap-3">
                            <span className="p-2 bg-blue-100 rounded-lg text-blue-600 transition-transform group-hover:scale-110">
                                <Settings className="w-7 h-7" />
                            </span>
                            Pengaturan Variabel Upah Master
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Ubah variabel upah per Kg. Nilai ini akan digunakan untuk menghitung payroll.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in duration-300">
                    {message.text && (
                        <div className={`mb-6 flex items-center p-4 rounded-xl border shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
                            message.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-800 border-green-200"
                        }`}>
                            {message.type === "error" ? (
                                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            ) : (
                                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            )}
                            <p className="font-medium text-sm">{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Upah Buruh (per Kg)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    name="upahBuruhPerKg"
                                    value={form.upahBuruhPerKg}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Upah Supir Truk (per Kg)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    name="upahSupirPerKg"
                                    value={form.upahSupirPerKg}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Upah Mandor (per Kg)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    name="upahMandorPerKg"
                                    value={form.upahMandorPerKg}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-2 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : (
                                    <Save className="w-5 h-5 mr-2" />
                                )}
                                {loading ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/")}
                                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2 text-gray-500" />
                                Kembali
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}