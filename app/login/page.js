"use client";
import { PageHero, PageShell, SurfaceCard } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredToken } from "@/lib/auth";
import { requestJson } from "@/lib/api-client";
import { ArrowLeft, Eye, EyeClosed, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((showPassword) => !showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Nama pengguna dan kata sandi wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await requestJson("/auth/login", {
        method: "POST",
        body: { username, password },
      });

      if (!data.token) {
        toast.error("Respons server tidak memuat token akses.");
        return;
      }

      localStorage.setItem("token", data.token);

      toast.success("Berhasil masuk ke MySawit.");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Gagal masuk. Periksa kembali kredensial Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (getStoredToken()) {
      router.replace("/");
      return;
    }

    setIsCheckingSession(false);
  }, [router]);

  return (
    <PageShell className="flex items-center">
      <div className="mx-auto w-full max-w-2xl">
        <PageHero
          eyebrow="Akses Pengguna"
          title="Masuk ke MySawit"
          description="Gunakan akun resmi BurhanSawit untuk mengakses data operasional sesuai peran dan tanggung jawab Anda."
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
              Kembali
            </Button>
          }
        />

        <SurfaceCard>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                Masuk
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Selamat datang kembali
              </h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nama pengguna</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan nama pengguna"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Kata sandi</Label>
              <div className="flex gap-3">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  required
                />
                <Button
                  onClick={togglePasswordVisibility}
                  type="button"
                  variant="outline"
                  size="icon"
                >
                  {showPassword ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeClosed className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              className="w-full"
              type="submit"
              disabled={isSubmitting || isCheckingSession}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Memproses akses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Belum memiliki akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-green-700 hover:text-green-800"
              >
                Daftar di sini
              </Link>
            </p>
          </form>
        </SurfaceCard>
      </div>
    </PageShell>
  );
};

export default Page;
