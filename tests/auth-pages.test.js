import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../app/login/page";
import RegisterPage from "../app/register/page";
import { requestJson } from "@/lib/api-client";

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@/lib/api-client", () => ({
  requestJson: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("auth pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("login redirects an existing session home without clearing the token", async () => {
    localStorage.setItem("token", "existing-token");

    render(<LoginPage />);

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
    expect(localStorage.getItem("token")).toBe("existing-token");
    expect(screen.getByRole("button", { name: "Login" })).toBeDisabled();
  });

  test("register redirects an existing session home without clearing the token", async () => {
    localStorage.setItem("token", "existing-token");

    render(<RegisterPage />);

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
    expect(localStorage.getItem("token")).toBe("existing-token");
    expect(screen.getByRole("button", { name: "Register" })).toBeDisabled();
  });

  test("successful admin login redirects to home", async () => {
    const user = userEvent.setup();
    requestJson.mockResolvedValue({ token: "admin-token" });

    render(<LoginPage />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Login" })).toBeEnabled(),
    );

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/"));
    expect(mockRouter.push).not.toHaveBeenCalledWith("/admin");
    expect(localStorage.getItem("token")).toBe("admin-token");
  });
});
