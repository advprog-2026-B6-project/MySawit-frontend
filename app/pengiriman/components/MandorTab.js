"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchSupirBertugas,
  fetchAllSupir,
  fetchMyMandorAssignments,
  buatPenugasanPengiriman,
  updateAssignmentApproval,
} from "../lib/api";
import Alert from "./Alert";
import TableSupirBertugas from "./TableSupirBertugas";
import TablePengirimanBerlangsung from "./TablePengirimanBerlangsung";
import FormBuatPengiriman from "./FormBuatPengiriman";
import { Button } from "@/components/ui/button";

export default function MandorTab() {
  const [supirBertugas, setSupirBertugas] = useState([]);
  const [supirList, setSupirList] = useState([]);
  const [assignmentList, setAssignmentList] = useState([]);
  const [loadingSupir, setLoadingSupir] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(null);
  const [mandorEmail, setMandorEmail] = useState("");
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

  const loadSupirList = useCallback(async () => {
    try {
      const result = await fetchAllSupir();
      if (result.success) {
        setSupirList(result.data || []);
      } else {
        showAlert(result.message || "Gagal memuat daftar supir", "error");
      }
    } catch (error) {
      showAlert("Gagal memuat daftar supir: " + error.message, "error");
    }
  }, []);

  const loadAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    try {
      const result = await fetchMyMandorAssignments();
      if (result.success) {
        setAssignmentList(result.data || []);
      } else {
        showAlert(result.message || "Gagal memuat data penugasan", "error");
      }
    } catch (error) {
      showAlert("Gagal memuat data penugasan: " + error.message, "error");
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  const handleBuatPengiriman = async (data) => {
    setLoadingForm(true);
    try {
      const result = await buatPenugasanPengiriman(data);
      if (result.success) {
        showAlert("Penugasan pengiriman berhasil dibuat!");
        loadSupirBertugas();
        loadAssignments();
      } else {
        showAlert(result.message || "Gagal membuat pengiriman", "error");
      }
    } catch (error) {
      showAlert("Gagal membuat pengiriman: " + error.message, "error");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleApprove = async (assignmentId) => {
    setLoadingApproval(assignmentId);
    try {
      const result = await updateAssignmentApproval(assignmentId, "APPROVED");
      if (result.success) {
        showAlert("Penugasan berhasil disetujui!");
        loadAssignments();
      } else {
        showAlert(result.message || "Gagal menyetujui penugasan", "error");
      }
    } catch (error) {
      showAlert("Gagal menyetujui penugasan: " + error.message, "error");
    } finally {
      setLoadingApproval(null);
    }
  };

  const handleReject = async (assignmentId, note) => {
    setLoadingApproval(assignmentId);
    try {
      const result = await updateAssignmentApproval(assignmentId, "REJECTED", note);
      if (result.success) {
        showAlert("Penugasan berhasil ditolak");
        loadAssignments();
      } else {
        showAlert(result.message || "Gagal menolak penugasan", "error");
      }
    } catch (error) {
      showAlert("Gagal menolak penugasan: " + error.message, "error");
    } finally {
      setLoadingApproval(null);
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail") || localStorage.getItem("username");
    if (storedEmail) {
      setMandorEmail(storedEmail);
    }

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const [, payload] = token.split(".");
        if (payload) {
          const parsed = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
          const tokenEmail = parsed.email || parsed.username || parsed.sub;
          if (tokenEmail) {
            setMandorEmail(tokenEmail);
            localStorage.setItem("userEmail", tokenEmail);
          }
        }
      } catch {
        // ignore invalid token payload
      }
    }

    loadSupirBertugas();
    loadSupirList();
    loadAssignments();
  }, [loadSupirBertugas, loadSupirList, loadAssignments]);

  return (
    <div className="space-y-8">
      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      {/* <section className="space-y-4">
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
      </section> */}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Daftar Pengiriman Berlangsung</h2>
            <p className="text-sm text-muted-foreground">Lihat status pengiriman yang aktif.</p>
          </div>
          <Button
            variant="secondary"
            onClick={loadAssignments}
            data-testid="btn-refresh-pengiriman"
          >
            Refresh
          </Button>
        </div>
        <TablePengirimanBerlangsung
          data={assignmentList}
          loading={loadingAssignments}
          onApprove={handleApprove}
          onReject={handleReject}
          loadingApprovalId={loadingApproval}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Tugaskan Supir Truk</h2>
          <p className="text-sm text-muted-foreground">Buat pengiriman baru dan atur muatan.</p>
        </div>
        <FormBuatPengiriman
          supirList={supirList}
          defaultMandorEmail={mandorEmail}
          onSubmit={handleBuatPengiriman}
          loading={loadingForm}
        />
      </section>


    </div>
  );
}
