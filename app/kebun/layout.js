"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogIn, Loader2 } from "lucide-react";

/**
 * Wraps all /kebun pages. Checks JWT from localStorage,
 * decodes the role, and blocks access if not ADMIN.
 */
export default function KebunLayout({ children }) {
    const router = useRouter();
    const [status, setStatus] = useState("loading"); // loading | authorized | unauthorized | no-token

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setStatus("no-token");
            return;
        }

        try {
            // Decode JWT payload (base64url → JSON)
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.role === "ADMIN") {
                setStatus("authorized");
            } else {
                setStatus("unauthorized");
            }
        } catch {
            setStatus("no-token");
        }
    }, []);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628] flex items-center justify-center">
                <Loader2 className="size-8 text-emerald-400 animate-spin" />
            </div>
        );
    }

    if (status === "no-token") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628] flex items-center justify-center text-white">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="mx-auto mb-6 size-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                        <LogIn className="size-8 text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Silakan Login</h1>
                    <p className="text-white/40 text-sm mb-8">
                        Anda belum login. Silakan login terlebih dahulu untuk mengakses halaman ini.
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-all cursor-pointer"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    if (status === "unauthorized") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628] flex items-center justify-center text-white">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="mx-auto mb-6 size-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                        <ShieldAlert className="size-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
                    <p className="text-white/40 text-sm mb-3">
                        Halaman Manajemen Kebun hanya dapat diakses oleh <span className="text-white/70 font-semibold">Admin Utama</span>.
                    </p>
                    <p className="text-white/30 text-xs mb-8">
                        Akun Anda tidak memiliki izin yang diperlukan. Hubungi Admin Utama jika Anda memerlukan akses.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white/60 hover:text-white rounded-lg transition-all cursor-pointer"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
