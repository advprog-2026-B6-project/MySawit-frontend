"use client";

import { useCallback, useMemo, useState } from "react";
import { fetchPengirimanDisetujui } from "../lib/api";
import Alert from "./Alert";
import TablePengirimanDisetujui from "./TablePengirimanDisetujui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminTab() {
  const [mandorName, setMandorName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const [pengirimanList, setPengirimanList] = useState([]);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "success" }), 5000);
  };

  const loadPengirimanDisetujui = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchPengirimanDisetujui({
        mandorName: mandorName.trim(),
        tanggalMulai: startDate,
        tanggalSelesai: endDate,
      });

      if (result.success) {
        setPengirimanList(result.data || []);
        showAlert(`Ditemukan ${(result.data || []).length} pengiriman disetujui.`);
      } else {
        showAlert(result.message || "Gagal memuat data pengiriman disetujui", "error");
      }
    } catch (error) {
      showAlert("Gagal memuat data pengiriman: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [mandorName, startDate, endDate]);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (mandorName.trim()) filters.push(`Mandor: ${mandorName.trim()}`);
    if (startDate) filters.push(`Mulai: ${startDate}`);
    if (endDate) filters.push(`Selesai: ${endDate}`);
    return filters;
  }, [mandorName, startDate, endDate]);

  return (
    <div className="space-y-6">
      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Pengiriman Disetujui Mandor</h2>
          <p className="text-sm text-muted-foreground">
            Admin Utama dapat memantau pengiriman yang sudah disetujui Mandor.
          </p>
        </div>

        <div className="grid gap-4 rounded-lg border bg-card/50 p-4 text-card-foreground shadow-sm sm:grid-cols-[minmax(0,240px)_minmax(0,200px)_minmax(0,200px)_auto]">
          <div className="space-y-2">
            <Label htmlFor="filter-mandor">Search Nama Mandor</Label>
            <Input
              id="filter-mandor"
              placeholder="Masukkan nama Mandor"
              value={mandorName}
              onChange={(e) => setMandorName(e.target.value)}
            />
          </div>
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
          <div className="flex items-end gap-2">
            <Button
              type="button"
              onClick={loadPengirimanDisetujui}
              disabled={loading}
            >
              {loading ? "Memuat..." : "Terapkan"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setMandorName("");
                setStartDate("");
                setEndDate("");
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Filter aktif: {activeFilters.join(" · ")}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Total pengiriman disetujui: {pengirimanList.length}
        </div>

        <TablePengirimanDisetujui data={pengirimanList} loading={loading} />
      </section>
    </div>
  );
}
