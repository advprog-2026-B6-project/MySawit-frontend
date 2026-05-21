"use client";

import { PageHero, PageShell, SurfaceCard } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import {
  clearStoredToken,
  getStoredToken,
  parseRoleFromToken,
} from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const defaultHighlights = [
  "Role-based access for admin, mandor, buruh, and supir.",
  "Manages sawit land records, and plot details.",
  "Record harvest output of Buruh ",
  "Organizes shipment of harvest and delivery status.",
  "Handles wage and payment processing.",
];

export default function Home() {
  const [authRole, setAuthRole] = useState(() =>
    parseRoleFromToken(getStoredToken()),
  );

  const handleLogout = () => {
    clearStoredToken();
    setAuthRole(null);
    toast.success("You have been logged out.");
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="ADPRO B6"
        title="Sawit Field Operations App"
        description="Manage authentication, workers, and field operations from one interface."
        actions={
          authRole ? (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )
        }
      />

      <SurfaceCard>
        <div className="overflow-hidden rounded-[2rem] border border-green-100 bg-linear-to-br from-green-50 via-white to-lime-50">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Platform Overview
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Built for role-based plantation operations
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  MySawit oversees admin access, field activities, delivery
                  records, and payment workflows in a single system.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {defaultHighlights.map((highlight, index) => (
                  <div
                    key={highlight}
                    className={cn(
                      "rounded-2xl border border-green-100 bg-white/85 p-4 text-sm text-slate-700 shadow-sm",
                      index < 3 ? "lg:col-span-2" : "lg:col-span-3",
                    )}
                  >
                    <div className="mb-3 inline-flex rounded-full bg-green-100 p-2 text-green-700">
                      <Sparkles className="size-4" />
                    </div>
                    <p>{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto min-h-[24rem] w-full max-w-xl">
              <Image
                src="/panda.png"
                alt="MySawit panda mascot"
                fill
                priority
                className="object-contain drop-shadow-[0_24px_48px_rgba(22,101,52,0.18)]"
              />
            </div>
          </div>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
