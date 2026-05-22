"use client";
import { PageHero, PageShell, SurfaceCard } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredToken } from "@/lib/auth";
import { requestJson } from "@/lib/api-client";
import { ArrowLeft, Eye, EyeClosed, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const Page = () => {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [job, setJob] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((showPassword) => !showPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !job ||
      !fullname ||
      !username ||
      !password ||
      (job === "Mandor" && !certificationNumber)
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const payload = { role: job.toUpperCase(), fullname, username, password };

    if (job === "Mandor") {
      payload.certificationNumber = certificationNumber;
    }

    try {
      setIsSubmitting(true);
      await requestJson("/auth/register", {
        method: "POST",
        body: payload,
      });

      toast.success("Registered successfully, please login");
      router.push("/login");
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountTypes = ["Buruh", "Mandor", "Supir"];

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
          eyebrow="Authentication"
          title="Create a clean operational account"
          description="Registration now follows the same request lifecycle, shadcn-based form components, and admin/profile styling language."
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
          }
        />

        <SurfaceCard>
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                Register
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Set up your account
              </h2>
            </div>

            <div className="space-y-2">
              <Label>Select your job</Label>
              <Combobox items={accountTypes} value={job} onValueChange={setJob}>
                <ComboboxInput placeholder="Choose your role" />
                <ComboboxContent>
                  <ComboboxEmpty>No jobs found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {job === "Mandor" ? (
              <div className="space-y-2">
                <Label htmlFor="certification-number">
                  Certification number
                </Label>
                <Input
                  id="certification-number"
                  value={certificationNumber}
                  onChange={(e) => setCertificationNumber(e.target.value)}
                  placeholder="Enter certification number"
                  required
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input
                id="full-name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
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
                  placeholder="Create a password"
                  autoComplete="new-password"
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
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </SurfaceCard>
      </div>
    </PageShell>
  );
};

export default Page;
