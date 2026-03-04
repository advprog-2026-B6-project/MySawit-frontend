"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    fetch(`${process.env.BACKEND_URL}/test-json`)
      .then((res) => res.json())
      .then((data) =>
        setMsg(data?.text ?? "If you see this, something failed!!!"),
      );
  }, []);

  return (
    <div>
      <div>fetched message : {msg}</div>

      <div> CI will be ignored for now as its asking for coverage</div>
    </div>
  );
}
