import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import BuruhPanenPage from "../app/buruh/hasil/page";

describe("BuruhPanenPage", () => {
  const createToken = (role) => {
    const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
    return `header.${payload}.signature`;
  };

  beforeEach(() => {
    localStorage.setItem("token", createToken("BURUH"));
  });

  afterEach(() => {
    delete global.fetch;
    localStorage.clear();
  });

  test("loads today status for buruh", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        formLocked: false,
        message: "Anda belum melaporkan panen hari ini",
      }),
    });

    render(<BuruhPanenPage />);

    await waitFor(() =>
      expect(screen.getByText("Laporan panen hari ini")).toBeInTheDocument(),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/hasil-reports/me/today",
      expect.objectContaining({
        headers: { Authorization: `Bearer ${createToken("BURUH")}` },
      }),
    );
  });

  test("shows login notice and does not fetch when token is missing", () => {
    localStorage.clear();
    global.fetch = jest.fn();

    render(<BuruhPanenPage />);

    expect(screen.getByText("Silakan Login")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows access denied and does not fetch for non-buruh role", () => {
    localStorage.setItem("token", createToken("MANDOR"));
    global.fetch = jest.fn();

    render(<BuruhPanenPage />);

    expect(screen.getByText("Akses Ditolak")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
