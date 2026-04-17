"use client";

import { useState, useCallback } from "react";
import { fetchPengirimanSupir, ubahStatusPengiriman } from "../lib/api";
import Alert from "./Alert";
import TablePengirimanSupir from "./TablePengirimanSupir";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="space-y-6">
      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Daftar Pengiriman Saya</h2>
          <p className="text-sm text-muted-foreground">
            Masukkan ID supir untuk melihat pengiriman yang ditugaskan.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full max-w-md space-y-2">
            <Label htmlFor="supirIdInput">Supir Truk ID</Label>
            <Input
              type="text"
              id="supirIdInput"
              placeholder="Masukkan UUID Supir Truk"
              value={supirId}
              onChange={(e) => setSupirId(e.target.value)}
              data-testid="input-supir-id"
            />
          </div>
          <Button
            onClick={loadPengirimanSupir}
            disabled={loading}
            data-testid="btn-lihat-pengiriman"
          >
            {loading ? "Memuat..." : "Lihat Pengiriman"}
          </Button>
        </div>

        <TablePengirimanSupir
          data={pengirimanList}
          loading={loading}
          onUbahStatus={handleUbahStatus}
          supirId={supirId}
        />
      </section>
    </div>
  );
}
