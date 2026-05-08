"use client";

import { useMemo, useState, useCallback } from "react";
import { fetchPengirimanSupir, ubahStatusPengiriman } from "../lib/api";
import Alert from "./Alert";
import TablePengirimanSupir from "./TablePengirimanSupir";
import TableRiwayatPengirimanSupir from "./TableRiwayatPengirimanSupir";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SupirTab() {
  const [supirId, setSupirId] = useState("");
  const [pengirimanList, setPengirimanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const historyList = useMemo(() => {
    if (!pengirimanList || pengirimanList.length === 0) return [];

    const historyStatuses = new Set(["TIBA", "DISETUJUI", "DITOLAK"]);
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    return pengirimanList.filter((pengiriman) => {
      if (!historyStatuses.has(pengiriman.status)) return false;
      const rawDate = pengiriman.waktuDiperbarui || pengiriman.waktuDibuat;
      if (!rawDate) return false;
      const dateValue = new Date(rawDate);
      if (start && dateValue < start) return false;
      if (end && dateValue > end) return false;
      return true;
    });
  }, [pengirimanList, startDate, endDate]);

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

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Riwayat Pengiriman Hasil Panen</h2>
          <p className="text-sm text-muted-foreground">
            Filter riwayat berdasarkan tanggal pengiriman selesai.
          </p>
        </div>

        <div className="grid gap-4 rounded-lg border bg-card/50 p-4 text-card-foreground shadow-sm sm:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto]">
          <div className="space-y-2">
            <Label htmlFor="filter-start">Tanggal Mulai</Label>
            <Input
              id="filter-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-end">Tanggal Akhir</Label>
            <Input
              id="filter-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Reset Filter
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Total riwayat: {historyList.length}
        </div>

        <TableRiwayatPengirimanSupir data={historyList} loading={loading} />
      </section>
    </div>
  );
}
