import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WagesPage from './page'; // Sesuaikan dengan nama file FE kamu

// Mock fungsi fetch global (karena kita tidak mau nembak backend beneran saat testing)
global.fetch = jest.fn();

describe('Halaman Pengaturan Upah Admin', () => {
  beforeEach(() => {
    // Reset mock sebelum setiap test berjalan
    fetch.mockClear();
  });

  it('harus merender komponen dengan benar', () => {
    render(<WagesPage />);
    
    // Pastikan judul atau elemen utama muncul di layar
    expect(screen.getByText(/Pengaturan Upah/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simpan/i })).toBeInTheDocument();
  });

  it('harus bisa mengisi form dan melakukan submit data (Sukses)', async () => {
    // Simulasi respons backend sukses (200 OK)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Sukses' }),
    });

    render(<WagesPage />);

    // Simulasi user mengetik di input form (Sesuaikan placeholder/label-nya dengan FE-mu)
    const inputBuruh = screen.getByLabelText(/Upah Buruh/i);
    await userEvent.clear(inputBuruh);
    await userEvent.type(inputBuruh, '1.50');

    // Simulasi klik tombol submit
    const submitButton = screen.getByRole('button', { name: /Simpan/i });
    fireEvent.click(submitButton);

    // Tunggu sampai loading selesai dan pastikan fetch dipanggil dengan data yang benar
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      // Memastikan URL endpoint dan method yang ditembak sudah benar
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/wages'),
        expect.objectContaining({
          method: 'PUT', // atau POST, sesuaikan dengan FE-mu
        })
      );
    });
  });

  it('harus menangani error jika server backend gagal (Error 500)', async () => {
    // Simulasi respons backend error
    fetch.mockRejectedValueOnce(new Error('Server Down'));

    render(<WagesPage />);
    
    const submitButton = screen.getByRole('button', { name: /Simpan/i });
    fireEvent.click(submitButton);

    // Pastikan pesan error muncul di layar (jika FE-mu menampilkan alert/pesan error)
    await waitFor(() => {
      expect(screen.getByText(/Gagal menyimpan/i)).toBeInTheDocument();
    });
  });
});