"use client";

import { useState } from "react";
import { validateMuatan } from "../lib/api";

export default function FormBuatPengiriman({ supirList, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    supirTrukId: "",
    muatanKg: "",
    tujuan: "",
  });
  const [error, setError] = useState("");

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
      supirTrukId: formData.supirTrukId,
      muatanKg: muatan,
      tujuan: formData.tujuan,
    });

    // Reset form
    setFormData({
      supirTrukId: "",
      muatanKg: "",
      tujuan: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="form-buat-pengiriman">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="supirTrukId">Supir Truk:</label>
        <select
          id="supirTrukId"
          name="supirTrukId"
          value={formData.supirTrukId}
          onChange={handleChange}
          required
          data-testid="select-supir"
        >
          <option value="">-- Pilih Supir Truk --</option>
          {supirList &&
            supirList.map((supir) => (
              <option key={supir.id} value={supir.id}>
                {supir.nama} ({supir.platNomorTruk})
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="muatanKg">
          Muatan (kg): <small style={{ color: "#f44336" }}>(Max 400 kg)</small>
        </label>
        <input
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

      <div className="form-group">
        <label htmlFor="tujuan">Tujuan:</label>
        <input
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

      <button type="submit" className="btn" disabled={loading} data-testid="btn-buat-pengiriman">
        {loading ? "Memproses..." : "Buat Pengiriman"}
      </button>
    </form>
  );
}
