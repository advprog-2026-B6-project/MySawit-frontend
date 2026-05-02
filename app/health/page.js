"use client";
import { useEffect, useState } from "react";

const Page = () => {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/hello`)
      .then((res) => res.json())
      .then((data) =>
        setMsg(data?.message ?? "If you see this, something failed!!!"),
      );
  }, []);
  return (
    <div>
      <div>Health check</div>
      <div>Message from backend : {msg}</div>
    </div>
  );
};
export default Page;
