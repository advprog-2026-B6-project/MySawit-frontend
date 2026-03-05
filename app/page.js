"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/test-json`)
      .then((res) => res.json())
      .then((data) =>
        setMsg(data?.text ?? "If you see this, something failed!!!"),
      );
  }, []);

  return (
    <div>
      <div>fetched message : {msg}</div>

      <div> CI will be ignored for now as its asking for coverage</div>

      <div className="text-white underline space-x-10 my-10">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/register">
          <Button>Register</Button>
        </Link>
      </div>
    </div>
  );
}
