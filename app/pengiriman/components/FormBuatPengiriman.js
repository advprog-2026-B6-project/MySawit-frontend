"use client";

import { useEffect, useState } from "react";
import { validateMuatan } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FormBuatPengiriman({ supirList, onSubmit, loading, defaultMandorEmail = "" }) {
  const [formData, setFormData] = useState({
    mandorEmail: defaultMandorEmail,
    supirEmail: "",
    muatanKg: "",
    tujuan: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      mandorEmail: defaultMandorEmail,
    }));
  }, [defaultMandorEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const muatan = parseFloat(formData.muatanKg);
    const validation = validateMuatan(muatan);

    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    onSubmit({
      mandorEmail: formData.mandorEmail,
      supirEmail: formData.supirEmail,
      muatanKg: muatan,
      tujuan: formData.tujuan,
    });

    // Reset form
    setFormData({
      mandorEmail: defaultMandorEmail,
      supirEmail: "",
      muatanKg: "",
      tujuan: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="form-buat-pengiriman" className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200/60 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="supirEmail">Supir Truk</Label>
        <select
          id="supirEmail"
          name="supirEmail"
          value={formData.supirEmail}
          onChange={handleChange}
          required
          data-testid="select-supir"
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">-- Pilih Supir Truk --</option>
          {supirList &&
            supirList.map((supir) => (
              <option key={supir.id} value={supir.username || supir.email || supir.nama}>
                {supir.nama} ({supir.platNomorTruk})
              </option>
            ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="muatanKg">
          Muatan (kg) <span className="text-xs text-muted-foreground">(Max 400 kg)</span>
        </Label>
        <Input
          type="number"
          id="muatanKg"
          name="muatanKg"
          min="0"
          max="400"
          step="0.1"
          placeholder="Masukkan berat muatan"
          value={formData.muatanKg}
          onChange={handleChange}
          required
          data-testid="input-muatan"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tujuan">Tujuan</Label>
        <Input
          type="text"
          id="tujuan"
          name="tujuan"
          placeholder="Masukkan tujuan pengiriman"
          value={formData.tujuan}
          onChange={handleChange}
          required
          data-testid="input-tujuan"
        />
      </div>

      <Button type="submit" disabled={loading} data-testid="btn-buat-pengiriman">
        {loading ? "Memproses..." : "Buat Pengiriman"}
      </Button>
    </form>
  );
}
