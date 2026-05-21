"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft, Loader2, TreePalm, ShieldCheck, Truck,
    UserPlus, ArrowRightLeft, MapPin, Ruler, Hash
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function KebunDetailPage() {
    const router = useRouter();
    const params = useParams();
    const kebunId = params.id;

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchSupir, setSearchSupir] = useState("");

    // Assignment modals
    const [showAssignMandor, setShowAssignMandor] = useState(false);
    const [showReassignMandor, setShowReassignMandor] = useState(false);
    const [showAssignSupir, setShowAssignSupir] = useState(false);
    const [showReassignSupir, setShowReassignSupir] = useState(null);
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignError, setAssignError] = useState("");

    const [mandorIdInput, setMandorIdInput] = useState("");
    const [supirIdInput, setSupirIdInput] = useState("");
    const [toKebunIdInput, setToKebunIdInput] = useState("");

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (searchSupir) p.append("searchSupir", searchSupir);
            const res = await fetch(`${API}/kebun/detail/${kebunId}?${p.toString()}`, {
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error("Kebun tidak ditemukan");
            const data = await res.json();
            setDetail(data);
        } catch (err) {
            setError(err.message || "Gagal memuat detail kebun");
        } finally {
            setLoading(false);
        }
    }, [kebunId, searchSupir]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleSearchSupir = (e) => {
        e.preventDefault();
        fetchDetail();
    };

    const handleAssignMandor = async () => {
        setAssignLoading(true);
        setAssignError("");
        try {
            const res = await fetch(`${API}/kebun/${kebunId}/mandor`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ mandorId: parseInt(mandorIdInput) }),
            });
            if (!res.ok) {
                const data = await res.json();
                setAssignError(data.error || "Gagal menugaskan mandor");
                setAssignLoading(false);
                return;
            }
            setShowAssignMandor(false);
            setMandorIdInput("");
            fetchDetail();
        } catch {
            setAssignError("Kesalahan koneksi");
        } finally {
            setAssignLoading(false);
        }
    };

    const handleReassignMandor = async () => {
        setAssignLoading(true);
        setAssignError("");
        try {
            const res = await fetch(`${API}/kebun/mandor/reassign`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({
                    mandorId: detail.mandor?.id,
                    fromKebunId: kebunId,
                    toKebunId: toKebunIdInput,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setAssignError(data.error || "Gagal memindahkan mandor");
                setAssignLoading(false);
                return;
            }
            setShowReassignMandor(false);
            setToKebunIdInput("");
            fetchDetail();
        } catch {
            setAssignError("Kesalahan koneksi");
        } finally {
            setAssignLoading(false);
        }
    };

    const handleAssignSupir = async () => {
        setAssignLoading(true);
        setAssignError("");
        try {
            const res = await fetch(`${API}/kebun/${kebunId}/supir`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ supirId: parseInt(supirIdInput) }),
            });
            if (!res.ok) {
                const data = await res.json();
                setAssignError(data.error || "Gagal menugaskan supir");
                setAssignLoading(false);
                return;
            }
            setShowAssignSupir(false);
            setSupirIdInput("");
            fetchDetail();
        } catch {
            setAssignError("Kesalahan koneksi");
        } finally {
            setAssignLoading(false);
        }
    };

    const handleReassignSupir = async (supirId) => {
        setAssignLoading(true);
        setAssignError("");
        try {
            const res = await fetch(`${API}/kebun/supir/reassign`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({
                    supirId,
                    fromKebunId: kebunId,
                    toKebunId: toKebunIdInput,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setAssignError(data.error || "Gagal memindahkan supir");
                setAssignLoading(false);
                return;
            }
            setShowReassignSupir(null);
            setToKebunIdInput("");
            fetchDetail();
        } catch {
            setAssignError("Kesalahan koneksi");
        } finally {
            setAssignLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628] flex items-center justify-center">
                <Loader2 className="size-8 text-emerald-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628] text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={() => router.push("/kebun")} className="text-sm text-white/40 hover:text-white/70 cursor-pointer">
                        Kembali ke Daftar Kebun
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628] text-white">
            <div className="max-w-4xl mx-auto px-6 py-10">
                <button
                    onClick={() => router.push("/kebun")}
                    className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Daftar Kebun
                </button>

                {/* Header */}
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight">{detail.namaKebun}</h1>
                            <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                                {detail.kodeUnik}
                            </span>
                        </div>
                        <p className="text-sm text-white/40">Detail & Manajemen Personel Kebun</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <TreePalm className="size-7 text-emerald-400" />
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <InfoCard icon={<Hash className="size-4" />} label="Kode Unik" value={detail.kodeUnik} />
                    <InfoCard icon={<Ruler className="size-4" />} label="Luas" value={`${detail.luasHektare?.toFixed(2)} ha`} />
                    <InfoCard
                        icon={<MapPin className="size-4" />}
                        label="Area"
                        value={`(${detail.kiriAtas?.x},${detail.kiriAtas?.y}) → (${detail.kananBawah?.x},${detail.kananBawah?.y})`}
                        mono
                    />
                </div>

                {/* Mandor Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-amber-400" />
                            <h2 className="text-lg font-semibold">Mandor Pengawas</h2>
                        </div>
                        {!detail.mandor ? (
                            <button
                                onClick={() => { setShowAssignMandor(true); setAssignError(""); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-all cursor-pointer"
                            >
                                <UserPlus className="size-3.5" />
                                Tugaskan Mandor
                            </button>
                        ) : (
                            <button
                                onClick={() => { setShowReassignMandor(true); setAssignError(""); setToKebunIdInput(""); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                            >
                                <ArrowRightLeft className="size-3.5" />
                                Pindahkan
                            </button>
                        )}
                    </div>

                    {detail.mandor ? (
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                            <div className="flex items-center gap-4">
                                <div className="size-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 font-bold text-lg border border-amber-500/20">
                                    {detail.mandor.fullname?.[0]?.toUpperCase() || "M"}
                                </div>
                                <div>
                                    <p className="font-semibold text-white/90">{detail.mandor.fullname}</p>
                                    <p className="text-xs text-white/40 mt-0.5">
                                        Sertifikasi: <span className="font-mono text-white/60">{detail.mandor.certificationNumber || "-"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-8 text-center text-white/20 text-sm">
                            Belum ada mandor yang ditugaskan
                        </div>
                    )}
                </div>

                {/* Supir Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Truck className="size-5 text-blue-400" />
                            <h2 className="text-lg font-semibold">Supir Truk</h2>
                            {detail.supirList?.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                                    {detail.supirList.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => { setShowAssignSupir(true); setAssignError(""); setSupirIdInput(""); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all cursor-pointer"
                        >
                            <UserPlus className="size-3.5" />
                            Tugaskan Supir
                        </button>
                    </div>

                    {detail.supirList?.length > 0 && (
                        <form onSubmit={handleSearchSupir} className="mb-4 flex gap-2">
                            <input
                                type="text"
                                placeholder="Cari nama supir..."
                                value={searchSupir}
                                onChange={(e) => setSearchSupir(e.target.value)}
                                className="flex-1 h-9 pl-3 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                            <button
                                type="submit"
                                className="h-9 px-4 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                            >
                                Cari
                            </button>
                        </form>
                    )}

                    {detail.supirList?.length > 0 ? (
                        <div className="space-y-2">
                            {detail.supirList.map((supir) => (
                                <div
                                    key={supir.id}
                                    className="group flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3.5 hover:bg-white/[0.05] transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 font-semibold text-sm border border-blue-500/20">
                                            {supir.fullname?.[0]?.toUpperCase() || "S"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white/80">{supir.fullname}</p>
                                            <p className="text-xs text-white/30">ID: {supir.id}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setShowReassignSupir(supir.id); setAssignError(""); setToKebunIdInput(""); }}
                                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all cursor-pointer"
                                    >
                                        <ArrowRightLeft className="size-3" />
                                        Pindahkan
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-8 text-center text-white/20 text-sm">
                            Belum ada supir yang ditugaskan
                        </div>
                    )}
                </div>
            </div>

            {/* === MODALS === */}
            {showAssignMandor && (
                <Modal title="Tugaskan Mandor" onClose={() => setShowAssignMandor(false)}>
                    {assignError && <ModalError msg={assignError} />}
                    <label className="block text-xs font-medium text-white/50 mb-2">ID Mandor</label>
                    <input
                        type="number"
                        value={mandorIdInput}
                        onChange={(e) => setMandorIdInput(e.target.value)}
                        placeholder="Masukkan User ID mandor"
                        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all mb-4"
                    />
                    <ModalActions loading={assignLoading} onConfirm={handleAssignMandor} onCancel={() => setShowAssignMandor(false)} confirmLabel="Tugaskan" color="amber" />
                </Modal>
            )}

            {showReassignMandor && (
                <Modal title="Pindahkan Mandor" onClose={() => setShowReassignMandor(false)}>
                    {assignError && <ModalError msg={assignError} />}
                    <p className="text-xs text-white/40 mb-3">
                        Pindahkan <span className="text-white/70 font-medium">{detail.mandor?.fullname}</span> ke kebun lain
                    </p>
                    <label className="block text-xs font-medium text-white/50 mb-2">ID Kebun Tujuan</label>
                    <input
                        type="text"
                        value={toKebunIdInput}
                        onChange={(e) => setToKebunIdInput(e.target.value)}
                        placeholder="Masukkan UUID kebun tujuan"
                        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all mb-4"
                    />
                    <ModalActions loading={assignLoading} onConfirm={handleReassignMandor} onCancel={() => setShowReassignMandor(false)} confirmLabel="Pindahkan" color="amber" />
                </Modal>
            )}

            {showAssignSupir && (
                <Modal title="Tugaskan Supir Truk" onClose={() => setShowAssignSupir(false)}>
                    {assignError && <ModalError msg={assignError} />}
                    <label className="block text-xs font-medium text-white/50 mb-2">ID Supir</label>
                    <input
                        type="number"
                        value={supirIdInput}
                        onChange={(e) => setSupirIdInput(e.target.value)}
                        placeholder="Masukkan User ID supir"
                        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all mb-4"
                    />
                    <ModalActions loading={assignLoading} onConfirm={handleAssignSupir} onCancel={() => setShowAssignSupir(false)} confirmLabel="Tugaskan" color="blue" />
                </Modal>
            )}

            {showReassignSupir !== null && (
                <Modal title="Pindahkan Supir Truk" onClose={() => setShowReassignSupir(null)}>
                    {assignError && <ModalError msg={assignError} />}
                    <label className="block text-xs font-medium text-white/50 mb-2">ID Kebun Tujuan</label>
                    <input
                        type="text"
                        value={toKebunIdInput}
                        onChange={(e) => setToKebunIdInput(e.target.value)}
                        placeholder="Masukkan UUID kebun tujuan"
                        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all mb-4"
                    />
                    <ModalActions loading={assignLoading} onConfirm={() => handleReassignSupir(showReassignSupir)} onCancel={() => setShowReassignSupir(null)} confirmLabel="Pindahkan" color="blue" />
                </Modal>
            )}
        </div>
    );
}

function InfoCard({ icon, label, value, mono = false }) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/30 mb-2">
                {icon}
                <span className="text-xs font-medium">{label}</span>
            </div>
            <p className={`text-sm font-semibold text-white/80 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                {children}
            </div>
        </div>
    );
}

function ModalError({ msg }) {
    return (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">{msg}</div>
    );
}

function ModalActions({ loading, onConfirm, onCancel, confirmLabel, color }) {
    const colorMap = {
        amber: "bg-amber-500 hover:bg-amber-400 shadow-amber-500/20",
        blue: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/20",
    };
    return (
        <div className="flex gap-2">
            <button onClick={onConfirm} disabled={loading} className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-black rounded-lg transition-all shadow-lg disabled:opacity-50 cursor-pointer ${colorMap[color]}`}>
                {loading && <Loader2 className="size-3.5 animate-spin" />}
                {confirmLabel}
            </button>
            <button onClick={onCancel} className="px-5 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg transition-all cursor-pointer">
                Batal
            </button>
        </div>
    );
}
