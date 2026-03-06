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
    <div>
      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      {/* Daftar Supir Truk Bertugas */}
      <div className="section">
        <h2>Daftar Supir Truk Bertugas</h2>
        <button
          className="btn btn-refresh"
          onClick={loadSupirBertugas}
          data-testid="btn-refresh-supir"
        >
          Refresh
        </button>
        <TableSupirBertugas data={supirBertugas} loading={loadingSupir} />
      </div>

      {/* Form Buat Pengiriman */}
      <div className="section">
        <h2>Tugaskan Supir Truk (Buat Pengiriman)</h2>
        <FormBuatPengiriman
          supirList={allSupir}
          onSubmit={handleBuatPengiriman}
          loading={loadingForm}
        />
      </div>

      {/* Daftar Pengiriman Berlangsung */}
      <div className="section">
        <h2>Daftar Pengiriman Berlangsung</h2>
        <button
          className="btn btn-refresh"
          onClick={loadPengirimanBerlangsung}
          data-testid="btn-refresh-pengiriman"
        >
          Refresh
        </button>
        <TablePengirimanBerlangsung data={pengirimanBerlangsung} loading={loadingPengiriman} />
      </div>
    </div>
  );
}
