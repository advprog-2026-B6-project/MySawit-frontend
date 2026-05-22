import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
        jest.spyOn(console, "error").mockImplementation(() => {});


        window.snap = {
            pay: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        alertMock.mockRestore();
        console.error.mockRestore();
        delete window.snap;
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


        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue(mockPayrolls),
        });


        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({ token: "mock-midtrans-token" }),
        });


        global.fetch.mockResolvedValueOnce({ ok: true });

        render(<AdminPayrollPage />);

        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Masukkan username pekerja"), { target: { value: "johndoe" } });
        fireEvent.click(screen.getByRole("button", { name: /Cari Histori/i }));

        await waitFor(() => expect(screen.getByText("johndoe")).toBeInTheDocument());


        const approveButton = screen.getByRole("button", { name: /Setujui & Bayar/i });
        fireEvent.click(approveButton);


        await waitFor(() => {
            expect(window.snap.pay).toHaveBeenCalledWith(
                "mock-midtrans-token",
                expect.any(Object)
            );
        });


        const midtransOptions = window.snap.pay.mock.calls[0][1];
        await midtransOptions.onSuccess();


        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8080/pembayaran/admin/payroll/1/approve",
                expect.objectContaining({ method: "POST" })
            );
            expect(alertMock).toHaveBeenCalledWith("Pembayaran berhasil diselesaikan via Midtrans!");
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

    test("handles invalid token format gracefully (catch error)", async () => {
        localStorage.setItem("token", "token-rusak-tanpa-titik");
        render(<AdminPayrollPage />);
        await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/login"));
    });

    test("shows error when search history fails", async () => {
        localStorage.setItem("token", createToken("ADMIN"));

        global.fetch.mockResolvedValueOnce({ ok: false });

        render(<AdminPayrollPage />);
        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Masukkan username pekerja"), { target: { value: "johndoe" } });
        fireEvent.click(screen.getByRole("button", { name: /Cari Histori/i }));

        await waitFor(() => {
            expect(screen.getByText("Gagal mengambil histori payroll. Pastikan username benar dan Anda memiliki akses admin.")).toBeInTheDocument();
        });
    });

    test("can reject a payroll with reason", async () => {
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

        global.fetch.mockResolvedValueOnce({ ok: true });

        render(<AdminPayrollPage />);
        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Masukkan username pekerja"), { target: { value: "johndoe" } });
        fireEvent.click(screen.getByRole("button", { name: /Cari Histori/i }));

        await waitFor(() => expect(screen.getByText("johndoe")).toBeInTheDocument());

        const rejectButton = screen.getByRole("button", { name: /Tolak/i });
        fireEvent.click(rejectButton);

        await waitFor(() => expect(screen.getByText("Alasan Penolakan")).toBeInTheDocument());

        const reasonInput = screen.getByPlaceholderText("Berikan alasan spesifik mengapa payroll ditolak...");
        fireEvent.change(reasonInput, { target: { value: "Data panen tidak sesuai" } });

        const confirmButton = screen.getByRole("button", { name: /Konfirmasi Tolak/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8080/pembayaran/admin/payroll/1/reject",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ reason: "Data panen tidak sesuai" })
                })
            );
        });
    });

    test("shows error when creating payroll fails", async () => {
        localStorage.setItem("token", createToken("ADMIN"));

        global.fetch.mockResolvedValueOnce({ ok: false });

        render(<AdminPayrollPage />);
        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        const createTab = screen.getByRole("button", { name: /Buat Payroll Baru/i });
        fireEvent.click(createTab);

        await waitFor(() => expect(screen.getByText("Formulir Pembuatan Payroll")).toBeInTheDocument());

        const userInputs = screen.getAllByRole("textbox");
        fireEvent.change(userInputs[0], { target: { value: "johndoe" } });
        fireEvent.change(document.querySelector('input[name="startDate"]'), { target: { value: "2023-10-01" } });
        fireEvent.change(document.querySelector('input[name="endDate"]'), { target: { value: "2023-10-15" } });
        fireEvent.change(document.querySelector('input[name="totalKg"]'), { target: { value: "100" } });

        const submitBtn = screen.getByRole("button", { name: /Buat & Hitung Payroll/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText("Gagal membuat payroll. Validasi input atau otoritas gagal.")).toBeInTheDocument();
        });
    });


    test("searches history with date filters and handles non-array response", async () => {
        localStorage.setItem("token", createToken("ADMIN"));


        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({ some: "data" }),
        });

        render(<AdminPayrollPage />);
        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Masukkan username pekerja"), { target: { value: "johndoe" } });


        const dateInputs = document.querySelectorAll('input[type="date"]');
        fireEvent.change(dateInputs[0], { target: { value: "2023-10-01" } });
        fireEvent.change(dateInputs[1], { target: { value: "2023-10-31" } });

        fireEvent.click(screen.getByRole("button", { name: /Cari Histori/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("startDate=2023-10-01&endDate=2023-10-31"),
                expect.any(Object)
            );

            expect(screen.getByText("Belum ada data untuk pencarian ini")).toBeInTheDocument();
        });
    });


    test("handles Midtrans checkout token failure", async () => {
        localStorage.setItem("token", createToken("ADMIN"));
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue([{ id: "1", username: "johndoe", status: "PENDING" }]),
            })
            .mockResolvedValueOnce({ ok: false });

        render(<AdminPayrollPage />);
        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Masukkan username pekerja"), { target: { value: "johndoe" } });
        fireEvent.click(screen.getByRole("button", { name: /Cari Histori/i }));

        await waitFor(() => expect(screen.getByText("johndoe")).toBeInTheDocument());

        fireEvent.click(screen.getByRole("button", { name: /Setujui & Bayar/i }));

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith("Gagal meminta token pembayaran dari server.");
        });
    });


    test("handles Midtrans callbacks (pending, error, close)", async () => {
        localStorage.setItem("token", createToken("ADMIN"));
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue([{ id: "1", username: "johndoe", status: "PENDING" }]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({ token: "mock-token" }),
            })
            .mockResolvedValueOnce({ ok: true });

        render(<AdminPayrollPage />);
        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Masukkan username pekerja"), { target: { value: "johndoe" } });
        fireEvent.click(screen.getByRole("button", { name: /Cari Histori/i }));

        await waitFor(() => expect(screen.getByText("johndoe")).toBeInTheDocument());
        fireEvent.click(screen.getByRole("button", { name: /Setujui & Bayar/i }));

        await waitFor(() => expect(window.snap.pay).toHaveBeenCalled());

        const midtransOptions = window.snap.pay.mock.calls[0][1];


        midtransOptions.onClose();
        expect(alertMock).toHaveBeenCalledWith("Anda menutup popup tanpa menyelesaikan pembayaran. Status tetap PENDING.");


        midtransOptions.onError();
        expect(alertMock).toHaveBeenCalledWith("Pembayaran gagal! Status dikembalikan ke PENDING.");


        await midtransOptions.onPending();
        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith("Menunggu pembayaran...");
        });
    });


    test("can view reject reason modal for rejected payroll", async () => {
        localStorage.setItem("token", createToken("ADMIN"));
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue([{
                id: "1",
                username: "johndoe",
                status: "REJECTED",
                rejectReason: "Data panen manipulasi"
            }]),
        });

        render(<AdminPayrollPage />);
        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Masukkan username pekerja"), { target: { value: "johndoe" } });
        fireEvent.click(screen.getByRole("button", { name: /Cari Histori/i }));

        await waitFor(() => expect(screen.getByText("johndoe")).toBeInTheDocument());

        expect(screen.queryByText("Data panen manipulasi")).not.toBeInTheDocument();

        const viewButton = screen.getByRole("button", { name: /Lihat Alasan/i });
        fireEvent.click(viewButton);

        await waitFor(() => {
            expect(screen.getByText("Data panen manipulasi")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /Tutup/i }));
    });


    test("handles network exception gracefully in fetch operations", async () => {
        localStorage.setItem("token", createToken("ADMIN"));


        global.fetch.mockRejectedValueOnce(new Error("Network Offline"));

        render(<AdminPayrollPage />);
        await waitFor(() => expect(screen.getByText("Manajemen Payroll Admin")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Masukkan username pekerja"), { target: { value: "johndoe" } });
        fireEvent.click(screen.getByRole("button", { name: /Cari Histori/i }));

        await waitFor(() => {
            expect(screen.getByText("Gagal terhubung ke server.")).toBeInTheDocument();
        });
    });
});