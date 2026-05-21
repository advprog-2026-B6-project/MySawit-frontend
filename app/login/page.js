"use client";
import { PageHero, PageShell, SurfaceCard } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearStoredToken, parseRoleFromToken } from "@/lib/auth";
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
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((showPassword) => !showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await requestJson("/auth/login", {
        method: "POST",
        body: { username, password },
      });

      if (!data.token) {
        toast.error("Invalid server response");
        return;
      }

      localStorage.setItem("token", data.token);

      const role = parseRoleFromToken(data.token);
      toast.success("Login successful");
      router.push(role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    clearStoredToken();
  }, []);

  return (
    <PageShell className="flex items-center">
      <div className="mx-auto w-full max-w-2xl">
        <PageHero
          eyebrow="Authentication"
          title="Sign in to continue your workflow"
          description="Use the same admin-style interface and consistent request handling across authentication and dashboard pages."
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
          }
        />

        <SurfaceCard>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                Login
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Welcome back
              </h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-3">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-green-700 hover:text-green-800"
              >
                Register here
              </Link>
            </p>
          </form>
        </SurfaceCard>
      </div>
    </PageShell>
  );
};

export default Page;
