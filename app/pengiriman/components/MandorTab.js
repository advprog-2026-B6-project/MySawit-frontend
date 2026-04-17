"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchSupirBertugas,
  fetchAllSupir,
  fetchPengirimanBerlangsung,
  buatPengiriman,
  approvePengiriman,
  rejectPengiriman,
} from "../lib/api";
import Alert from "./Alert";
import TableSupirBertugas from "./TableSupirBertugas";
import TablePengirimanBerlangsung from "./TablePengirimanBerlangsung";
import FormBuatPengiriman from "./FormBuatPengiriman";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MandorTab() {
  const [supirBertugas, setSupirBertugas] = useState([]);
  const [allSupir, setAllSupir] = useState([]);
  const [pengirimanBerlangsung, setPengirimanBerlangsung] = useState([]);
  const [loadingSupir, setLoadingSupir] = useState(false);
  const [loadingPengiriman, setLoadingPengiriman] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(null);
  const [mandorId, setMandorId] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "success" }), 5000);
  };

  const loadSupirBertugas = useCallback(async () => {
    setLoadingSupir(true);
    try {
      const result = await fetchSupirBertugas();
      if (result.success) {
        setSupirBertugas(result.data || []);
      } else {
        showAlert(result.message || "Gagal memuat data supir bertugas", "error");
      }
    } catch (error) {
      showAlert("Gagal memuat data supir: " + error.message, "error");
    } finally {
      setLoadingSupir(false);
    }
  }, []);

  const loadAllSupir = useCallback(async () => {
    try {
      const result = await fetchAllSupir();
      if (result.success) {
        setAllSupir(result.data || []);
      }
    } catch (error) {
      console.error("Gagal memuat data supir:", error);
    }
  }, []);

  const loadPengirimanBerlangsung = useCallback(async () => {
    setLoadingPengiriman(true);
    try {
      const result = await fetchPengirimanBerlangsung();
      if (result.success) {
        setPengirimanBerlangsung(result.data || []);
      } else {
        showAlert(result.message || "Gagal memuat data pengiriman", "error");
      }
    } catch (error) {
      showAlert("Gagal memuat data pengiriman: " + error.message, "error");
    } finally {
      setLoadingPengiriman(false);
    }
  }, []);

  const handleBuatPengiriman = async (data) => {
    setLoadingForm(true);
    try {
      const result = await buatPengiriman(data);
      if (result.success) {
        showAlert("Pengiriman berhasil dibuat!");
        loadSupirBertugas();
        loadPengirimanBerlangsung();
      } else {
        showAlert(result.message || "Gagal membuat pengiriman", "error");
      }
    } catch (error) {
      showAlert("Gagal membuat pengiriman: " + error.message, "error");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleApprove = async (pengirimanId) => {
    if (!mandorId.trim()) {
      showAlert("Masukkan Mandor ID sebelum menyetujui pengiriman", "error");
      return;
    }
    setLoadingApproval(pengirimanId);
    try {
      const result = await approvePengiriman(pengirimanId, Number(mandorId));
      if (result.success) {
        showAlert("Pengiriman berhasil disetujui!");
        loadPengirimanBerlangsung();
      } else {
        showAlert(result.message || "Gagal menyetujui pengiriman", "error");
      }
    } catch (error) {
      showAlert("Gagal menyetujui pengiriman: " + error.message, "error");
    } finally {
      setLoadingApproval(null);
    }
  };

  const handleReject = async (pengirimanId, alasanPenolakan) => {
    if (!mandorId.trim()) {
      showAlert("Masukkan Mandor ID sebelum menolak pengiriman", "error");
      return;
    }
    setLoadingApproval(pengirimanId);
    try {
      const result = await rejectPengiriman(pengirimanId, Number(mandorId), alasanPenolakan);
      if (result.success) {
        showAlert("Pengiriman berhasil ditolak");
        loadPengirimanBerlangsung();
      } else {
        showAlert(result.message || "Gagal menolak pengiriman", "error");
      }
    } catch (error) {
      showAlert("Gagal menolak pengiriman: " + error.message, "error");
    } finally {
      setLoadingApproval(null);
    }
  };

  useEffect(() => {
    loadSupirBertugas();
    loadAllSupir();
    loadPengirimanBerlangsung();
  }, [loadSupirBertugas, loadAllSupir, loadPengirimanBerlangsung]);

  return (
    <div className="space-y-8">
      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Daftar Supir Truk Bertugas</h2>
            <p className="text-sm text-muted-foreground">Pantau supir yang sedang aktif.</p>
          </div>
          <Button
            variant="secondary"
            onClick={loadSupirBertugas}
            data-testid="btn-refresh-supir"
          >
            Refresh
          </Button>
        </div>
        <TableSupirBertugas data={supirBertugas} loading={loadingSupir} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Tugaskan Supir Truk</h2>
          <p className="text-sm text-muted-foreground">Buat pengiriman baru dan atur muatan.</p>
        </div>
        <FormBuatPengiriman
          supirList={allSupir}
          onSubmit={handleBuatPengiriman}
          loading={loadingForm}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Daftar Pengiriman Berlangsung</h2>
            <p className="text-sm text-muted-foreground">Lihat status pengiriman yang aktif.</p>
          </div>
          <Button
            variant="secondary"
            onClick={loadPengirimanBerlangsung}
            data-testid="btn-refresh-pengiriman"
          >
            Refresh
          </Button>
        </div>
        <div className="grid gap-3 rounded-lg border bg-card/50 p-4 text-card-foreground shadow-sm sm:grid-cols-[minmax(0,320px)_1fr]">
          <div className="space-y-2">
            <Label htmlFor="mandorId">Mandor ID</Label>
            <Input
              id="mandorId"
              type="number"
              placeholder="Masukkan Mandor ID"
              value={mandorId}
              onChange={(e) => setMandorId(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground sm:pt-8">
            Mandor ID diperlukan untuk menyetujui atau menolak hasil pengiriman yang sudah tiba.
          </div>
        </div>
        <TablePengirimanBerlangsung
          data={pengirimanBerlangsung}
          loading={loadingPengiriman}
          mandorId={mandorId}
          onApprove={handleApprove}
          onReject={handleReject}
          loadingApprovalId={loadingApproval}
        />
      </section>
    </div>
  );
}
