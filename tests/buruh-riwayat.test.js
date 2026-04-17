import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BuruhRiwayatPage from "../app/buruh/riwayat/page";

describe("BuruhRiwayatPage", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://example.com";
    localStorage.setItem("token", "dummy-token");
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
        },
      ]),
    });

    render(<BuruhRiwayatPage />);

    await waitFor(() => expect(screen.getByText(/2026-03-10/)).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/hasil-reports/me/history",
      expect.objectContaining({
        headers: { Authorization: "Bearer dummy-token" },
      }),
    );
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
        headers: { Authorization: "Bearer dummy-token" },
      }),
    );
  });
});
