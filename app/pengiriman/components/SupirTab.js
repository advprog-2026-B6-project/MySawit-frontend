"use client";

import { useState, useCallback } from "react";
import { fetchPengirimanSupir, ubahStatusPengiriman } from "../lib/api";
import Alert from "./Alert";
import TablePengirimanSupir from "./TablePengirimanSupir";

export default function SupirTab() {
  const [supirId, setSupirId] = useState("");
  const [pengirimanList, setPengirimanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "success" }), 5000);
  };

  const loadPengirimanSupir = useCallback(async () => {
    if (!supirId.trim()) {
      showAlert("Masukkan Supir Truk ID terlebih dahulu!", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchPengirimanSupir(supirId.trim());
      if (result.success) {
        setPengirimanList(result.data || []);
        showAlert(`Ditemukan ${(result.data || []).length} pengiriman`);
      } else {
        showAlert(result.message || "Gagal memuat data pengiriman", "error");
      }
    } catch (error) {
      showAlert("Gagal memuat data pengiriman: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [supirId]);

  const handleUbahStatus = async (pengirimanId, supirTrukId, statusBaru) => {
    try {
      const result = await ubahStatusPengiriman(pengirimanId, {
        supirTrukId,
        statusBaru,
      });
      if (result.success) {
        showAlert(`Status berhasil diubah ke ${statusBaru}`);
        loadPengirimanSupir();
      } else {
        showAlert(result.message || "Gagal mengubah status", "error");
      }
    } catch (error) {
      showAlert("Gagal mengubah status: " + error.message, "error");
    }
  };

  return (
    <div>
      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      <div className="section">
        <h2>Daftar Pengiriman Saya</h2>

        <div className="form-group">
          <label htmlFor="supirIdInput">Masukkan Supir Truk ID:</label>
          <input
            type="text"
            id="supirIdInput"
            placeholder="Masukkan UUID Supir Truk"
            value={supirId}
            onChange={(e) => setSupirId(e.target.value)}
            style={{ maxWidth: "400px", marginBottom: "10px" }}
            data-testid="input-supir-id"
          />
          <div style={{ marginTop: "10px" }}>
            <button
              className="btn"
              onClick={loadPengirimanSupir}
              disabled={loading}
              data-testid="btn-lihat-pengiriman"
            >
              {loading ? "Memuat..." : "Lihat Pengiriman"}
            </button>
          </div>
        </div>

        <TablePengirimanSupir
          data={pengirimanList}
          loading={loading}
          onUbahStatus={handleUbahStatus}
          supirId={supirId}
        />
      </div>
    </div>
  );
}
