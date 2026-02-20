
"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:8080/test-json")
      .then((res) => res.json())
      .then((data) => setMsg(data?.text ?? "If you see this, something failed!!!"))
  }, []);

  return (
    <div>
      <div>fetched message : {msg}</div>
    </div>
  );
}

