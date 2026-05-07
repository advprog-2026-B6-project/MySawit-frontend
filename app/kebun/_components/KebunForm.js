"use client";

import { MapPin, Save, Loader2 } from "lucide-react";

export default function KebunForm({ form, setForm, kodeUnik, isEdit, loading, onSubmit, onCancel }) {
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const coordFields = [
        { label: "Kiri Atas", xName: "kiriAtasX", yName: "kiriAtasY" },
        { label: "Kanan Atas", xName: "kananAtasX", yName: "kananAtasY" },
        { label: "Kanan Bawah", xName: "kananBawahX", yName: "kananBawahY" },
        { label: "Kiri Bawah", xName: "kiriBawahX", yName: "kiriBawahY" },
    ];

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Nama Kebun</label>
                <input
                    type="text"
                    name="namaKebun"
                    value={form.namaKebun}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Kebun Utara"
                    className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                    {isEdit ? "Kode Unik" : "Kode Unik (format: XX-0000)"}
                </label>
                {isEdit ? (
                    <input
                        type="text"
                        value={kodeUnik}
                        disabled
                        className="w-full h-11 px-4 rounded-lg bg-white/[0.02] border border-white/[0.06] text-sm text-white/30 font-mono cursor-not-allowed"
                    />
                ) : (
                    <input
                        type="text"
                        name="kodeUnik"
                        value={form.kodeUnik || ""}
                        onChange={handleChange}
                        required
                        placeholder="Contoh: KB-0001"
                        className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                )}
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
                    {loading ? "Menyimpan..." : (isEdit ? "Simpan Perubahan" : "Simpan")}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white/60 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}
