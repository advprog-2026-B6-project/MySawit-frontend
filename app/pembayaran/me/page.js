"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Filter, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function WorkerPayrollPage() {
    const router = useRouter();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        status: "",
    });

    const fetchPayrolls = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const queryParams = new URLSearchParams();
            if (filters.startDate) queryParams.append("startDate", filters.startDate);
            if (filters.endDate) queryParams.append("endDate", filters.endDate);
            if (filters.status) queryParams.append("status", filters.status);

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payroll/me?${queryParams.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setPayrolls(data);
            } else {
                setError("Gagal mengambil data payroll Anda. Silakan coba lagi.");
            }
        } catch (err) {
            setError("Gagal terhubung ke server.");
            console.error("Fetch payroll error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = (e) => {
        e.preventDefault();
        fetchPayrolls();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PAID":
                return "bg-green-100 text-green-800 border-green-200";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "PAID":
                return <CheckCircle className="w-4 h-4 mr-1" />;
            case "PENDING":
                return <Clock className="w-4 h-4 mr-1" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 font-sans">
            <div className="max-w-6xl mx-auto w-full">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 group flex items-center gap-3">
                            <span className="p-2 bg-blue-100 rounded-lg text-blue-600 transition-transform group-hover:scale-110">
                                <DollarSign className="w-7 h-7" />
                            </span>
                            Riwayat Pembayaran Anda
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Pantau dan kelola rincian upah hasil kerja harian Anda.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 flex items-center p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <p className="font-medium text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 lg:sticky lg:top-6 z-10 transition-shadow hover:shadow-md duration-300">
                    <form onSubmit={applyFilters} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full relative group">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                                Tanggal Mulai
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-blue-500 transition-colors" />
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-gray-50 focus:bg-white text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="flex-1 w-full relative group">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                                Tanggal Akhir
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-blue-500 transition-colors" />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-gray-50 focus:bg-white text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="flex-1 w-full relative group">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                                Status Pembayaran
                            </label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-gray-50 focus:bg-white text-gray-700 appearance-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                            </select>
                        </div>

                        <div className="w-full md:w-auto">
                            <button
                                type="submit"
                                className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-transform active:scale-95 shadow-sm hover:shadow-md"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter Data
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <p className="mt-3 text-sm font-medium text-gray-600">Memuat data...</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        ID Pembayaran
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Total Upah
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {payrolls.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <DollarSign className="w-12 h-12 text-gray-300 mb-3" />
                                                <p className="text-lg font-medium text-gray-900">Belum ada riwayat gaji</p>
                                                <p className="text-sm">Tidak ditemukan data payroll dengan filter tersebut.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payrolls.map((pr) => (
                                        <tr key={pr.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{pr.id.substring(0,8)}...
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {pr.date ? format(new Date(pr.date), 'dd MMM yyyy') : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap group-hover:text-green-700 transition-colors">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    Rp {pr.totalAmount?.toLocaleString('id-ID')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(pr.status)} animate-in zoom-in-95 duration-200`}>
                                                    {getStatusIcon(pr.status)}
                                                    {pr.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

