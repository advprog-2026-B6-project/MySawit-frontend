"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchSupirBertugas,
  fetchAllSupir,
  fetchPengirimanBerlangsung,
  buatPengiriman,
} from "../lib/api";
import Alert from "./Alert";
import TableSupirBertugas from "./TableSupirBertugas";
import TablePengirimanBerlangsung from "./TablePengirimanBerlangsung";
import FormBuatPengiriman from "./FormBuatPengiriman";
import { Button } from "@/components/ui/button";

export default function MandorTab() {
  const [supirBertugas, setSupirBertugas] = useState([]);
  const [allSupir, setAllSupir] = useState([]);
  const [pengirimanBerlangsung, setPengirimanBerlangsung] = useState([]);
  const [loadingSupir, setLoadingSupir] = useState(false);
  const [loadingPengiriman, setLoadingPengiriman] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
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
        <TablePengirimanBerlangsung data={pengirimanBerlangsung} loading={loadingPengiriman} />
      </section>
    </div>
  );
}
