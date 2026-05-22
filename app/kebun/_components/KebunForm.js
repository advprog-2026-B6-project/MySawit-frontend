"use client";

import { SectionHeader } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Save } from "lucide-react";

export default function KebunForm({
  form,
  setForm,
  kodeUnik,
  isEdit,
  loading,
  onSubmit,
  onCancel,
}) {
  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const coordFields = [
    { label: "Kiri Atas", xName: "kiriAtasX", yName: "kiriAtasY" },
    { label: "Kanan Atas", xName: "kananAtasX", yName: "kananAtasY" },
    { label: "Kanan Bawah", xName: "kananBawahX", yName: "kananBawahY" },
    { label: "Kiri Bawah", xName: "kiriBawahX", yName: "kiriBawahY" },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <SectionHeader
        eyebrow="Data Kebun"
        title={isEdit ? "Perbarui kebun sawit" : "Daftarkan kebun sawit"}
        description="Pastikan identitas kebun dan koordinat batas lahan dicatat dengan akurat untuk mendukung pemantauan operasional."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="namaKebun">Nama Kebun</Label>
          <Input
            id="namaKebun"
            type="text"
            name="namaKebun"
            value={form.namaKebun}
            onChange={handleChange}
            required
            placeholder="Contoh: Kebun Utara"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kodeUnik">
            {isEdit ? "Kode Unik" : "Kode Unik (format: XX-0000)"}
          </Label>
          <Input
            id="kodeUnik"
            type="text"
            name="kodeUnik"
            value={isEdit ? kodeUnik : form.kodeUnik || ""}
            onChange={handleChange}
            required={!isEdit}
            disabled={isEdit}
            placeholder="Contoh: KB-0001"
            className="font-mono"
          />
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="size-4 text-green-700" />
          <h3 className="text-sm font-semibold text-slate-800">
            Koordinat dalam meter
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {coordFields.map(({ label, xName, yName }) => (
            <div
              key={label}
              className="rounded-2xl border border-green-100 bg-green-50/50 p-4"
            >
              <Label className="mb-3 text-slate-600">{label}</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  name={xName}
                  value={form[xName]}
                  onChange={handleChange}
                  placeholder="X"
                  step="any"
                  required
                />
                <Input
                  type="number"
                  name={yName}
                  value={form[yName]}
                  onChange={handleChange}
                  placeholder="Y"
                  step="any"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-green-100 pt-5 sm:flex-row">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  );
}
