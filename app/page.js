"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState("Loading...");
  const [authRole, setAuthRole] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/hello`)
      .then((res) => res.json())
      .then((data) =>
        setMsg(data?.message ?? "If you see this, something failed!!!"),
      );

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
      <div>fetched message : {msg}</div>

      <div> CI will be ignored for now as its asking for coverage</div>

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

        {authRole ? <Button onClick={handleLogout}>Logout</Button> : null}
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
