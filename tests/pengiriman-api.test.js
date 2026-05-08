describe("pengiriman api client", () => {
  const originalFetch = global.fetch;

  const loadApi = async () => {
    jest.resetModules();
    return await import("../app/pengiriman/lib/api");
  };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://example.test";
    global.fetch = jest.fn();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) => (key === "token" ? "test-token" : null)),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
  });

  test("fetchAllSupir attaches authorization header", async () => {
    const { fetchAllSupir } = await loadApi();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValueOnce(JSON.stringify({ success: true, data: [] })),
    });

    await fetchAllSupir();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://example.test/api/supir-truk",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  test("handles 403 without json body", async () => {
    const { fetchSupirBertugas } = await loadApi();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      text: jest.fn().mockResolvedValueOnce(""),
    });

    const result = await fetchSupirBertugas();
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/akses ditolak/i);
  });

  test("fetchPengirimanBerlangsung returns parsed data", async () => {
    const { fetchPengirimanBerlangsung } = await loadApi();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValueOnce(
        JSON.stringify({ success: true, data: [{ id: "p1" }] }),
      ),
    });

    const result = await fetchPengirimanBerlangsung();
    expect(result.data).toHaveLength(1);
  });

  test("buatPengiriman posts payload", async () => {
    const { buatPengiriman } = await loadApi();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValueOnce(
        JSON.stringify({ success: true, data: { id: "p1" } }),
      ),
    });

    await buatPengiriman({
      mandorId: 1,
      supirTrukId: "supir-1",
      muatanKg: 20,
      tujuan: "Gudang",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://example.test/api/pengiriman",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          mandorId: 1,
          supirTrukId: "supir-1",
          muatanKg: 20,
          tujuan: "Gudang",
        }),
      }),
    );
  });
});
