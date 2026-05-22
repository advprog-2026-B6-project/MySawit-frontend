import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BuruhRiwayatPage from "../app/buruh/riwayat/page";

describe("BuruhRiwayatPage", () => {
  const createToken = (role) => {
    const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
    return `header.${payload}.signature`;
  };
  const buruhToken = createToken("BURUH");

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://example.com";
    localStorage.setItem("token", buruhToken);
  });

  afterEach(() => {
    delete global.fetch;
    localStorage.clear();
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
  });

  test("loads personal history on first render", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          id: "r1",
          hasilDate: "2026-03-10",
          weightKg: 120,
          status: "SUBMITTED",
          news: "Panen blok A",
          photoUrls: ["foto-1.jpg"],
        },
      ]),
    });

    render(<BuruhRiwayatPage />);

    await waitFor(() => expect(screen.getByText(/2026-03-10/)).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/hasil-reports/me/history",
      expect.objectContaining({
        headers: { Authorization: `Bearer ${buruhToken}` },
      }),
    );
  });

  test("shows rejection reason when report is rejected", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          id: "r1",
          hasilDate: "2026-03-10",
          weightKg: 120,
          status: "REJECTED",
          news: "Panen blok A",
          rejectionReason: "Foto tidak jelas",
          photoUrls: ["foto-1.jpg", "foto-2.jpg"],
        },
      ]),
    });

    render(<BuruhRiwayatPage />);

    await waitFor(() => expect(screen.getByText("Foto tidak jelas")).toBeInTheDocument());
    expect(screen.getByText(/alasan penolakan/i)).toBeInTheDocument();
    expect(screen.getByText("Bukti foto")).toBeInTheDocument();
    expect(screen.getByText("foto-1.jpg")).toBeInTheDocument();
    expect(screen.getByText("foto-2.jpg")).toBeInTheDocument();
  });

  test("shows login notice and does not fetch when token is missing", async () => {
    localStorage.clear();
    global.fetch = jest.fn();

    render(<BuruhRiwayatPage />);

    expect(screen.getByText("Silakan Login")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows access denied and does not fetch for non-buruh role", async () => {
    localStorage.setItem("token", createToken("MANDOR"));
    global.fetch = jest.fn();

    render(<BuruhRiwayatPage />);

    expect(screen.getByText("Akses Ditolak")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("applies start-end-status filter in request query", async () => {
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

    render(<BuruhRiwayatPage />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-03-01" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-03-31" },
    });
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "SUBMITTED" },
    });

    fireEvent.click(screen.getByRole("button", { name: /terapkan filter/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/hasil-reports/me/history?startDate=2026-03-01&endDate=2026-03-31&status=SUBMITTED",
      expect.objectContaining({
        headers: { Authorization: `Bearer ${buruhToken}` },
      }),
    );
  });
});
