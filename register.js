/* Logika halaman register: validasi input lalu kirim akun baru ke backend PHP. */

const formRegister = document.getElementById("form-register");
const pesanRegister = document.getElementById("pesan");
const tombolDaftar = document.getElementById("tombol-daftar");

/* Kalau datang dari tautan "Daftarkan brand" (?peran=franchisor), pilih otomatis. */
(function terapkanPeranDariTautan() {
  const peran = new URLSearchParams(window.location.search).get("peran");
  if (peran !== ROLE.FRANCHISOR) return;
  const radio = formRegister.querySelector('input[name="role"][value="franchisor"]');
  if (radio) radio.checked = true;
})();

function bacaRole() {
  const terpilih = formRegister.querySelector('input[name="role"]:checked');
  return terpilih ? terpilih.value : "";
}

function bersihkanError() {
  ["nama", "email", "password", "konfirmasi"].forEach((id) => setErrorField(id, ""));
}

function validasiRegister(nilai) {
  const error = {};

  if (nilai.nama.length < 3) {
    error.nama = "Nama lengkap minimal 3 karakter.";
  }

  /* Duplikat email tidak lagi dicek dari localStorage; backend (MySQL) yang memutuskan. */
  if (!nilai.email) {
    error.email = "Email wajib diisi.";
  } else if (!validasiFormatEmail(nilai.email)) {
    error.email = "Format email belum benar, contoh: nama@email.com.";
  }

  if (nilai.password.length < 8) {
    error.password = "Password minimal 8 karakter.";
  } else if (!/[A-Za-z]/.test(nilai.password) || !/[0-9]/.test(nilai.password)) {
    error.password = "Password harus berisi huruf dan angka.";
  }

  if (nilai.konfirmasi !== nilai.password) {
    error.konfirmasi = "Konfirmasi password tidak sama dengan password.";
  }

  if (!ROLE_TERDAFTAR.includes(nilai.role)) {
    error.role = "Pilih salah satu jenis akun.";
  }

  return error;
}

formRegister.addEventListener("submit", async (e) => {
  e.preventDefault();
  sembunyikanPesan(pesanRegister);
  bersihkanError();

  const nilai = {
    nama: document.getElementById("nama").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    konfirmasi: document.getElementById("konfirmasi").value,
    role: bacaRole()
  };

  const error = validasiRegister(nilai);
  if (Object.keys(error).length > 0) {
    Object.keys(error).forEach((kunci) => {
      if (kunci !== "role") setErrorField(kunci, error[kunci]);
    });
    tampilkanPesan(
      pesanRegister,
      "err",
      error.role ? error.role : "Periksa kembali data yang ditandai merah di bawah."
    );
    return;
  }

  tombolDaftar.disabled = true;
  tombolDaftar.textContent = "Memproses...";

  try {
    /* Kirim data ke backend PHP (MySQL). Password dikirim lewat HTTPS/JSON
       dan hanya di-hash di server, tidak disimpan di browser. */
    const respons = await fetch("../api/auth/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: nilai.nama,
        email: nilai.email,
        password: nilai.password,
        role: nilai.role
      })
    });

    let hasil = null;
    try {
      hasil = await respons.json();
    } catch (error) {
      hasil = null;
    }

    if (!respons.ok || !hasil || hasil.success !== true) {
      throw new Error(
        (hasil && hasil.message) || "Pendaftaran gagal. Silakan coba lagi."
      );
    }

    const pengguna = hasil.user || {};
    const infoTunggu = pengguna.status === STATUS.PENDING
      ? " Akun pemilik franchise Anda berstatus menunggu verifikasi admin."
      : "";
    tampilkanPesan(
      pesanRegister,
      "ok",
      "Pendaftaran berhasil untuk " + (pengguna.email || nilai.email) + "." + infoTunggu + " Mengalihkan ke halaman masuk..."
    );
    formRegister.reset();
    setTimeout(() => {
      window.location.href = "login.html?daftar=1";
    }, 1800);
  } catch (kesalahan) {
    const teks = kesalahan instanceof TypeError
      ? "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi."
      : kesalahan.message;
    tampilkanPesan(pesanRegister, "err", teks);
    tombolDaftar.disabled = false;
    tombolDaftar.textContent = "Buat akun";
  }
});

/* Hapus tanda error begitu pengguna mengetik ulang. */
["nama", "email", "password", "konfirmasi"].forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("input", () => setErrorField(id, ""));
});
