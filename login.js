/* Logika halaman login: validasi, pesan gagal, alihkan ke dashboard sesuai peran. */

const formLogin = document.getElementById("form-login");
const pesanLogin = document.getElementById("pesan");
const tombolMasuk = document.getElementById("tombol-masuk");

const paramsLogin = new URLSearchParams(window.location.search);

/* Tujuan setelah masuk: halaman yang diminta tadi (hanya nama file lokal), kalau tidak ada ke dashboard. */
function tujuanSetelahMasuk() {
  const next = paramsLogin.get("next");
  if (next && !next.includes(":") && !next.startsWith("//")) return next;
  return "dashboard.html";
}

/* Kalau sudah masuk, jangan tampilkan form login lagi. */
(function alihkanBilaSudahMasuk() {
  const sudahMasuk = getCurrentUser();
  const baruDaftar = paramsLogin.get("daftar") === "1";
  if (sudahMasuk && !baruDaftar) window.location.replace(tujuanSetelahMasuk());
})();

if (paramsLogin.get("daftar") === "1") {
  tampilkanPesan(pesanLogin, "ok", "Pendaftaran berhasil. Silakan masuk dengan email dan password Anda.");
}

function validasiLogin(nilai) {
  const error = {};
  if (!nilai.email) error.email = "Email wajib diisi.";
  else if (!validasiFormatEmail(nilai.email)) error.email = "Format email belum benar.";
  if (!nilai.password) error.password = "Password wajib diisi.";
  return error;
}

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  sembunyikanPesan(pesanLogin);
  setErrorField("email", "");
  setErrorField("password", "");

  const nilai = {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  };

  const error = validasiLogin(nilai);
  if (Object.keys(error).length > 0) {
    Object.keys(error).forEach((kunci) => setErrorField(kunci, error[kunci]));
    tampilkanPesan(pesanLogin, "err", "Periksa kembali email dan password Anda.");
    return;
  }

  tombolMasuk.disabled = true;
  tombolMasuk.textContent = "Memeriksa...";

  try {
    /* Verifikasi kredensial di backend PHP (MySQL), bukan localStorage. */
    const respons = await fetch("../api/auth/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: nilai.email,
        password: nilai.password
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
        (hasil && hasil.message) || "Login gagal. Silakan coba lagi."
      );
    }

    const data = hasil.user || {};
    /* Sesuaikan bentuk data backend dengan yang dipakai dashboard & auth.js. */
    const pengguna = {
      id: data.id,
      nama: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      terdaftar: data.created_at
    };

    simpanSesi(pengguna);
    tampilkanPesan(pesanLogin, "ok", "Login berhasil. Mengalihkan ke dashboard...");
    window.location.href = tujuanSetelahMasuk();
  } catch (kesalahan) {
    const teks = kesalahan instanceof TypeError
      ? "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi."
      : kesalahan.message;
    tampilkanPesan(pesanLogin, "err", teks);
    tombolMasuk.disabled = false;
    tombolMasuk.textContent = "Masuk";
  }
});

["email", "password"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => setErrorField(id, ""));
});

/* ---------- Blok admin pertama ---------- */

const setupAdmin = document.getElementById("setup-admin");
const formAdmin = document.getElementById("form-admin");
const tombolAdmin = document.getElementById("tombol-admin");

if (adaAdmin()) {
  setupAdmin.hidden = true;
} else {
  setupAdmin.hidden = false;
  setupAdmin.open = true;
}

formAdmin.addEventListener("submit", async (e) => {
  e.preventDefault();
  sembunyikanPesan(pesanLogin);
  ["admin-nama", "admin-email", "admin-password"].forEach((id) => setErrorField(id, ""));

  const nilai = {
    nama: document.getElementById("admin-nama").value.trim(),
    email: document.getElementById("admin-email").value.trim(),
    password: document.getElementById("admin-password").value
  };

  const error = {};
  if (nilai.nama.length < 3) error["admin-nama"] = "Nama minimal 3 karakter.";
  if (!validasiFormatEmail(nilai.email)) error["admin-email"] = "Format email belum benar.";
  else if (cariPenggunaEmail(nilai.email)) error["admin-email"] = "Email ini sudah terdaftar.";
  if (nilai.password.length < 8) error["admin-password"] = "Password minimal 8 karakter.";
  else if (!/[A-Za-z]/.test(nilai.password) || !/[0-9]/.test(nilai.password)) {
    error["admin-password"] = "Password harus berisi huruf dan angka.";
  }

  if (Object.keys(error).length > 0) {
    Object.keys(error).forEach((kunci) => setErrorField(kunci, error[kunci]));
    tampilkanPesan(pesanLogin, "err", "Periksa kembali data admin yang ditandai merah.");
    return;
  }

  tombolAdmin.disabled = true;
  tombolAdmin.textContent = "Membuat...";

  try {
    const admin = await buatAdminPertama(nilai);
    simpanSesi(admin);
    tampilkanPesan(pesanLogin, "ok", "Akun admin pertama dibuat. Mengalihkan ke dashboard admin...");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1200);
  } catch (kesalahan) {
    tampilkanPesan(pesanLogin, "err", kesalahan.message);
    tombolAdmin.disabled = false;
    tombolAdmin.textContent = "Buat akun admin";
  }
});

["admin-nama", "admin-email", "admin-password"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => setErrorField(id, ""));
});
