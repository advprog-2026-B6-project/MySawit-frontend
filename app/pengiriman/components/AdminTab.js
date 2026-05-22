"use client";

import { useCallback, useEffect, useState } from "react";
import {
  approveAssignmentFinalAdmin,
  fetchCurrentUser,
  fetchApprovedPengirimanAdmin,
  rejectAssignmentFinalAdmin,
  rejectAssignmentFinalParsialAdmin,
} from "../lib/api";
import Alert from "./Alert";
import TablePengirimanDisetujui from "./TablePengirimanDisetujui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "./AdminTab.css";

export default function AdminTab() {
  const [adminId, setAdminId] = useState(null);
  const [mandorName, setMandorName] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingKey, setActionLoadingKey] = useState(null);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "success" }), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchApprovedPengirimanAdmin({
        mandorQuery: mandorName,
        tanggalMulai,
        tanggalSelesai,
      });
      const rows = Array.isArray(result?.data)
        ? result.data.map((item) => ({
            ...item,
            assignmentId: item?.assignmentId ?? item?.id ?? null,
          }))
        : [];
      setData(rows);
      if (result.success === false) {
        showAlert(result.message || "Gagal memuat data pengiriman", "error");
      } else {
        // keep UX parity with SupirTab: render data from 200 response directly
      }
    } catch (error) {
      showAlert("Gagal memuat data pengiriman: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [mandorName, tanggalMulai, tanggalSelesai]);

  const resolveAdminId = useCallback(async () => {
    const me = await fetchCurrentUser();
    if (me?.id) {
      setAdminId(me.id);
    }
    const roleValue = me?.role || me?.roles?.[0] || me?.authority || "";
    const normalizedRole = String(roleValue).toUpperCase();
    const primaryFlag = Boolean(me?.isPrimaryAdmin ?? me?.isSuperAdmin ?? me?.isPrimary);
    setIsPrimaryAdmin(primaryFlag || normalizedRole.includes("ADMIN"));
  }, []);

  const handleApproveFinal = async (assignmentId) => {
    if (!adminId) {
      showAlert("Admin tidak terdeteksi. Silakan login ulang.", "error");
      return;
    }
    setActionLoadingKey(`approve:${assignmentId}`);
    try {
      const result = await approveAssignmentFinalAdmin(assignmentId, adminId);
      if (result.success) {
        showAlert("Hasil pengiriman akhir disetujui. Payroll mandor diproses async.");
        loadData();
      } else {
        showAlert(result.message || "Gagal menyetujui hasil pengiriman akhir", "error");
      }
    } catch (error) {
      showAlert("Gagal menyetujui hasil pengiriman akhir: " + error.message, "error");
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleRejectFinal = async (assignmentId, reason) => {
    if (!adminId) {
      showAlert("Admin tidak terdeteksi. Silakan login ulang.", "error");
      return;
    }
    if (!reason || !reason.trim()) {
      showAlert("Alasan penolakan wajib diisi.", "error");
      return;
    }
    setActionLoadingKey(`reject:${assignmentId}`);
    try {
      const result = await rejectAssignmentFinalAdmin(assignmentId, adminId, reason.trim());
      if (result.success) {
        showAlert("Hasil pengiriman akhir ditolak.");
        loadData();
      } else {
        showAlert(result.message || "Gagal menolak hasil pengiriman akhir", "error");
      }
    } catch (error) {
      showAlert("Gagal menolak hasil pengiriman akhir: " + error.message, "error");
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleRejectPartial = async (assignmentId, muatanKgDiakui, reason) => {
    if (!adminId) {
      showAlert("Admin tidak terdeteksi. Silakan login ulang.", "error");
      return;
    }
    const parsedKg = Number(muatanKgDiakui);
    if (!parsedKg || Number.isNaN(parsedKg) || parsedKg <= 0) {
      showAlert("Kilogram diakui wajib diisi dan lebih dari 0.", "error");
      return;
    }
    if (!reason || !reason.trim()) {
      showAlert("Alasan penolakan wajib diisi.", "error");
      return;
    }
    setActionLoadingKey(`partial:${assignmentId}`);
    try {
      const result = await rejectAssignmentFinalParsialAdmin(
        assignmentId,
        adminId,
        parsedKg,
        reason.trim()
      );
      if (result.success) {
        showAlert("Penolakan parsial dikirim. Payroll mandor diproses proporsional.");
        loadData();
      } else {
        showAlert(result.message || "Gagal menolak parsial", "error");
      }
    } catch (error) {
      showAlert("Gagal menolak parsial: " + error.message, "error");
    } finally {
      setActionLoadingKey(null);
    }
  };

  useEffect(() => {
    resolveAdminId();
    loadData();
  }, [resolveAdminId, loadData]);

  return (
    <div className="admin-tab space-y-6">
      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      <section className="admin-tab__panel space-y-4">
        <div className="admin-tab__heading">
          <h2 className="text-xl font-semibold">Pengiriman Disetujui Mandor</h2>
          <p className="text-sm text-muted-foreground">
            Cari berdasarkan nama atau username mandor dan rentang tanggal.
          </p>
        </div>

        <div className="admin-tab__filters grid gap-3 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="mandorName">Search Nama/Username Mandor</Label>
            <Input
              id="mandorName"
              value={mandorName}
              onChange={(e) => setMandorName(e.target.value)}
              placeholder="Contoh: Budi atau mandor887"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
            <Input id="tanggalMulai" type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
            <Input id="tanggalSelesai" type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} />
          </div>
        </div>

        {/* <Button className="admin-tab__filter-btn" onClick={loadData} disabled={loading}>
          {loading ? "Memuat..." : "Filter"}
        </Button> */}
      </section>

      <section className="admin-tab__table-wrap">
        <TablePengirimanDisetujui
          data={data}
          loading={loading}
          onApproveFinal={handleApproveFinal}
          onRejectFinal={handleRejectFinal}
          onRejectPartial={handleRejectPartial}
          actionLoadingKey={actionLoadingKey}
          isPrimaryAdmin={isPrimaryAdmin}
        />
      </section>
    </div>
  );
}
