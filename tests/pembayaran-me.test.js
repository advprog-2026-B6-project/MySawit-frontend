import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkerPayrollPage from "../app/pembayaran/me/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("WorkerPayrollPage (Me)", () => {
    let mockRouter;

    beforeEach(() => {
        mockRouter = { push: jest.fn() };
        useRouter.mockReturnValue(mockRouter);
        process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:8080";
        localStorage.clear();
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("redirects to login if no token is found", async () => {
        render(<WorkerPayrollPage />);
        await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/login"));
    });

    test("fetches and displays payroll data when token exists", async () => {
        localStorage.setItem("token", "dummy-token");

        const mockPayrolls = [
            {
                id: "123",
                date: "2023-10-01T00:00:00Z",
                totalAmount: 150000,
                status: "PAID",
            },
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue(mockPayrolls),
        });

        render(<WorkerPayrollPage />);

        expect(screen.getByText("Memuat data...")).toBeInTheDocument();

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8080/pembayaran/payroll/me?",
                expect.objectContaining({
                    headers: { Authorization: "Bearer dummy-token" },
                })
            );
        });

        await waitFor(() => {
            expect(screen.getByText(/#123/)).toBeInTheDocument();
            expect(screen.getByText(/01 Oct 2023/)).toBeInTheDocument();
            expect(screen.getByText("Rp 150.000")).toBeInTheDocument();
            expect(screen.getByText("PAID")).toBeInTheDocument();
        });
    });

    test("shows error message when fetch fails", async () => {
        localStorage.setItem("token", "dummy-token");

        global.fetch.mockResolvedValueOnce({
            ok: false,
        });

        render(<WorkerPayrollPage />);

        await waitFor(() => {
            expect(
                screen.getByText("Gagal mengambil data payroll Anda. Silakan coba lagi.")
            ).toBeInTheDocument();
        });
    });

    test("applies filters correctly", async () => {
        localStorage.setItem("token", "dummy-token");
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue([]),
        });

        render(<WorkerPayrollPage />);

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

        const startDateInput = document.querySelector('input[name="startDate"]');
        const endDateInput = document.querySelector('input[name="endDate"]');
        const statusSelect = document.querySelector('select[name="status"]');
        const filterButton = screen.getByRole("button", { name: /Filter Data/i });

        fireEvent.change(startDateInput, { target: { value: "2023-10-01" } });
        fireEvent.change(endDateInput, { target: { value: "2023-10-31" } });
        fireEvent.change(statusSelect, { target: { value: "PENDING" } });

        fireEvent.click(filterButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenLastCalledWith(
                "http://localhost:8080/pembayaran/payroll/me?startDate=2023-10-01&endDate=2023-10-31&status=PENDING",
                expect.any(Object)
            );
        });
    });
});
