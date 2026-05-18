const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

const buildAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchSupirBertugas() {
  const response = await fetch(`${API_BASE_URL}/api/supir-truk/bertugas`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function fetchAllSupir() {
  const response = await fetch(`${API_BASE_URL}/api/supir-truk`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function fetchSupirById(supirId) {
  const response = await fetch(`${API_BASE_URL}/api/supir-truk/${supirId}`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function fetchPengirimanBerlangsung() {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/berlangsung`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function fetchPengirimanSupir(supirId) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/supir/${supirId}`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function fetchPengirimanSupirTruk(supirId) {
  const response = await fetch(`${API_BASE_URL}/api/supir-truk/${supirId}/pengiriman`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function buatPengiriman(data) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman`, {
    method: 'POST',
    headers: {
      ...buildAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function buatPenugasanPengiriman(data) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/assignments`, {
    method: 'POST',
    headers: {
      ...buildAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchMyMandorAssignments() {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/assignments/me/mandor`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function fetchMySupirAssignments() {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/assignments/me/supir`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function fetchMySupirAssignmentRiwayat(tanggalMulai, tanggalSelesai) {
  const params = new URLSearchParams();
  if (tanggalMulai) params.set('tanggalMulai', tanggalMulai);
  if (tanggalSelesai) params.set('tanggalSelesai', tanggalSelesai);
  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/assignments/me/supir/riwayat${query ? `?${query}` : ''}`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function fetchMandorAssignmentsBySupirId(supirId) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/assignments/me/mandor/supir/${supirId}`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function fetchMandorSupirProfileByEmail(supirEmail) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/assignments/me/mandor/supir-email/${encodeURIComponent(supirEmail)}`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function updateAssignmentStatus(assignmentId, status) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/assignments/${assignmentId}/status`, {
    method: 'PUT',
    headers: {
      ...buildAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
}

export async function updateAssignmentApproval(assignmentId, approval, note) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/assignments/${assignmentId}/approval`, {
    method: 'PUT',
    headers: {
      ...buildAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ approval, note }),
  });
  return response.json();
}

export async function ubahStatusPengiriman(pengirimanId, data) {
  const response = await fetch(`${API_BASE_URL}/api/pengiriman/${pengirimanId}/status`, {
    method: 'PUT',
    headers: {
      ...buildAuthHeaders(),
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
      ...buildAuthHeaders(),
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
      ...buildAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mandorId, alasanPenolakan }),
  });
  return response.json();
}

export async function fetchUserByUsername(username) {
  const response = await fetch(`${API_BASE_URL}/users/username/${encodeURIComponent(username)}`, {
    headers: buildAuthHeaders(),
  });
  if (response.status === 404) return null;
  return response.json();
}

export async function fetchApprovedPengirimanAdmin(filters = {}) {
  const params = new URLSearchParams();
  if (filters.mandorName) params.set('mandorName', filters.mandorName);
  if (filters.tanggalMulai) params.set('tanggalMulai', filters.tanggalMulai);
  if (filters.tanggalSelesai) params.set('tanggalSelesai', filters.tanggalSelesai);
  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/pengiriman/approved${query ? `?${query}` : ''}`, {
    headers: buildAuthHeaders(),
  });
  return response.json();
}

export async function approvePengirimanFinalAdmin(pengirimanId, adminId) {
  const response = await fetch(`${API_BASE_URL}/api/admin/pengiriman/${pengirimanId}/approve`, {
    method: 'PUT',
    headers: {
      ...buildAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ adminId }),
  });
  return response.json();
}

export async function rejectPengirimanFinalAdmin(pengirimanId, adminId, alasanPenolakan) {
  const response = await fetch(`${API_BASE_URL}/api/admin/pengiriman/${pengirimanId}/reject`, {
    method: 'PUT',
    headers: {
      ...buildAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ adminId, alasanPenolakan }),
  });
  return response.json();
}

export async function rejectPengirimanFinalParsialAdmin(
  pengirimanId,
  adminId,
  muatanKgDiakui,
  alasanPenolakan,
) {
  const response = await fetch(`${API_BASE_URL}/api/admin/pengiriman/${pengirimanId}/reject-partial`, {
    method: 'PUT',
    headers: {
      ...buildAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ adminId, muatanKgDiakui, alasanPenolakan }),
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
