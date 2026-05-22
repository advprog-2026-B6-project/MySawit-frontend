import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MandorTab from "../app/pengiriman/components/MandorTab";

jest.mock("../app/pengiriman/lib/api", () => ({
  fetchSupirBertugas: jest.fn().mockResolvedValue({ success: true, data: [] }),
  fetchAllSupir: jest.fn().mockResolvedValue({
    success: true,
    data: [
      {
        id: "supir-1",
        nama: "Supir Satu",
        platNomorTruk: "B 1234 ZZ",
      },
    ],
  }),
  fetchPengirimanBerlangsung: jest.fn().mockResolvedValue({ success: true, data: [] }),
  buatPengiriman: jest.fn().mockResolvedValue({ success: true }),
  approvePengiriman: jest.fn().mockResolvedValue({ success: true }),
  rejectPengiriman: jest.fn().mockResolvedValue({ success: true }),
  validateMuatan: jest.fn().mockReturnValue({ valid: true, message: "" }),
}));

const { buatPengiriman } = require("../app/pengiriman/lib/api");

describe("MandorTab", () => {
  test("requires mandor id before creating pengiriman", async () => {
    render(<MandorTab />);

    fireEvent.change(await screen.findByTestId("select-supir"), {
      target: { value: "supir-1" },
    });

    fireEvent.change(await screen.findByTestId("input-muatan"), {
      target: { value: "100" },
    });

    fireEvent.change(await screen.findByTestId("input-tujuan"), {
      target: { value: "Gudang" },
    });

    fireEvent.submit(await screen.findByTestId("form-buat-pengiriman"));

    expect(
      await screen.findByText(/mandor id wajib diisi sebelum menugaskan supir/i),
    ).toBeInTheDocument();
    expect(buatPengiriman).not.toHaveBeenCalled();
  });

  test("submits create pengiriman with mandor id", async () => {
    render(<MandorTab />);

    fireEvent.change(await screen.findByTestId("input-mandor-id"), {
      target: { value: "10" },
    });

    fireEvent.change(await screen.findByTestId("select-supir"), {
      target: { value: "supir-1" },
    });

    fireEvent.change(await screen.findByTestId("input-muatan"), {
      target: { value: "100" },
    });

    fireEvent.change(await screen.findByTestId("input-tujuan"), {
      target: { value: "Gudang" },
    });

    fireEvent.submit(await screen.findByTestId("form-buat-pengiriman"));

    await waitFor(() => expect(buatPengiriman).toHaveBeenCalled());
    expect(buatPengiriman).toHaveBeenCalledWith({
      mandorId: 10,
      supirTrukId: "supir-1",
      muatanKg: 100,
      tujuan: "Gudang",
    });
  });
});
