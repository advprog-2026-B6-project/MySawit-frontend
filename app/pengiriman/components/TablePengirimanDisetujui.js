"use client";

import { formatDate } from "../lib/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const statusBadge = (status) => {
  const styles = {
    DISETUJUI: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  };

  return styles[status] ?? "bg-muted text-muted-foreground";
};

const buildActionKey = (type, id) => `${type}:${id}`;

const finalApprovalBadge = (approval) => {
  const styles = {
    APPROVED: "bg-emerald-500/10 text-emerald-700",
    PARTIALLY_REJECTED: "bg-amber-500/10 text-amber-700",
    REJECTED: "bg-red-500/10 text-red-700",
  };
  return styles[approval] ?? "bg-muted text-muted-foreground";
};

const formatFinalApproval = (approval) => {
  if (!approval) return null;
  if (approval === "PARTIALLY_REJECTED") return "PARTIALLY REJECTED";
  return approval;
};

function ActionModal({
  open,
  title,
  description,
  submitLabel,
  submitDisabled,
  onClose,
  onSubmit,
  children,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border bg-card p-6 text-card-foreground shadow-xl">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="mt-4 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onSubmit} disabled={submitDisabled}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TablePengirimanDisetujui({
  data,
  loading,
  onApproveFinal,
  onRejectFinal,
  onRejectPartial,
  actionLoadingKey,
  isPrimaryAdmin,
}) {
  const [rejectModal, setRejectModal] = useState({ open: false, assignmentId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [partialModal, setPartialModal] = useState({ open: false, assignmentId: null, muatanKg: 0 });
  const [partialReason, setPartialReason] = useState("");
  const [partialKg, setPartialKg] = useState("");

  const partialKgNumber = Number(partialKg);
  const partialKgInvalid = !partialKgNumber || Number.isNaN(partialKgNumber) || partialKgNumber <= 0;
  const partialKgExceeds = Boolean(partialModal.muatanKg && partialKgNumber > partialModal.muatanKg);
  const partialSubmitDisabled =
    partialKgInvalid ||
    partialKgExceeds ||
    !partialReason.trim() ||
  actionLoadingKey === buildActionKey("partial", partialModal.assignmentId);

  if (loading) {
    return <div className="py-6 text-sm text-muted-foreground">Memuat data pengiriman...</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border" data-testid="table-pengiriman-disetujui">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">ID Pengiriman</th>
            <th className="px-4 py-3 text-left font-semibold">Mandor</th>
            <th className="px-4 py-3 text-left font-semibold">Supir</th>
            <th className="px-4 py-3 text-left font-semibold">Muatan (kg)</th>
            <th className="px-4 py-3 text-left font-semibold">Tujuan</th>
            <th className="px-4 py-3 text-left font-semibold">Waktu Disetujui</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Aksi Admin</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data && data.length > 0 ? (
            data.map((pengiriman) => (
              <tr key={pengiriman.assignmentId ?? pengiriman.pengirimanId} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  {pengiriman.pengirimanId}
                </td>
                <td className="px-4 py-3 font-medium">
                  {pengiriman.mandorName || "-"}
                </td>
                {/* <td className="px-4 py-3">
                  {pengiriman.mandorId ?? "-"}
                </td> */}
                <td className="px-4 py-3">{pengiriman.supirEmail ?? "-"}</td>
                <td className="px-4 py-3">{pengiriman.muatanKg} kg</td>
                <td className="px-4 py-3">{pengiriman.tujuan}</td>
                <td className="px-4 py-3">
                  {formatDate(pengiriman.waktuDisetujui)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(
                      pengiriman.status
                    )}`}
                  >
                    {pengiriman.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const assignmentId = pengiriman.assignmentId;
                    const canAct = assignmentId !== null && assignmentId !== undefined && assignmentId !== "";
                    if (!canAct) {
                      return <span className="text-xs text-muted-foreground">ID assignment tidak tersedia</span>;
                    }
                    const finalApproval = pengiriman.adminFinalApproval;
                    const decisionLocked = Boolean(finalApproval);
                    const approveLoading = actionLoadingKey === buildActionKey("approve", assignmentId);
                    const rejectLoading = actionLoadingKey === buildActionKey("reject", assignmentId);
                    const partialLoading = actionLoadingKey === buildActionKey("partial", assignmentId);

                    return (
                      <div className="flex flex-col gap-2">
                        {decisionLocked ? (
                          <span
                            className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${finalApprovalBadge(
                              finalApproval
                            )}`}
                          >
                            {formatFinalApproval(finalApproval)}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="xs"
                              onClick={() => onApproveFinal?.(assignmentId)}
                              disabled={approveLoading}
                            >
                              {approveLoading ? "Memproses..." : "Setujui Akhir"}
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                setRejectModal({ open: true, assignmentId });
                                setRejectReason("");
                              }}
                              disabled={rejectLoading}
                            >
                              {rejectLoading ? "Memproses..." : "Tolak"}
                            </Button>
                            {isPrimaryAdmin && assignmentId ? (
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => {
                                  setPartialModal({
                                    open: true,
                                    assignmentId,
                                    muatanKg: pengiriman.muatanKg,
                                  });
                                  setPartialKg("");
                                  setPartialReason("");
                                }}
                                disabled={partialLoading}
                              >
                                {partialLoading ? "Memproses..." : "Tolak Parsial"}
                              </Button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada pengiriman yang disetujui.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <ActionModal
        open={rejectModal.open}
        title="Tolak Pengiriman"
        description="Tuliskan alasan penolakan agar mandor dapat menindaklanjuti."
        submitLabel="Kirim Penolakan"
        submitDisabled={!rejectReason.trim() || actionLoadingKey === buildActionKey("reject", rejectModal.assignmentId)}
        onClose={() => {
          setRejectModal({ open: false, assignmentId: null });
          setRejectReason("");
        }}
        onSubmit={() => {
          if (rejectModal.assignmentId) {
            onRejectFinal?.(rejectModal.assignmentId, rejectReason);
          }
          setRejectModal({ open: false, assignmentId: null });
          setRejectReason("");
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="reject-reason">
            Alasan penolakan
          </label>
          <textarea
            id="reject-reason"
            className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Contoh: Terdapat ketidaksesuaian muatan di lapangan"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
          />
        </div>
      </ActionModal>

      <ActionModal
        open={partialModal.open}
        title="Tolak Parsial Pengiriman"
        description="Admin utama dapat menetapkan kilogram yang diakui dan alasan penolakan untuk memproses payroll proporsional."
        submitLabel="Kirim Penolakan Parsial"
        submitDisabled={partialSubmitDisabled}
        onClose={() => {
          setPartialModal({ open: false, assignmentId: null, muatanKg: 0 });
          setPartialKg("");
          setPartialReason("");
        }}
        onSubmit={() => {
          if (partialModal.assignmentId) {
            onRejectPartial?.(partialModal.assignmentId, partialKg, partialReason);
          }
          setPartialModal({ open: false, assignmentId: null, muatanKg: 0 });
          setPartialKg("");
          setPartialReason("");
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="partial-kg">
            Kilogram diakui
          </label>
          <input
            id="partial-kg"
            type="number"
            min="1"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Masukkan kilogram yang diakui"
            value={partialKg}
            onChange={(event) => setPartialKg(event.target.value)}
          />
          {partialModal.muatanKg ? (
            <p className="text-xs text-muted-foreground">Muatan awal: {partialModal.muatanKg} kg</p>
          ) : null}
          {partialKgExceeds ? (
            <p className="text-xs text-amber-600">Kilogram diakui tidak boleh melebihi muatan awal.</p>
          ) : null}
          {partialKgInvalid && partialKg ? (
            <p className="text-xs text-amber-600">Kilogram diakui wajib diisi dan lebih dari 0.</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="partial-reason">
            Alasan penolakan parsial
          </label>
          <textarea
            id="partial-reason"
            className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Contoh: 50 kg rusak saat pengiriman"
            value={partialReason}
            onChange={(event) => setPartialReason(event.target.value)}
          />
        </div>
      </ActionModal>
    </div>
  );
}
