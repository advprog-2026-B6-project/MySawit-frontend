"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function KebunListPage() {
    const [kebunList, setKebunList] = useState([]);
    const [searchNama, setSearchNama] = useState("");
    const [searchKode, setSearchKode] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchKebun = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchNama) params.append("nama", searchNama);
            if (searchKode) params.append("kode", searchKode);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/kebun?${params.toString()}`
            );
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

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
                Daftar Kebun Sawit
            </h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="Cari Nama Kebun..."
                    value={searchNama}
                    onChange={(e) => setSearchNama(e.target.value)}
                    style={{
                        padding: "0.5rem 0.75rem",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        flex: "1",
                        minWidth: "150px",
                    }}
                />
                <input
                    type="text"
                    placeholder="Cari Kode Kebun..."
                    value={searchKode}
                    onChange={(e) => setSearchKode(e.target.value)}
                    style={{
                        padding: "0.5rem 0.75rem",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        flex: "1",
                        minWidth: "150px",
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: "0.5rem 1.25rem",
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Cari
                </button>
            </form>

            {/* Tombol Tambah */}
            <button
                onClick={() => router.push("/kebun/create")}
                style={{
                    padding: "0.5rem 1.25rem",
                    backgroundColor: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginBottom: "1.5rem",
                }}
            >
                + Tambah Kebun Baru
            </button>

            {/* Tabel */}
            {loading ? (
                <p>Memuat data...</p>
            ) : kebunList.length === 0 ? (
                <p>Tidak ada kebun ditemukan.</p>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: "1px solid #ddd",
                    }}
                >
                    <thead>
                        <tr style={{ backgroundColor: "#f3f4f6" }}>
                            <th style={thStyle}>Nama Kebun</th>
                            <th style={thStyle}>Kode Unik</th>
                            <th style={thStyle}>Luas (ha)</th>
                            <th style={thStyle}>Koordinat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kebunList.map((kebun) => (
                            <tr key={kebun.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={tdStyle}>{kebun.namaKebun}</td>
                                <td style={tdStyle}>{kebun.kodeUnik}</td>
                                <td style={tdStyle}>{kebun.luasHektare}</td>
                                <td style={tdStyle}>
                                    ({kebun.kiriAtas?.x}, {kebun.kiriAtas?.y}),{" "}
                                    ({kebun.kananAtas?.x}, {kebun.kananAtas?.y}),{" "}
                                    ({kebun.kananBawah?.x}, {kebun.kananBawah?.y}),{" "}
                                    ({kebun.kiriBawah?.x}, {kebun.kiriBawah?.y})
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const thStyle = {
    padding: "0.75rem",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
};

const tdStyle = {
    padding: "0.75rem",
};