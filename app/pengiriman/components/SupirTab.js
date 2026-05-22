"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchMySupirAssignments, updateAssignmentStatus } from "../lib/api";
import Alert from "./Alert";
import TablePengirimanSupir from "./TablePengirimanSupir";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SupirTab() {
  const [pengirimanList, setPengirimanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "success" }), 5000);
  };

  const loadPengirimanSupir = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMySupirAssignments();
      if (result.success) {
        setPengirimanList(result.data || []);
      } else {
        showAlert(result.message || "Gagal memuat data pengiriman", "error");
      }
    } catch (error) {
      showAlert("Gagal memuat data pengiriman: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUbahStatus = async (assignmentId, statusBaru) => {
    try {
      const result = await updateAssignmentStatus(assignmentId, statusBaru);
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

  useEffect(() => {
    loadPengirimanSupir();
  }, [loadPengirimanSupir]);

  const filteredPengiriman = pengirimanList.filter((item) => {
    if (!tanggalMulai && !tanggalSelesai) return true;
    if (!item.createdAt) return false;

    const tanggal = new Date(item.createdAt);
    if (Number.isNaN(tanggal.getTime())) return false;

    const year = tanggal.getFullYear();
    const month = String(tanggal.getMonth() + 1).padStart(2, "0");
    const day = String(tanggal.getDate()).padStart(2, "0");
    const itemDate = `${year}-${month}-${day}`;
    if (tanggalMulai && itemDate < tanggalMulai) return false;
    if (tanggalSelesai && itemDate > tanggalSelesai) return false;
    return true;
  });

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
            Data otomatis diambil dari email supir yang sedang login.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
            <Input
              id="tanggalMulai"
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
            <Input
              id="tanggalSelesai"
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={loadPengirimanSupir}
              disabled={loading}
              data-testid="btn-lihat-pengiriman"
            >
              {loading ? "Memuat..." : "Refresh Pengiriman"}
            </Button>
          </div>
        </div>

        <TablePengirimanSupir
          data={filteredPengiriman}
          loading={loading}
          onUbahStatus={handleUbahStatus}
        />
      </section>
    </div>
  );
}
