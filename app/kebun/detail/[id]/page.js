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
import {
  ArrowLeft,
  ArrowRightLeft,
  Hash,
  Loader2,
  MapPin,
  Ruler,
  Search,
  ShieldCheck,
  Truck,
  UserPlus,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

function authHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function KebunDetailPage() {
  const router = useRouter();
  const params = useParams();
  const kebunId = params.id;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchSupir, setSearchSupir] = useState("");
  const [showAssignMandor, setShowAssignMandor] = useState(false);
  const [showReassignMandor, setShowReassignMandor] = useState(false);
  const [showAssignSupir, setShowAssignSupir] = useState(false);
  const [showReassignSupir, setShowReassignSupir] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [mandorIdInput, setMandorIdInput] = useState("");
  const [supirIdInput, setSupirIdInput] = useState("");
  const [toKebunIdInput, setToKebunIdInput] = useState("");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchSupir) params.append("searchSupir", searchSupir);
      const res = await fetch(
        `${API}/kebun/detail/${kebunId}?${params.toString()}`,
        { headers: authHeaders() },
      );
      if (!res.ok) throw new Error("Kebun tidak ditemukan");
      const data = await res.json();
      setDetail(data);
      setError("");
    } catch (err) {
      setError(err.message || "Gagal memuat detail kebun");
    } finally {
      setLoading(false);
    }
  }, [kebunId, searchSupir]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleSearchSupir = (event) => {
    event.preventDefault();
    fetchDetail();
  };

  const runAssignment = async ({ endpoint, method, body, onSuccess }) => {
    setAssignLoading(true);
    setAssignError("");
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAssignError(data.error || "Gagal memproses penugasan");
        return;
      }
      onSuccess();
      fetchDetail();
    } catch {
      setAssignError("Kesalahan koneksi");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignMandor = () =>
    runAssignment({
      endpoint: `/kebun/${kebunId}/mandor`,
      method: "POST",
      body: { mandorId: parseInt(mandorIdInput) },
      onSuccess: () => {
        setShowAssignMandor(false);
        setMandorIdInput("");
      },
    });

  const handleReassignMandor = () =>
    runAssignment({
      endpoint: "/kebun/mandor/reassign",
      method: "PUT",
      body: {
        mandorId: detail.mandor?.id,
        fromKebunId: kebunId,
        toKebunId: toKebunIdInput,
      },
      onSuccess: () => {
        setShowReassignMandor(false);
        setToKebunIdInput("");
      },
    });

  const handleAssignSupir = () =>
    runAssignment({
      endpoint: `/kebun/${kebunId}/supir`,
      method: "POST",
      body: { supirId: parseInt(supirIdInput) },
      onSuccess: () => {
        setShowAssignSupir(false);
        setSupirIdInput("");
      },
    });

  const handleReassignSupir = (supirId) =>
    runAssignment({
      endpoint: "/kebun/supir/reassign",
      method: "PUT",
      body: {
        supirId,
        fromKebunId: kebunId,
        toKebunId: toKebunIdInput,
      },
      onSuccess: () => {
        setShowReassignSupir(null);
        setToKebunIdInput("");
      },
    });

  if (loading) {
    return (
      <PageShell>
        <LoadingState label="Memuat detail kebun..." />
      </PageShell>
    );
  }

  if (error || !detail) {
    return (
      <PageShell>
        <EmptyState
          title="Detail kebun tidak ditemukan"
          description={error || "Data kebun tidak dapat dimuat."}
          actions={
            <Button variant="outline" onClick={() => router.push("/kebun")}>
              Kembali ke Daftar Kebun
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Manajemen Kebun"
        title={detail.namaKebun}
        description="Tinjau informasi lahan, mandor pengawas, dan armada supir yang terhubung dengan kebun ini."
        actions={
          <Button variant="outline" onClick={() => router.push("/kebun")}>
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
        }
      />

      <div className="space-y-6">
        <SurfaceCard>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<Hash className="size-4" />}
              label="Kode Unik"
              value={detail.kodeUnik}
            />
            <InfoCard
              icon={<Ruler className="size-4" />}
              label="Luas"
              value={`${detail.luasHektare?.toFixed(2)} ha`}
            />
            <InfoCard
              icon={<MapPin className="size-4" />}
              label="Area"
              value={`(${detail.kiriAtas?.x},${detail.kiriAtas?.y}) to (${detail.kananBawah?.x},${detail.kananBawah?.y})`}
              mono
            />
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader
            eyebrow="Personel Kebun"
            title="Mandor pengawas"
            description="Tetapkan pengawas lapangan yang bertanggung jawab atas koordinasi panen di kebun ini."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {detail.mandor ? (
              <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-amber-200 bg-white text-lg font-bold text-amber-700">
                  {detail.mandor.fullname?.[0]?.toUpperCase() || "M"}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {detail.mandor.fullname}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Sertifikasi:{" "}
                    <span className="font-mono">
                      {detail.mandor.certificationNumber || "-"}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/50 p-5 text-sm text-slate-600">
                Belum ada mandor yang ditugaskan.
              </div>
            )}

            <Button
              variant={detail.mandor ? "outline" : "default"}
              onClick={() => {
                setAssignError("");
                if (detail.mandor) {
                  setShowReassignMandor(true);
                  setToKebunIdInput("");
                } else {
                  setShowAssignMandor(true);
                }
              }}
            >
              {detail.mandor ? (
                <ArrowRightLeft className="size-4" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {detail.mandor ? "Pindahkan" : "Tugaskan Mandor"}
            </Button>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <SectionHeader
              eyebrow="Logistik"
              title="Supir truk"
              description="Kelola armada transportasi yang mendukung pengangkutan komoditas dari kebun ke pabrik."
              className="mb-0"
            />
            <Button
              onClick={() => {
                setShowAssignSupir(true);
                setAssignError("");
                setSupirIdInput("");
              }}
            >
              <UserPlus className="size-4" />
              Tugaskan Supir
            </Button>
          </div>

          {detail.supirList?.length > 0 ? (
            <form
              onSubmit={handleSearchSupir}
              className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari nama supir..."
                  value={searchSupir}
                  onChange={(event) => setSearchSupir(event.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Cari
              </Button>
            </form>
          ) : null}

          <div className="mt-6">
            {detail.supirList?.length > 0 ? (
              <div className="grid gap-3">
                {detail.supirList.map((supir) => (
                  <div
                    key={supir.id}
                    className="flex flex-col gap-4 rounded-2xl border border-green-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 font-semibold text-sky-700">
                        {supir.fullname?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {supir.fullname}
                        </p>
                        <p className="text-xs text-slate-500">ID: {supir.id}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowReassignSupir(supir.id);
                        setAssignError("");
                        setToKebunIdInput("");
                      }}
                    >
                      <ArrowRightLeft className="size-4" />
                      Pindahkan
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum ada supir"
                description="Tugaskan supir truk agar pengiriman dari kebun ini bisa diproses."
              />
            )}
          </div>
        </SurfaceCard>
      </div>

      {showAssignMandor ? (
        <AssignmentModal
          title="Tugaskan Mandor"
          icon={<ShieldCheck className="size-4" />}
          error={assignError}
          loading={assignLoading}
          confirmLabel="Tugaskan"
          onConfirm={handleAssignMandor}
          onClose={() => setShowAssignMandor(false)}
        >
          <Label htmlFor="mandorId">ID Mandor</Label>
          <Input
            id="mandorId"
            type="number"
            value={mandorIdInput}
            onChange={(event) => setMandorIdInput(event.target.value)}
            placeholder="Masukkan User ID mandor"
          />
        </AssignmentModal>
      ) : null}

      {showReassignMandor ? (
        <AssignmentModal
          title="Pindahkan Mandor"
          icon={<ArrowRightLeft className="size-4" />}
          error={assignError}
          loading={assignLoading}
          confirmLabel="Pindahkan"
          onConfirm={handleReassignMandor}
          onClose={() => setShowReassignMandor(false)}
        >
          <p className="text-sm text-slate-600">
            Pindahkan{" "}
            <span className="font-semibold text-slate-900">
              {detail.mandor?.fullname}
            </span>{" "}
            ke kebun lain.
          </p>
          <Label htmlFor="toKebunMandor">ID Kebun Tujuan</Label>
          <Input
            id="toKebunMandor"
            value={toKebunIdInput}
            onChange={(event) => setToKebunIdInput(event.target.value)}
            placeholder="Masukkan UUID kebun tujuan"
            className="font-mono"
          />
        </AssignmentModal>
      ) : null}

      {showAssignSupir ? (
        <AssignmentModal
          title="Tugaskan Supir Truk"
          icon={<Truck className="size-4" />}
          error={assignError}
          loading={assignLoading}
          confirmLabel="Tugaskan"
          onConfirm={handleAssignSupir}
          onClose={() => setShowAssignSupir(false)}
        >
          <Label htmlFor="supirId">ID Supir</Label>
          <Input
            id="supirId"
            type="number"
            value={supirIdInput}
            onChange={(event) => setSupirIdInput(event.target.value)}
            placeholder="Masukkan User ID supir"
          />
        </AssignmentModal>
      ) : null}

      {showReassignSupir !== null ? (
        <AssignmentModal
          title="Pindahkan Supir Truk"
          icon={<ArrowRightLeft className="size-4" />}
          error={assignError}
          loading={assignLoading}
          confirmLabel="Pindahkan"
          onConfirm={() => handleReassignSupir(showReassignSupir)}
          onClose={() => setShowReassignSupir(null)}
        >
          <Label htmlFor="toKebunSupir">ID Kebun Tujuan</Label>
          <Input
            id="toKebunSupir"
            value={toKebunIdInput}
            onChange={(event) => setToKebunIdInput(event.target.value)}
            placeholder="Masukkan UUID kebun tujuan"
            className="font-mono"
          />
        </AssignmentModal>
      ) : null}
    </PageShell>
  );
}

function InfoCard({ icon, label, value, mono = false }) {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50/60 p-4">
      <div className="mb-2 flex items-center gap-2 text-green-700">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <p
        className={`text-sm font-semibold text-slate-900 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function AssignmentModal({
  title,
  icon,
  error,
  loading,
  confirmLabel,
  onConfirm,
  onClose,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
      <div className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusBadge tone="green">{icon}</StatusBadge>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        {error ? (
          <AlertMessage type="error" className="mb-4">
            {error}
          </AlertMessage>
        ) : null}
        <div className="space-y-3">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
