import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MandorRiwayatPage from "../app/mandor/riwayat/page";

describe("MandorRiwayatPage", () => {
  const createToken = (role) => {
    const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
    return `header.${payload}.signature`;
  };
  const mandorToken = createToken("MANDOR");
  
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://example.com";
    localStorage.setItem("token", mandorToken);
  });

  afterEach(() => {
    delete global.fetch;
    localStorage.clear();
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
  });

  test("shows worker history rows and profile link", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          id: "h1",
          workerId: "buruh-1",
          workerName: "Budi",
          hasilDate: "2026-03-10",
          weightKg: 110,
          status: "SUBMITTED",
        },
      ]),
    });

    render(<MandorRiwayatPage />);

    await waitFor(() => expect(screen.getByText("Budi")).toBeInTheDocument());

    const profileLink = screen.getByRole("link", { name: /lihat profil buruh/i });
    expect(profileLink).toHaveAttribute("href", "/mandor/buruh/buruh-1");
  });

  test("shows login notice and does not fetch when token is missing", async () => {
    localStorage.clear();
    global.fetch = jest.fn();

    render(<MandorRiwayatPage />);

    expect(screen.getByText("Silakan Login")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows access denied and does not fetch for non-mandor role", async () => {
    localStorage.setItem("token", createToken("BURUH"));
    global.fetch = jest.fn();

    render(<MandorRiwayatPage />);

    expect(screen.getByText("Akses Ditolak")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("applies date and workerName filters in request query", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

    render(<MandorRiwayatPage />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Tanggal"), {
      target: { value: "2026-03-15" },
    });
    fireEvent.change(screen.getByLabelText("Nama Buruh"), {
      target: { value: "Budi" },
    });

    fireEvent.click(screen.getByRole("button", { name: /terapkan filter/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/hasil-reports/mandor/history?date=2026-03-15&workerName=Budi",
      expect.objectContaining({
        headers: { Authorization: `Bearer ${mandorToken}` },
      }),
    );
  });
});
