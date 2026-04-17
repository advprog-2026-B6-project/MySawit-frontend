"use client";

import { useState } from "react";
import { format } from "date-fns";
import { User, Search, Calendar, FileText, CheckCircle, Clock, Save, History, Scale } from "lucide-react";

export default function AdminPayrollPage() {
    const [activeTab, setActiveTab] = useState("history"); // "history" or "create"
    
    // States for History
    const [searchUsername, setSearchUsername] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [payrolls, setPayrolls] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState("");

    // States for Create
    const [createForm, setCreateForm] = useState({
        username: "",
        startDate: "",
        endDate: "",
        totalKg: ""
    });
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [createMessage, setCreateMessage] = useState({ type: "", text: "" });

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchUsername) {
            setHistoryError("Username harus diisi untuk mencari histori.");
            return;
        }

        setLoadingHistory(true);
        setHistoryError("");
        setPayrolls([]);

        try {
            const token = localStorage.getItem("token");
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append("startDate", startDate);
            if (endDate) queryParams.append("endDate", endDate);

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/payroll/user/${searchUsername}?${queryParams.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setPayrolls(data);
            } else {
                setHistoryError("Gagal mengambil histori payroll. Pastikan username benar dan Anda memiliki akses admin.");
            }
        } catch (err) {
            setHistoryError("Gagal terhubung ke server.");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setLoadingCreate(true);
        setCreateMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");
            const payload = {
                username: createForm.username,
                startDate: createForm.startDate,
                endDate: createForm.endDate,
                totalKg: parseFloat(createForm.totalKg)
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/payroll`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setCreateMessage({ type: "success", text: `Payroll berhasil dibuat dengan total: Rp ${data.totalAmount?.toLocaleString('id-ID')}` });
                setCreateForm({ username: "", startDate: "", endDate: "", totalKg: "" });
            } else {
                setCreateMessage({ type: "error", text: "Gagal membuat payroll. Validasi input atau otoritas gagal." });
            }
        } catch (err) {
            setCreateMessage({ type: "error", text: "Gagal terhubung ke server." });
        } finally {
            setLoadingCreate(false);
        }
    };

    const handleCreateChange = (e) => {
        setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PAID": return "bg-green-100 text-green-800 border-green-200";
            case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 font-sans">
            <div className="max-w-6xl mx-auto w-full">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 group flex items-center gap-3">
                            <span className="p-2 bg-blue-100 rounded-lg text-blue-600 transition-transform group-hover:scale-110">
                                <FileText className="w-7 h-7" />
                            </span>
                            Manajemen Payroll Admin
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Pantau histori pembayaran pekerja dan buat pembayaran baru.
                        </p>
                    </div>
                </div>

                <div className="flex space-x-2 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "history" 
                            ? "border-blue-600 text-blue-600" 
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <History className="w-4 h-4 mr-2" />
                        Histori Payroll Pengguna
                    </button>
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "create" 
                            ? "border-blue-600 text-blue-600" 
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Buat Payroll Baru
                    </button>
                </div>

                {activeTab === "history" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 lg:sticky lg:top-6 z-10 transition-shadow hover:shadow-md duration-300">
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full relative group">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={searchUsername}
                                            onChange={(e) => setSearchUsername(e.target.value)}
                                            placeholder="Masukkan username pekerja"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-gray-50 focus:bg-white text-gray-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 w-full relative group">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                                        Tanggal Mulai
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-blue-500 transition-colors" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
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
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-gray-50 focus:bg-white text-gray-700"
                                        />
                                    </div>
                                </div>

                                <div className="w-full md:w-auto">
                                    <button
                                        type="submit"
                                        disabled={loadingHistory}
                                        className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-transform active:scale-95 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <Search className="w-4 h-4 mr-2" />
                                        {loadingHistory ? "Mencari..." : "Cari Histori"}
                                    </button>
                                </div>
                            </form>
                            
                            {historyError && (
                                <p className="mt-4 text-sm text-red-600 font-medium">{historyError}</p>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                            {loadingHistory && (
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
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Upah</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {payrolls.length === 0 && !loadingHistory ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                    Belum ada data untuk pencarian ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            payrolls.map((pr) => (
                                                <tr key={pr.id} className="hover:bg-gray-50/80 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{pr.id.substring(0,8)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pr.username}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pr.date ? format(new Date(pr.date), 'dd MMM yyyy') : '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">Rp {pr.totalAmount?.toLocaleString('id-ID')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(pr.status)}`}>
                                                            {pr.status === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
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
                )}

                {activeTab === "create" && (
                    <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Formulir Pembuatan Payroll</h2>
                        
                        {createMessage.text && (
                            <div className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center ${
                                createMessage.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
                            }`}>
                                {createMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleCreateSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username Pekerja</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={createForm.username}
                                        onChange={handleCreateChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai (Basis Hitung)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={createForm.startDate}
                                            onChange={handleCreateChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={createForm.endDate}
                                            onChange={handleCreateChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Massa Dipanen/Diolah (Kg)</label>
                                <div className="relative">
                                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="totalKg"
                                        value={createForm.totalKg}
                                        onChange={handleCreateChange}
                                        placeholder="Contoh: 1500.5"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loadingCreate}
                                className="w-full py-4 mt-4 bg-green-600 text-white font-bold rounded-xl shadow hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loadingCreate ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : (
                                    <Save className="w-5 h-5 mr-2" />
                                )}
                                {loadingCreate ? "Memproses..." : "Buat & Hitung Payroll"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
