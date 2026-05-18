"use client";

import { useCallback, useEffect, useState } from "react";
import {
  approvePengirimanFinalAdmin,
  fetchApprovedPengirimanAdmin,
  fetchUserByUsername,
  formatDate,
  rejectPengirimanFinalAdmin,
  rejectPengirimanFinalParsialAdmin,
} from "../lib/api";
import Alert from "./Alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminTab() {
  const [adminId, setAdminId] = useState(null);
  const [mandorName, setMandorName] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingApproveId, setLoadingApproveId] = useState(null);
  const [loadingRejectId, setLoadingRejectId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectMode, setRejectMode] = useState("full");
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const [muatanKgDiakui, setMuatanKgDiakui] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "success" }), 5000);
  };

  const startReject = (pengirimanId, mode) => {
    setRejectingId(pengirimanId);
    setRejectMode(mode);
    setAlasanPenolakan("");
    setMuatanKgDiakui("");
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectMode("full");
    setAlasanPenolakan("");
    setMuatanKgDiakui("");
  };

  const resolveAdminId = useCallback(async () => {
    const username = localStorage.getItem("username") || localStorage.getItem("userEmail");
    if (!username) return;
    const user = await fetchUserByUsername(username);
    if (user?.id) setAdminId(user.id);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchApprovedPengirimanAdmin({ mandorName, tanggalMulai, tanggalSelesai });
      if (result.success) {
        setData(result.data || []);
      } else {
        showAlert(result.message || "Gagal memuat data pengiriman", "error");
      }
    } catch (error) {
      showAlert("Gagal memuat data pengiriman: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [mandorName, tanggalMulai, tanggalSelesai]);

  const handleApproveFinal = async (pengirimanId) => {
    if (!adminId) {
      showAlert("Admin ID tidak ditemukan. Silakan login ulang.", "error");
      return;
    }
    setLoadingApproveId(pengirimanId);
    try {
      const result = await approvePengirimanFinalAdmin(pengirimanId, adminId);
      if (result.success) {
        showAlert("Pengiriman final disetujui. Payroll mandor diproses async.");
        loadData();
      } else {
        showAlert(result.message || "Gagal menyetujui pengiriman final", "error");
      }
    } catch (error) {
      showAlert("Gagal menyetujui pengiriman final: " + error.message, "error");
    } finally {
      setLoadingApproveId(null);
    }
  };

  const handleRejectFinal = async (pengirimanId, muatanPengiriman) => {
    if (!adminId) {
      showAlert("Admin ID tidak ditemukan. Silakan login ulang.", "error");
      return;
    }
    if (!alasanPenolakan.trim()) {
      showAlert("Alasan penolakan wajib diisi.", "error");
      return;
    }
    if (rejectMode === "partial") {
      const kg = Number(muatanKgDiakui);
      if (!Number.isFinite(kg) || kg <= 0) {
        showAlert("Kilogram diakui harus lebih dari 0.", "error");
        return;
      }
      if (kg >= Number(muatanPengiriman)) {
        showAlert("Kilogram diakui harus lebih kecil dari muatan pengiriman.", "error");
        return;
      }
    }

    setLoadingRejectId(pengirimanId);
    try {
      const result = rejectMode === "partial"
        ? await rejectPengirimanFinalParsialAdmin(
            pengirimanId,
            adminId,
            Number(muatanKgDiakui),
            alasanPenolakan.trim(),
          )
        : await rejectPengirimanFinalAdmin(pengirimanId, adminId, alasanPenolakan.trim());

      if (result.success) {
        if (rejectMode === "partial") {
          showAlert("Pengiriman ditolak parsial. Payroll mandor proporsional diproses async.");
        } else {
          showAlert("Pengiriman ditolak dengan alasan.");
        }
        cancelReject();
        loadData();
      } else {
        showAlert(result.message || "Gagal menolak pengiriman final", "error");
      }
    } catch (error) {
      showAlert("Gagal menolak pengiriman final: " + error.message, "error");
    } finally {
      setLoadingRejectId(null);
    }
  };

  useEffect(() => {
    resolveAdminId();
    loadData();
  }, [resolveAdminId, loadData]);

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
            Cari berdasarkan nama mandor dan rentang tanggal.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="mandorName">Search Nama Mandor</Label>
            <Input
              id="mandorName"
              value={mandorName}
              onChange={(e) => setMandorName(e.target.value)}
              placeholder="Contoh: Budi"
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

        <Button onClick={loadData} disabled={loading}>
          {loading ? "Memuat..." : "Filter"}
        </Button>
      </section>

      <section>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID Pengiriman</th>
                <th className="px-4 py-3 text-left font-semibold">Nama Mandor</th>
                <th className="px-4 py-3 text-left font-semibold">Muatan (kg)</th>
                <th className="px-4 py-3 text-left font-semibold">Tujuan</th>
                <th className="px-4 py-3 text-left font-semibold">Waktu Disetujui Mandor</th>
                <th className="px-4 py-3 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.pengirimanId} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.pengirimanId}</td>
                    <td className="px-4 py-3">{item.mandorName}</td>
                    <td className="px-4 py-3">{item.muatanKg} kg</td>
                    <td className="px-4 py-3">{item.tujuan}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(item.waktuDisetujui)}</td>
                    <td className="px-4 py-3">
                      {rejectingId === item.pengirimanId ? (
                        <div className="space-y-2">
                          {rejectMode === "partial" && (
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="Kilogram Diakui"
                              value={muatanKgDiakui}
                              onChange={(e) => setMuatanKgDiakui(e.target.value)}
                            />
                          )}
                          <Textarea
                            placeholder="Alasan penolakan"
                            value={alasanPenolakan}
                            onChange={(e) => setAlasanPenolakan(e.target.value)}
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="xs"
                              variant="destructive"
                              onClick={() => handleRejectFinal(item.pengirimanId, item.muatanKg)}
                              disabled={loadingRejectId === item.pengirimanId}
                            >
                              {loadingRejectId === item.pengirimanId ? "Memproses..." : "Kirim Penolakan"}
                            </Button>
                            <Button size="xs" variant="ghost" onClick={cancelReject}>
                              Batal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="xs"
                            onClick={() => handleApproveFinal(item.pengirimanId)}
                            disabled={loadingApproveId === item.pengirimanId}
                          >
                            {loadingApproveId === item.pengirimanId ? "Memproses..." : "Setujui Akhir"}
                          </Button>
                          <Button size="xs" variant="outline" onClick={() => startReject(item.pengirimanId, "full")}>
                            Tolak
                          </Button>
                          <Button size="xs" variant="secondary" onClick={() => startReject(item.pengirimanId, "partial")}>
                            Tolak Parsial
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Tidak ada data pengiriman disetujui mandor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
