"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState("Loading...");
  const [authRole, setAuthRole] = useState(null);

  useEffect(() => {
    // TODO: Move JWT parsing into an auth module/context when the shared auth layer is available.
    const token = localStorage.getItem("token");
    setAuthRole(parseRoleFromToken(token));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthRole(null);
  };

  const showPublicActions = !authRole;
  const showBuruhActions = authRole === "BURUH";
  const showMandorActions = authRole === "MANDOR";

  return (
    <div>
      <div className="w-full h-16 bg-primary flex justify-between px-10 py-5 text-white">
        <div>MySawit</div>
        <div className="flex gap-8">
          <Link href="/1">module 1</Link>
          <Link href="/2">module 2</Link>
          <Link href="/3">module 3</Link>
          <Link href="/4">module 4</Link>
        </div>
      </div>

      <div className="flex-col justify-center items-center">
        <div className="flex justify-center items-center">
          <div className="flex flex-col gap-8">
            <div className="text-4xl font-bold">MySawit</div>
            <div className="max-w-[50ch]">
              Custom sawit farm management app. Features include role based
              authentication and field, haul, delivery, and payment management.
              Adpro kelompok B6. Authentication - Daffa Ismail | Kebun - Felesia
              Junelus | Hasil Farrel - Rifqi Bagaskoro | Pengiriman - Aufa Daffa
              Satriatama | Pembayaran - Firos Aqiela Zufa
            </div>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button className="px-8 py-5">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="px-8 py-5">Register</Button>
              </Link>
            </div>
          </div>
          <div className="relative size-160 shrink-0">
            <Image src="/panda.png" alt="" fill className="object-cover" />
          </div>
        </div>
      </div>

      {authRole ? <Button onClick={handleLogout}>Logout</Button> : null}

      <div className="text-white underline space-x-10 my-10">
        {showPublicActions ? (
          <>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </>
        ) : null}

        {showBuruhActions ? (
          <>
            <Link href="/buruh/hasil">
              <Button>Form Hasil Panen Buruh</Button>
            </Link>
            <Link href="/buruh/riwayat">
              <Button>Riwayat Panen Buruh</Button>
            </Link>
          </>
        ) : null}

        {showMandorActions ? (
          <>
            <Link href="/mandor/riwayat">
              <Button>Riwayat Panen Mandor</Button>
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}

function parseRoleFromToken(token) {
  if (!token) {
    return null;
  }

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return null;
    }

    const normalizedPayload = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(normalizedPayload);
    const payload = JSON.parse(decodedPayload);
    return payload?.role ?? null;
  } catch {
    return null;
  }
}
