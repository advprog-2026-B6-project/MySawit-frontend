"use client";

import {
  AlertMessage,
  EmptyState,
  LoadingState,
  PageHero,
  PageShell,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle,
  CheckSquare,
  Clock,
  FileText,
  History,
  Loader2,
  Save,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const statusTones = {
  PAID: "green",
  ACCEPTED: "green",
  PENDING: "amber",
  REJECTED: "red",
};

function formatDisplayDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${String(date.getUTCDate()).padStart(2, "0")} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export default function AdminPayrollPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [searchUsername, setSearchUsername] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payrolls, setPayrolls] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [createForm, setCreateForm] = useState({
    username: "",
    startDate: "",
    endDate: "",
    totalKg: "",
  });
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [createMessage, setCreateMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.role !== "ADMIN") {
        alert("Akses ditolak! Halaman ini khusus Admin.");
        router.push("/");
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error("Token tidak valid", error);
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchUsername) {
      setHistoryError("Username harus diisi untuk mencari histori.");
      return;
    }

    setLoadingHistory(true);
    setHistoryError("");
    setPayrolls([]);

    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pembayaran/admin/payroll/user/${searchUsername}?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setPayrolls(Array.isArray(data) ? data : []);
      } else {
        setHistoryError(
          "Gagal mengambil histori payroll. Pastikan username benar dan Anda memiliki akses admin.",
        );
      }
    } catch {
      setHistoryError("Gagal terhubung ke server.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const approveRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pembayaran/admin/payroll/${id}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (approveRes.ok) {
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pembayaran/webhook/payment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payrollId: id, status: "SUCCESS" }),
          },
        );

        setPayrolls(
          payrolls.map((payroll) =>
            payroll.id === id ? { ...payroll, status: "ACCEPTED" } : payroll,
          ),
        );
        alert("Payroll disetujui dan dibayar via Payment Gateway simulasi.");
      } else {
        alert("Gagal menyetujui payroll.");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (event) => {
    event.preventDefault();
    if (!rejectReason) return alert("Alasan penolakan wajib diisi");

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pembayaran/admin/payroll/${selectedPayrollId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectReason }),
        },
      );

      if (res.ok) {
        setPayrolls(
          payrolls.map((payroll) =>
            payroll.id === selectedPayrollId
              ? { ...payroll, status: "REJECTED" }
              : payroll,
          ),
        );
        setRejectModalOpen(false);
        setRejectReason("");
      } else {
        alert("Gagal menolak payroll.");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setLoadingCreate(true);
    setCreateMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const payload = {
        username: createForm.username,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        totalKg: parseFloat(createForm.totalKg),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pembayaran/admin/payroll`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        const data = await res.json();
        setCreateMessage({
          type: "success",
          text: `Payroll berhasil dibuat dengan total: Rp ${data.totalAmount?.toLocaleString("id-ID")}`,
        });
        setCreateForm({ username: "", startDate: "", endDate: "", totalKg: "" });
      } else {
        setCreateMessage({
          type: "error",
          text: "Gagal membuat payroll. Validasi input atau otoritas gagal.",
        });
      }
    } catch {
      setCreateMessage({ type: "error", text: "Gagal terhubung ke server." });
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleCreateChange = (event) => {
    setCreateForm({ ...createForm, [event.target.name]: event.target.value });
  };

  if (!isAuthorized) {
    return (
      <PageShell>
        <LoadingState label="Memverifikasi otorisasi..." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Pembayaran"
        title="Manajemen Payroll Admin"
        description="Kelola perhitungan upah, tinjau histori pembayaran pekerja, dan proses persetujuan payroll."
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-green-100 pb-3">
        <Button
          variant={activeTab === "history" ? "default" : "outline"}
          onClick={() => setActiveTab("history")}
        >
          <History className="size-4" />
          Histori Payroll Pengguna
        </Button>
        <Button
          variant={activeTab === "create" ? "default" : "outline"}
          onClick={() => setActiveTab("create")}
        >
          <Save className="size-4" />
          Buat Payroll Baru
        </Button>
      </div>

      {activeTab === "history" ? (
        <div className="space-y-6">
          <SurfaceCard>
            <SectionHeader
              eyebrow="Histori Payroll"
              title="Cari histori pengguna"
              description="Masukkan username pekerja dan opsional rentang tanggal."
            />
            <form
              onSubmit={handleSearch}
              className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]"
            >
              <FieldWithIcon label="Username" icon={<User className="size-4" />}>
                <Input
                  value={searchUsername}
                  onChange={(event) => setSearchUsername(event.target.value)}
                  placeholder="Masukkan username pekerja"
                  required
                  className="pl-9"
                />
              </FieldWithIcon>

              <FieldWithIcon
                label="Tanggal Mulai"
                icon={<Calendar className="size-4" />}
              >
                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="pl-9"
                />
              </FieldWithIcon>

              <FieldWithIcon
                label="Tanggal Akhir"
                icon={<Calendar className="size-4" />}
              >
                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="pl-9"
                />
              </FieldWithIcon>

              <Button
                type="submit"
                disabled={loadingHistory}
                className="self-end"
              >
                {loadingHistory ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Cari Histori
              </Button>
            </form>
            {historyError ? (
              <AlertMessage type="error" className="mt-5">
                {historyError}
              </AlertMessage>
            ) : null}
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader
              eyebrow="Daftar Payroll"
              title="Hasil pencarian"
              description={`${payrolls.length} data payroll ditemukan.`}
            />

            {loadingHistory ? (
              <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Memuat data...
              </div>
            ) : payrolls.length === 0 ? (
              <EmptyState
                title="Belum ada data untuk pencarian ini"
              description="Masukkan nama pengguna pekerja untuk menampilkan riwayat pembayaran."
              />
            ) : (
              <div className="overflow-hidden rounded-3xl border border-green-100 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-green-100">
                    <thead>
                      <tr className="bg-green-50 text-left text-xs font-bold uppercase tracking-wider text-green-900">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Total Upah</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {payrolls.map((payroll) => (
                        <tr key={payroll.id} className="hover:bg-green-50/60">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                            #{payroll.id.toString().substring(0, 8)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                            {payroll.username}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                            {formatDisplayDate(payroll.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                            Rp{" "}
                            {(payroll.totalWage ?? 0).toLocaleString("id-ID", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <StatusBadge
                              tone={statusTones[payroll.status] || "slate"}
                            >
                              {payroll.status === "REJECTED" ? (
                                <XCircle className="size-3" />
                              ) : payroll.status === "PENDING" ? (
                                <Clock className="size-3" />
                              ) : (
                                <CheckCircle className="size-3" />
                              )}
                              {payroll.status}
                            </StatusBadge>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            {payroll.status === "PENDING" ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(payroll.id)}
                                  disabled={actionLoading}
                                >
                                  <CheckSquare className="size-4" />
                                  Setujui
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPayrollId(payroll.id);
                                    setRejectModalOpen(true);
                                  }}
                                  disabled={actionLoading}
                                >
                                  <XCircle className="size-4" />
                                  Tolak
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SurfaceCard>
        </div>
      ) : (
        <SurfaceCard className="max-w-3xl">
          <SectionHeader
            eyebrow="Pembuatan Payroll"
            title="Formulir Pembuatan Payroll"
            description="Buat draft payroll berdasarkan nama pengguna, periode kerja, dan total kilogram yang diproses."
          />

          {createMessage.text ? (
            <AlertMessage
              type={createMessage.type === "success" ? "success" : "error"}
              className="mb-6"
            >
              {createMessage.text}
            </AlertMessage>
          ) : null}

          <form onSubmit={handleCreateSubmit} className="space-y-5">
            <FieldWithIcon label="Username Pekerja" icon={<User className="size-4" />}>
              <Input
                name="username"
                value={createForm.username}
                onChange={handleCreateChange}
                className="pl-9"
                required
              />
            </FieldWithIcon>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldWithIcon
                label="Tanggal Mulai (Basis Hitung)"
                icon={<Calendar className="size-4" />}
              >
                <Input
                  type="date"
                  name="startDate"
                  value={createForm.startDate}
                  onChange={handleCreateChange}
                  className="pl-9"
                  required
                />
              </FieldWithIcon>
              <FieldWithIcon
                label="Tanggal Akhir"
                icon={<Calendar className="size-4" />}
              >
                <Input
                  type="date"
                  name="endDate"
                  value={createForm.endDate}
                  onChange={handleCreateChange}
                  className="pl-9"
                  required
                />
              </FieldWithIcon>
            </div>

            <FieldWithIcon
              label="Total Massa Dipanen/Diolah (Kg)"
              icon={<FileText className="size-4" />}
            >
              <Input
                type="number"
                step="0.01"
                name="totalKg"
                value={createForm.totalKg}
                onChange={handleCreateChange}
                placeholder="Contoh: 1500.5"
                className="pl-9"
                required
              />
            </FieldWithIcon>

            <Button type="submit" disabled={loadingCreate} className="w-full">
              {loadingCreate ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {loadingCreate ? "Memproses..." : "Buat & Hitung Payroll (Draft)"}
            </Button>

            <AlertMessage type="info">
              Setiap payroll yang dibuat otomatis berstatus{" "}
              <strong>PENDING (Draft)</strong>. Total kg dikalikan tarif per kg,
              lalu dikalikan 90% sebagai upah bersih.
            </AlertMessage>
          </form>
        </SurfaceCard>
      )}

      {rejectModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-900">Tolak Payroll</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRejectModalOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Alasan Penolakan</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  rows={4}
                  required
                  placeholder="Berikan alasan spesifik..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Konfirmasi Tolak
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

function FieldWithIcon({ label, icon, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}
