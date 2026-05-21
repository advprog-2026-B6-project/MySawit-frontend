"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Alert from "../../components/Alert";
import TablePengirimanSupirReadonly from "../../components/TablePengirimanSupirReadonly";
import { fetchPengirimanSupirTruk, fetchSupirById } from "../../lib/api";

export default function SupirProfilePage() {
  const { id } = useParams();
  const [supir, setSupir] = useState(null);
  const [pengiriman, setPengiriman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (!id) return;
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [supirResult, pengirimanResult] = await Promise.all([
          fetchSupirById(id),
          fetchPengirimanSupirTruk(id),
        ]);

        if (!active) return;

        if (supirResult?.success) {
          setSupir(supirResult.data);
        } else {
          setAlert({
            message: supirResult?.message || "Supir tidak ditemukan",
            type: "error",
          });
        }

        if (pengirimanResult?.success) {
          setPengiriman(pengirimanResult.data || []);
        } else if (pengirimanResult?.message) {
          setAlert({
            message: pengirimanResult.message,
            type: "error",
          });
        }
      } catch (error) {
        if (!active) return;
        setAlert({
          message: `Gagal memuat profil supir: ${error.message}`,
          type: "error",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Profil Supir Truk</p>
            <h1 className="text-2xl font-semibold">{supir?.nama ?? "Detail Supir"}</h1>
          </div>
          <Button asChild variant="secondary">
            <Link href="/pengiriman">Kembali ke Pengiriman</Link>
          </Button>
        </div>

        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: "", type: "success" })}
        />

        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold">Informasi Supir</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">ID Supir</p>
              <p className="text-sm font-medium text-muted-foreground">{supir?.id ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Nomor Telepon</p>
              <p className="text-sm font-medium">{supir?.nomorTelepon ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Plat Nomor Truk</p>
              <p className="text-sm font-medium">{supir?.platNomorTruk ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Status Bertugas</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  supir?.sedangBertugas
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {supir?.sedangBertugas ? "Bertugas" : "Tidak Bertugas"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Pengiriman Supir</h2>
              <p className="text-sm text-muted-foreground">
                Daftar pengiriman yang ditugaskan kepada supir ini.
              </p>
            </div>
            {loading && <span className="text-xs text-muted-foreground">Memuat...</span>}
          </div>
          <div className="mt-4">
            <TablePengirimanSupirReadonly data={pengiriman} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
