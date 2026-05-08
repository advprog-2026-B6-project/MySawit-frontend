const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8080';

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const requestJson = async (url, options = {}) => {
  const headers = {
    ...(options.headers || {}),
    ...getAuthHeaders(),
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    return {
      success: false,
      message:
        'Backend belum bisa dijangkau. Pastikan server backend berjalan di ' +
        API_BASE_URL +
        '.',
      error: error?.message,
    };
  }

  const text = await response.text();
  let parsed = null;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        success: false,
        message: response.status === 403
          ? 'Akses ditolak. Silakan login ulang.'
          : 'Respons server tidak valid.',
      };
    }
  }

  if (!response.ok) {
    return parsed || {
      success: false,
      message: response.status === 403
        ? 'Akses ditolak. Silakan login ulang.'
        : response.statusText || 'Request gagal.',
    };
  }

  return parsed || { success: true, data: null };
};

export async function fetchSupirBertugas() {
  return requestJson(`${API_BASE_URL}/api/supir-truk/bertugas`);
}

export async function fetchAllSupir() {
  return requestJson(`${API_BASE_URL}/api/supir-truk`);
}

export async function fetchSupirById(supirId) {
  return requestJson(`${API_BASE_URL}/api/supir-truk/${supirId}`);
}

export async function fetchPengirimanBerlangsung() {
  return requestJson(`${API_BASE_URL}/api/pengiriman/berlangsung`);
}

export async function fetchPengirimanSupir(supirId) {
  return requestJson(`${API_BASE_URL}/api/pengiriman/supir/${supirId}`);
}

export async function fetchPengirimanSupirTruk(supirId) {
  return requestJson(`${API_BASE_URL}/api/supir-truk/${supirId}/pengiriman`);
}

export async function buatPengiriman(data) {
  return requestJson(`${API_BASE_URL}/api/pengiriman`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function ubahStatusPengiriman(pengirimanId, data) {
  return requestJson(`${API_BASE_URL}/api/pengiriman/${pengirimanId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function approvePengiriman(pengirimanId, mandorId) {
  return requestJson(`${API_BASE_URL}/api/pengiriman/${pengirimanId}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mandorId }),
  });
}

export async function rejectPengiriman(pengirimanId, mandorId, alasanPenolakan) {
  return requestJson(`${API_BASE_URL}/api/pengiriman/${pengirimanId}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mandorId, alasanPenolakan }),
  });
}

export async function fetchPengirimanDisetujui({
  mandorName,
  tanggalMulai,
  tanggalSelesai,
} = {}) {
  const params = new URLSearchParams();
  if (mandorName) params.append('mandorName', mandorName);
  if (tanggalMulai) params.append('tanggalMulai', tanggalMulai);
  if (tanggalSelesai) params.append('tanggalSelesai', tanggalSelesai);

  const query = params.toString();
  const url = `${API_BASE_URL}/api/admin/pengiriman/approved${query ? `?${query}` : ''}`;
  return requestJson(url);
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID');
}

export function validateMuatan(muatan) {
  if (muatan > 400) {
    return { valid: false, message: 'Muatan tidak boleh melebihi 400 kg!' };
  }
  if (muatan <= 0) {
    return { valid: false, message: 'Muatan harus lebih dari 0 kg!' };
  }
  return { valid: true, message: '' };
}
