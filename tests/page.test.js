import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../app/page";

describe("Home component", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://example.com";
    localStorage.clear();
  });

  afterEach(() => {
    delete global.fetch;
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    localStorage.clear();
  });

  const createToken = (role) => {
    const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
    return `header.${payload}.signature`;
  };

  test("calls backend API on mount", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: "hello" }),
    });

    render(<Home />);

    // Memastikan fetch dipanggil tanpa harus mencari teks di DOM
    // karena di versi page.js terbaru, backendMessage tidak di-render ke UI
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("http://example.com/auth/hello");
    });
  });

  test("shows only login and register before login", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: "hello" }),
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByText("Masuk")).toBeInTheDocument());
    expect(screen.getByText("Daftar Akun")).toBeInTheDocument();
    expect(screen.queryByText("Input Hasil Panen")).not.toBeInTheDocument();
    expect(screen.queryByText("Riwayat Panen Saya")).not.toBeInTheDocument();
    expect(screen.queryByText("Verifikasi Panen")).not.toBeInTheDocument();
    expect(screen.queryByText("Keluar")).not.toBeInTheDocument();
  });

  test("shows buruh buttons after buruh login", async () => {
    localStorage.setItem("token", createToken("BURUH"));
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: "hello" }),
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByText("Input Hasil Panen")).toBeInTheDocument());
    expect(screen.getByText("Riwayat Panen Saya")).toBeInTheDocument();
    expect(screen.getByText("Keluar")).toBeInTheDocument();
    expect(screen.queryByText("Masuk")).not.toBeInTheDocument();
    expect(screen.queryByText("Daftar Akun")).not.toBeInTheDocument();
    expect(screen.queryByText("Verifikasi Panen")).not.toBeInTheDocument();
  });

  test("shows mandor buttons after mandor login", async () => {
    localStorage.setItem("token", createToken("MANDOR"));
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: "hello" }),
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByText("Verifikasi Panen")).toBeInTheDocument());
    expect(screen.getByText("Keluar")).toBeInTheDocument();
    expect(screen.queryByText("Masuk")).not.toBeInTheDocument();
    expect(screen.queryByText("Daftar Akun")).not.toBeInTheDocument();
    expect(screen.queryByText("Input Hasil Panen")).not.toBeInTheDocument();
    expect(screen.queryByText("Riwayat Panen Saya")).not.toBeInTheDocument();
  });
});