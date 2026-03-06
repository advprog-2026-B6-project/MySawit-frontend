"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WageSettingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [form, setForm] = useState({
        upahBuruhPerKg: "",
        upahSupirPerKg: "",
        upahMandorPerKg: "",
    });

    useEffect(() => {
        const fetchWages = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/wages`, {
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
    }, []);

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
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/wages`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                setMessage({ type: "error", text: "Gagal memperbarui. Pastikan Anda login sebagai Admin Utama." });
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

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Pengaturan Variabel Upah Master
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                Ubah variabel upah per Kg. Nilai ini akan digunakan untuk menghitung payroll.
            </p>

            {message.text && (
                <div
                    style={{
                        padding: "0.75rem",
                        backgroundColor: message.type === "error" ? "#fef2f2" : "#f0fdf4",
                        color: message.type === "error" ? "#dc2626" : "#16a34a",
                        border: `1px solid ${message.type === "error" ? "#fecaca" : "#bbf7d0"}`,
                        borderRadius: "6px",
                        marginBottom: "1rem",
                    }}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={fieldStyle}>
                    <label style={labelStyle}>Upah Buruh (per Kg)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "500", color: "#374151" }}>$</span>
                        <input
                            type="number"
                            name="upahBuruhPerKg"
                            value={form.upahBuruhPerKg}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            required
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>Upah Supir Truk (per Kg)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "500", color: "#374151" }}>$</span>
                        <input
                            type="number"
                            name="upahSupirPerKg"
                            value={form.upahSupirPerKg}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            required
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>Upah Mandor (per Kg)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "500", color: "#374151" }}>$</span>
                        <input
                            type="number"
                            name="upahMandorPerKg"
                            value={form.upahMandorPerKg}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            required
                            style={inputStyle}
                        />
                    </div>
                </div>

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
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        style={{
                            padding: "0.6rem 1.5rem",
                            backgroundColor: "#e5e7eb",
                            color: "#374151",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                        }}
                    >
                        Kembali
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
    flex: 1,
    padding: "0.5rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
};