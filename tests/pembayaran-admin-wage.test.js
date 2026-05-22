import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import WageSettingPage from "../app/pembayaran/admin/wage/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("WageSettingPage (Admin Wage Settings)", () => {
    let mockRouter;
    let alertMock;

    const createToken = (role) => {
        const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
        return `header.${payload}.signature`;
    };

    beforeEach(() => {
        mockRouter = { push: jest.fn() };
        useRouter.mockReturnValue(mockRouter);
        process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:8080";
        localStorage.clear();
        global.fetch = jest.fn();
        alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        alertMock.mockRestore();
        console.error.mockRestore();
    });

    test("redirects to login if no token is found", async () => {
        await act(async () => {
            render(<WageSettingPage />);
        });
        await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/login"));
    });

    test("redirects to home if role is not ADMIN", async () => {
        localStorage.setItem("token", createToken("BURUH"));
        await act(async () => {
            render(<WageSettingPage />);
        });
        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith("Akses ditolak! Halaman ini khusus Admin.");
            expect(mockRouter.push).toHaveBeenCalledWith("/");
        });
    });

    test("fetches and displays current wage settings when token exists", async () => {
        localStorage.setItem("token", createToken("ADMIN"));

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({
                upahBuruhPerKg: 1000,
                upahSupirPerKg: 1500,
                upahMandorPerKg: 2000
            }),
        });

        await act(async () => {
            render(<WageSettingPage />);
        });

        await waitFor(() => {
            expect(screen.getByText("Pengaturan Tarif Upah")).toBeInTheDocument();
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:8080/pembayaran/admin/wages",
            expect.objectContaining({
                headers: { Authorization: `Bearer ${createToken("ADMIN")}` },
            })
        );

        const inputBuruh = document.querySelector('input[name="upahBuruhPerKg"]');
        const inputSupir = document.querySelector('input[name="upahSupirPerKg"]');
        const inputMandor = document.querySelector('input[name="upahMandorPerKg"]');

        expect(inputBuruh).toHaveValue(1000);
        expect(inputSupir).toHaveValue(1500);
        expect(inputMandor).toHaveValue(2000);
    });

    test("shows error message when fetch fails", async () => {
        localStorage.setItem("token", createToken("ADMIN"));

        global.fetch.mockResolvedValueOnce({
            ok: false,
        });

        await act(async () => {
            render(<WageSettingPage />);
        });

        await waitFor(() => {
            expect(screen.getByText("Pengaturan Tarif Upah")).toBeInTheDocument();
        });
    });

    test("can submit new wage settings successfully", async () => {
        localStorage.setItem("token", createToken("ADMIN"));


        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({}),
        });

        await act(async () => {
            render(<WageSettingPage />);
        });

        await waitFor(() => {
            expect(screen.getByText("Pengaturan Tarif Upah")).toBeInTheDocument();
        });


        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({ message: "Success" })
        });

        const inputBuruh = document.querySelector('input[name="upahBuruhPerKg"]');
        const inputSupir = document.querySelector('input[name="upahSupirPerKg"]');
        const inputMandor = document.querySelector('input[name="upahMandorPerKg"]');
        const saveButton = screen.getByRole("button", { name: /Simpan Perubahan/i });

        await act(async () => {
            fireEvent.change(inputBuruh, { target: { value: "1200" } });
            fireEvent.change(inputSupir, { target: { value: "1800" } });
            fireEvent.change(inputMandor, { target: { value: "2500" } });
        });

        await act(async () => {
            fireEvent.click(saveButton);
        });

        await waitFor(() => {

            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8080/pembayaran/admin/wages",
                expect.objectContaining({
                    method: "PUT",
                    body: JSON.stringify({
                        upahBuruhPerKg: 1200,
                        upahSupirPerKg: 1800,
                        upahMandorPerKg: 2500
                    })
                })
            );
        });
    });
});