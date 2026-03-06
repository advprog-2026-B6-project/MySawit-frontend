"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-green-700 mb-6">
        MySawit
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Sistem Manajemen Pengiriman Sawit
      </p>
      
      <div className="flex flex-col gap-4">
        <Link 
          href="/pengiriman"
          className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors text-center"
        >
          Masuk ke Sistem Pengiriman
        </Link>
      </div>
    </div>
  );
}
