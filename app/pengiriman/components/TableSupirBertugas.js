"use client";

export default function TableSupirBertugas({ data, loading }) {
  if (loading) {
    return <div className="py-6 text-sm text-muted-foreground">Memuat data supir...</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border" data-testid="table-supir-bertugas">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">ID</th>
            <th className="px-4 py-3 text-left font-semibold">Nama</th>
            <th className="px-4 py-3 text-left font-semibold">No. Telepon</th>
            <th className="px-4 py-3 text-left font-semibold">Plat Nomor Truk</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data && data.length > 0 ? (
            data.map((supir) => (
              <tr key={supir.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-xs text-muted-foreground">{supir.id}</td>
                <td className="px-4 py-3 font-medium">{supir.nama}</td>
                <td className="px-4 py-3">{supir.nomorTelepon}</td>
                <td className="px-4 py-3">{supir.platNomorTruk}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      supir.sedangBertugas
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {supir.sedangBertugas ? "Bertugas" : "Tidak Bertugas"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada supir bertugas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
