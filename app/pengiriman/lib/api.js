const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export async function fetchSupirBertugas() {
  const response = await fetch(`${API_BASE_URL}/api/supir-truk/bertugas`);
  return response.json();
}

export async function fetchAllSupir() {
  const response = await fetch(`${API_BASE_URL}/api/supir-truk`);
  return response.json();
}

export async function fetchSupirById(supirId) {
  const response = await fetch(`${API_BASE_URL}/api/supir-truk/${supirId}`);
  return response.json();
}

export async function fetchPengirimanBerlangsung() {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/berlangsung`);
  return response.json();
}

export async function fetchPengirimanSupir(supirId) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/supir/${supirId}`);
  return response.json();
}

export async function fetchPengirimanSupirTruk(supirId) {
  const response = await fetch(`${API_BASE_URL}/api/supir-truk/${supirId}/pengiriman`);
  return response.json();
}

export async function buatPengiriman(data) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function ubahStatusPengiriman(pengirimanId, data) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/${pengirimanId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function approvePengiriman(pengirimanId, mandorId) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/${pengirimanId}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mandorId }),
  });
  return response.json();
}

export async function rejectPengiriman(pengirimanId, mandorId, alasanPenolakan) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/${pengirimanId}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mandorId, alasanPenolakan }),
  });
  return response.json();
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
  const response = await fetch(url);
  return response.json();
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
