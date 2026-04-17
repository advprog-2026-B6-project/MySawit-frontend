"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Client-side: validasi format kode unik
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/kebun`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Gagal membuat kebun");
                setLoading(false);
                return;
            }

            router.push("/kebun");
        } catch (err) {
            setError("Terjadi kesalahan koneksi ke server");
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
                Buat Kebun Sawit Baru
            </h1>

            {error && (
                <div
                    style={{
                        padding: "0.75rem",
                        backgroundColor: "#fef2f2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        marginBottom: "1rem",
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Nama Kebun */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Nama Kebun</label>
                    <input
                        type="text"
                        name="namaKebun"
                        value={form.namaKebun}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                </div>

                {/* Kode Unik */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Kode Unik (format: XX-0000)</label>
                    <input
                        type="text"
                        name="kodeUnik"
                        value={form.kodeUnik}
                        onChange={handleChange}
                        placeholder="Contoh: KB-0001"
                        required
                        style={inputStyle}
                    />
                </div>

                {/* Koordinat */}
                <h2 style={{ fontSize: "1.2rem", fontWeight: "600", margin: "1.5rem 0 0.75rem" }}>
                    Koordinat (dalam meter)
                </h2>

                {[
                    { label: "Kiri Atas", xName: "kiriAtasX", yName: "kiriAtasY" },
                    { label: "Kanan Atas", xName: "kananAtasX", yName: "kananAtasY" },
                    { label: "Kanan Bawah", xName: "kananBawahX", yName: "kananBawahY" },
                    { label: "Kiri Bawah", xName: "kiriBawahX", yName: "kiriBawahY" },
                ].map(({ label, xName, yName }) => (
                    <div key={label} style={{ ...fieldStyle, display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <label style={{ ...labelStyle, minWidth: "100px" }}>{label}</label>
                        <input
                            type="number"
                            name={xName}
                            value={form[xName]}
                            onChange={handleChange}
                            placeholder="X"
                            step="any"
                            required
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <input
                            type="number"
                            name={yName}
                            value={form[yName]}
                            onChange={handleChange}
                            placeholder="Y"
                            step="any"
                            required
                            style={{ ...inputStyle, flex: 1 }}
                        />
                    </div>
                ))}

                {/* Buttons */}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "0.6rem 1.5rem",
                            backgroundColor: loading ? "#9ca3af" : "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/kebun")}
                        style={{
                            padding: "0.6rem 1.5rem",
                            backgroundColor: "#e5e7eb",
                            color: "#374151",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                        }}
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
}

const fieldStyle = {
    marginBottom: "1rem",
};

const labelStyle = {
    display: "block",
    marginBottom: "0.25rem",
    fontWeight: "500",
};

const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
};