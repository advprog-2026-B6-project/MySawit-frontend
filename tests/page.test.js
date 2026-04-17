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

  test("fetches message and displays it", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: "hello" }),
    });

    render(<Home />);

    await waitFor(() =>
      expect(screen.getByText(/fetched message :/)).toHaveTextContent(
        "fetched message : hello",
      ),
    );
  });

  test("shows fallback when fetch returns no text", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    });

    render(<Home />);

    await waitFor(() =>
      expect(screen.getByText(/fetched message :/)).toHaveTextContent(
        "fetched message : If you see this, something failed!!!",
      ),
    );
  });

  test("keeps loading text when fetch never resolves", async () => {
    // return pending promise so it stays on Loading...
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));

    render(<Home />);

    await waitFor(() =>
      expect(screen.getByText(/fetched message :/)).toHaveTextContent(
        "fetched message : Loading...",
      ),
    );
  });

  test("shows only login and register before login", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: "hello" }),
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByText("Login")).toBeInTheDocument());
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.queryByText("Buruh Form Hasil")).not.toBeInTheDocument();
    expect(screen.queryByText("Buruh Riwayat")).not.toBeInTheDocument();
    expect(screen.queryByText("Mandor Riwayat")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  test("shows buruh buttons after buruh login", async () => {
    localStorage.setItem("token", createToken("BURUH"));
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: "hello" }),
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByText("Buruh Form Hasil")).toBeInTheDocument());
    expect(screen.getByText("Buruh Riwayat")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
    expect(screen.queryByText("Mandor Riwayat")).not.toBeInTheDocument();
  });

  test("shows mandor buttons after mandor login", async () => {
    localStorage.setItem("token", createToken("MANDOR"));
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: "hello" }),
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByText("Mandor Riwayat")).toBeInTheDocument());
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
    expect(screen.queryByText("Buruh Form Hasil")).not.toBeInTheDocument();
    expect(screen.queryByText("Buruh Riwayat")).not.toBeInTheDocument();
  });
});
