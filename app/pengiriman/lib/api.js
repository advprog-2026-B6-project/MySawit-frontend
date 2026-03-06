const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export async function fetchSupirBertugas() {
  const response = await fetch(`${API_BASE_URL}/api/supir-truk/bertugas`);
  return response.json();
}

export async function fetchAllSupir() {
  const response = await fetch(`${API_BASE_URL}/api/supir-truk`);
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
