"use client";

import {
  AlertMessage,
  EmptyState,
  PageHero,
  PageShell,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, DollarSign, Filter, Loader2 } from "lucide-react";
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

export default function WorkerPayrollPage() {
  const router = useRouter();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });

  const fetchPayrolls = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.status) queryParams.append("status", filters.status);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pembayaran/payroll/me?${queryParams.toString()}`,
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
        setError("Gagal mengambil data payroll Anda. Silakan coba lagi.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server.");
      console.error("Fetch payroll error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const applyFilters = (event) => {
    event.preventDefault();
    fetchPayrolls();
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Pembayaran"
        title="Manajemen Pembayaran"
        description="Pantau status upah berdasarkan data kerja yang telah tercatat dan diverifikasi dalam MySawit."
      />

      <SurfaceCard>
        <SectionHeader
          eyebrow="Filter Pembayaran"
          title="Cari riwayat upah"
          description="Pilih rentang tanggal dan status pembayaran untuk menyaring data."
        />

        {error ? (
          <AlertMessage type="error" className="mb-5">
            {error}
          </AlertMessage>
        ) : null}

        <form
          onSubmit={applyFilters}
          className="grid gap-4 md:grid-cols-[1fr_1fr_220px_auto]"
        >
          <div className="space-y-2">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="startDate"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Tanggal Akhir</Label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="endDate"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status Pembayaran</Label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          <Button type="submit" className="self-end">
            <Filter className="size-4" />
            Terapkan Filter
          </Button>
        </form>
      </SurfaceCard>

      <SurfaceCard className="mt-6">
        <SectionHeader
          eyebrow="Daftar Pembayaran"
          title="Riwayat upah"
          description={`${payrolls.length} data payroll ditemukan.`}
        />

        <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-white">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Memuat data...
            </div>
          ) : payrolls.length === 0 ? (
            <EmptyState
              title="Belum ada riwayat gaji"
              description="Tidak ditemukan data payroll dengan filter tersebut."
              className="m-5"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-100">
                <thead>
                  <tr className="bg-green-50 text-left text-xs font-bold uppercase tracking-wider text-green-900">
                    <th className="px-6 py-4">ID Pembayaran</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Total Upah</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id} className="hover:bg-green-50/60">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                        #{payroll.id}
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
                        <StatusBadge tone={statusTones[payroll.status] || "slate"}>
                          <DollarSign className="size-3" />
                          {payroll.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
