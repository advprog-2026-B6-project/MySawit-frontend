"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Alert from "../../components/Alert";
import TablePengirimanSupirReadonly from "../../components/TablePengirimanSupirReadonly";
import { fetchMandorSupirProfileByEmail } from "../../lib/api";

export default function SupirProfileByEmailPage() {
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email || "");
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (!decodedEmail) return;
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchMandorSupirProfileByEmail(decodedEmail);
        if (!active) return;

        if (result?.success) {
          setProfile(result.data);
          setAssignments(result.data?.assignments || []);
        } else {
          setAlert({
            message: result?.message || "Profil supir tidak ditemukan",
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
  }, [decodedEmail]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Profil Supir Truk</p>
            <h1 className="text-2xl font-semibold">{profile?.username ?? "Detail Supir"}</h1>
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
          <h2 className="text-lg font-semibold">Informasi Akun Supir</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Username</p>
              <p className="text-sm font-medium">{profile?.username ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{profile?.email ?? "-"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Assignment Pengiriman</h2>
              <p className="text-sm text-muted-foreground">
                Daftar assignment pengiriman supir ini.
              </p>
            </div>
            {loading && <span className="text-xs text-muted-foreground">Memuat...</span>}
          </div>
          <div className="mt-4">
            <TablePengirimanSupirReadonly data={assignments} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
