import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPayrollPage from "../app/pembayaran/admin/payroll/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("AdminPayrollPage", () => {
    let mockRouter;
    let alertMock;

    beforeEach(() => {
        mockRouter = { push: jest.fn() };
        useRouter.mockReturnValue(mockRouter);
        process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:8080";
        localStorage.clear();
        global.fetch = jest.fn();
        alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        alertMock.mockRestore();
    });

    const createToken = (role) => {
        const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
        return `header.${payload}.signature`;
    };

    test("redirects to login if no token is found", async () => {
        render(<AdminPayrollPage />);
        await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/login"));
    });

    test("redirects to home if role is not ADMIN", async () => {
        localStorage.setItem("token", createToken("BURUH"));
        render(<AdminPayrollPage />);
        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith("Akses ditolak! Halaman ini khusus Admin.");
            expect(mockRouter.push).toHaveBeenCalledWith("/");
        });
    });

    test("renders correctly for ADMIN and can search history", async () => {
        localStorage.setItem("token", createToken("ADMIN"));

        const mockPayrolls = [
            {
                id: "1",
                username: "johndoe",
                createdAt: "2023-10-01T00:00:00Z",
                totalWage: 150000,
                status: "PENDING",
            },
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue(mockPayrolls),
        });

        render(<AdminPayrollPage />);

        await waitFor(() => {
            expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument();
        });

        const usernameInput = screen.getByPlaceholderText("Masukkan username pekerja");
        fireEvent.change(usernameInput, { target: { value: "johndoe" } });

        const searchButton = screen.getByRole("button", { name: /Cari Histori/i });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8080/pembayaran/admin/payroll/user/johndoe?",
                expect.any(Object)
            );
            expect(screen.getByText("#1")).toBeInTheDocument();
            expect(screen.getByText("johndoe")).toBeInTheDocument();
            expect(screen.getByText("Rp 150.000,00")).toBeInTheDocument();
        });
    });

    test("can approve a payroll", async () => {
        localStorage.setItem("token", createToken("ADMIN"));

        const mockPayrolls = [
            {
                id: "1",
                username: "johndoe",
                createdAt: "2023-10-01T00:00:00Z",
                totalWage: 150000,
                status: "PENDING",
            },
        ];

        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockPayrolls),
            })
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true });

        render(<AdminPayrollPage />);

        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Masukkan username pekerja"), { target: { value: "johndoe" } });
        fireEvent.click(screen.getByRole("button", { name: /Cari Histori/i }));

        await waitFor(() => expect(screen.getByText("johndoe")).toBeInTheDocument());

        const approveButton = screen.getByRole("button", { name: /Setujui/i });
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8080/pembayaran/admin/payroll/1/approve",
                expect.objectContaining({ method: "POST" })
            );
            expect(alertMock).toHaveBeenCalledWith("Payroll disetujui dan dibayar via Payment Gateway simulasi.");
        });
    });

    test("can create new payroll", async () => {
        localStorage.setItem("token", createToken("ADMIN"));

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({ totalAmount: 200000 }),
        });

        render(<AdminPayrollPage />);

        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        const createTab = screen.getByRole("button", { name: /Buat Payroll Baru/i });
        fireEvent.click(createTab);

        await waitFor(() => expect(screen.getByText("Formulir Pembuatan Payroll")).toBeInTheDocument());

        const userInputs = screen.getAllByRole("textbox");
        fireEvent.change(userInputs[0], { target: { value: "johndoe" } });

        const startDate = document.querySelector('input[name="startDate"]');
        const endDate = document.querySelector('input[name="endDate"]');
        const totalKg = document.querySelector('input[name="totalKg"]');

        fireEvent.change(startDate, { target: { value: "2023-10-01" } });
        fireEvent.change(endDate, { target: { value: "2023-10-15" } });
        fireEvent.change(totalKg, { target: { value: "100" } });

        const submitBtn = screen.getByRole("button", { name: /Buat & Hitung Payroll/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8080/pembayaran/admin/payroll",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({
                        username: "johndoe",
                        startDate: "2023-10-01",
                        endDate: "2023-10-15",
                        totalKg: 100
                    })
                })
            );
            expect(screen.getByText("Payroll berhasil dibuat dengan total: Rp 200.000")).toBeInTheDocument();
        });
    });
});
