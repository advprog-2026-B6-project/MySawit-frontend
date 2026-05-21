"use client";

import { PageHero, PageShell, SectionHeader, SurfaceCard } from "@/components/app/page-shell";
import { useEffect, useState } from "react";

const Page = () => {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/hello`)
      .then((res) => res.json())
      .then((data) =>
        setMsg(data?.message ?? "If you see this, something failed!!!"),
      );
  }, []);

  return (
    <PageShell>
      <PageHero
        eyebrow="Status Sistem"
        title="Pemeriksaan Layanan"
        description="Pantau koneksi aplikasi frontend dengan layanan backend MySawit."
      />
      <SurfaceCard>
        <SectionHeader
          eyebrow="Layanan Backend"
          title="Respons Sistem"
          description={msg || "Memuat respons layanan..."}
        />
      </SurfaceCard>
    </PageShell>
  );
};

export default Page;
