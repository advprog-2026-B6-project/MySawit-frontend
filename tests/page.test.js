import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../app/page";

describe("Home component", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://example.com";
  });

  afterEach(() => {
    delete global.fetch;
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
  });

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
});
