import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPage from "../app/admin/page";
import { requestJson } from "@/lib/api-client";
import { toast } from "sonner";

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

function createToken(role) {
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
  return `header.${payload}.signature`;
}

describe("admin page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://example.com";
  });

  afterEach(() => {
    localStorage.clear();
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
  });

  test("redirects non-admin users before loading the dashboard", async () => {
    localStorage.setItem("token", createToken("BURUH"));

    const { container } = render(<AdminPage />);

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
    expect(requestJson).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });

  test("blocks deleting a mandor assigned to a buruh before sending delete request", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", createToken("ADMIN"));
    requestJson.mockResolvedValue([
      {
        id: 1,
        username: "mandor-1",
        role: "MANDOR",
        mandorUsername: null,
      },
      {
        id: 2,
        username: "buruh-1",
        role: "BURUH",
        mandorUsername: "mandor-1",
      },
    ]);

    render(<AdminPage />);

    await waitFor(() =>
      expect(screen.getAllByText("mandor-1").length).toBeGreaterThan(0),
    );
    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    await user.click(screen.getByRole("button", { name: /delete user/i }));

    expect(toast.error).toHaveBeenCalledWith(
      "We cant delete that users as its been assigned to a Buruh",
    );
    expect(requestJson).toHaveBeenCalledTimes(1);
    expect(requestJson).not.toHaveBeenCalledWith(
      "/admin/delete/1",
      expect.anything(),
    );
  });
});
