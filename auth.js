const FC_USERS_KEY = "findchisee.users";
const FC_SESSION_KEY = "findchisee.session";

/* ---------- Enum ---------- */

const ROLE = {
  FRANCHISEE: "franchisee",
  FRANCHISOR: "franchisor",
  ADMIN: "admin"
};

const ROLE_LABEL = {
  franchisee: "Calon Franchisee",
  franchisor: "Pemilik Franchise",
  admin: "Admin"
};

/* Jenis akun yang boleh dipilih sendiri lewat form register.
   Admin sengaja tidak ada di sini: peran admin tidak boleh didapat
   hanya dengan memilih opsi role pada form registrasi. */
const ROLE_TERDAFTAR = [ROLE.FRANCHISEE, ROLE.FRANCHISOR];

const STATUS = {
  AKTIF: "aktif",
  PENDING: "pending",
  NONAKTIF: "nonaktif"
};

const STATUS_LABEL = {
  aktif: "Aktif",
  pending: "Menunggu verifikasi",
  nonaktif: "Nonaktif"
};

const PBKDF2_ITERATIONS = 150000;

/* ---------- Kriptografi ---------- */

function kriptoTersedia() {
  return Boolean(window.crypto && window.crypto.subtle && window.crypto.getRandomValues);
}

const PESAN_KRIPTO_TIDAK_ADA =
  "Browser ini tidak mendukung Web Crypto, jadi password tidak bisa di-hash dengan aman. " +
  "Jalankan halaman lewat server lokal (mis. http://localhost:8000) pada browser modern.";

function bytesKeBase64(bytes) {
  let teks = "";
  for (let i = 0; i < bytes.length; i += 1) teks += String.fromCharCode(bytes[i]);
  return btoa(teks);
}

function base64KeBytes(base64) {
  const biner = atob(base64);
  const bytes = new Uint8Array(biner.length);
  for (let i = 0; i < biner.length; i += 1) bytes[i] = biner.charCodeAt(i);
  return bytes;
}

async function hitungHash(password, saltBytes, iterasi) {
  const encoder = new TextEncoder();
  const kunci = await window.crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bit = await window.crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: iterasi, hash: "SHA-256" },
    kunci,
    256
  );
  return bytesKeBase64(new Uint8Array(bit));
}

/* Rekam password yang disimpan: { algo, iterasi, salt, hash } */
async function buatRekamPassword(password) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  return {
    algo: "PBKDF2-SHA256",
    iterasi: PBKDF2_ITERATIONS,
    salt: bytesKeBase64(salt),
    hash: await hitungHash(password, salt, PBKDF2_ITERATIONS)
  };
}

/* Perbandingan waktu-konstan sederhana supaya tidak mudah ditebak lewat timing. */
function bandingkanKonstan(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let beda = 0;
  for (let i = 0; i < a.length; i += 1) beda |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return beda === 0;
}

async function cocokkanPassword(password, rekam) {
  if (!rekam || !rekam.salt || !rekam.hash) return false;
  const iterasi = Number(rekam.iterasi) || PBKDF2_ITERATIONS;
  const hash = await hitungHash(password, base64KeBytes(rekam.salt), iterasi);
  return bandingkanKonstan(hash, rekam.hash);
}

/* ---------- Penyimpanan pengguna ---------- */

function bacaPengguna() {
  try {
    const mentah = localStorage.getItem(FC_USERS_KEY);
    const data = mentah ? JSON.parse(mentah) : [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function simpanPengguna(daftar) {
  localStorage.setItem(FC_USERS_KEY, JSON.stringify(daftar));
}

function normalisasiEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function cariPenggunaEmail(email) {
  const kunci = normalisasiEmail(email);
  return bacaPengguna().find((u) => u.email.toLowerCase() === kunci) || null;
}

function cariPenggunaId(id) {
  return bacaPengguna().find((u) => u.id === id) || null;
}

function buatIdPengguna() {
  return "u-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function validasiFormatEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(email || "").trim());
}

function statusAwalUntuk(role) {
  /* Pemilik franchise harus diverifikasi admin dulu, calon franchisee langsung aktif. */
  return role === ROLE.FRANCHISOR ? STATUS.PENDING : STATUS.AKTIF;
}

/* ---------- Register ---------- */

/* Membuat akun baru. Role hanya boleh dari ROLE_TERDAFTAR. */
async function daftarPengguna({ nama, email, password, role }) {
  if (!kriptoTersedia()) throw new Error(PESAN_KRIPTO_TIDAK_ADA);
  if (!ROLE_TERDAFTAR.includes(role)) {
    throw new Error("Jenis akun tidak valid. Pilih calon franchisee atau pemilik franchise.");
  }
  if (cariPenggunaEmail(email)) {
    throw new Error("Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.");
  }

  const pengguna = {
    id: buatIdPengguna(),
    nama: String(nama).trim(),
    email: normalisasiEmail(email),
    password: await buatRekamPassword(password),
    role: role,
    status: statusAwalUntuk(role),
    terdaftar: new Date().toISOString()
  };

  const daftar = bacaPengguna();
  daftar.push(pengguna);
  simpanPengguna(daftar);
  return pengguna;
}

/* ---------- Login & sesi ---------- */

async function masuk(email, password) {
  if (!kriptoTersedia()) throw new Error(PESAN_KRIPTO_TIDAK_ADA);
  const pengguna = cariPenggunaEmail(email);

  /* Pesan sengaja sama untuk email tidak ada dan password salah. */
  if (!pengguna) throw new Error("Email atau password salah.");
  if (pengguna.status === STATUS.NONAKTIF) {
    throw new Error("Akun ini sedang dinonaktifkan. Hubungi admin Findchisee.");
  }
  if (!(await cocokkanPassword(password, pengguna.password))) {
    throw new Error("Email atau password salah.");
  }

  simpanSesi(pengguna);
  return pengguna;
}

function simpanSesi(pengguna) {
  /* Simpan snapshot pengguna (tanpa password/hash) agar sesi hasil login
     MySQL tidak bergantung pada daftar akun di localStorage. */
  const { password, ...aman } = pengguna;
  sessionStorage.setItem(FC_SESSION_KEY, JSON.stringify({
    userId: pengguna.id,
    role: pengguna.role,
    masukPada: new Date().toISOString(),
    pengguna: aman
  }));
}

function ambilSesi() {
  try {
    const mentah = sessionStorage.getItem(FC_SESSION_KEY);
    return mentah ? JSON.parse(mentah) : null;
  } catch (error) {
    return null;
  }
}

/* Ambil pengguna yang sedang masuk. Sesi dihapus bila akun sudah tidak ada/nonaktif. */
function getCurrentUser() {
  const sesi = ambilSesi();
  if (!sesi) return null;
  /* Sesi login MySQL menyimpan snapshot pengguna; sesi lama memakai userId. */
  const pengguna = sesi.pengguna || cariPenggunaId(sesi.userId);
  if (!pengguna || pengguna.status === STATUS.NONAKTIF) {
    hapusSesi();
    return null;
  }
  return pengguna;
}

function hapusSesi() {
  sessionStorage.removeItem(FC_SESSION_KEY);
}

function keluar(arahkanKeLogin = true) {
  hapusSesi();
  if (arahkanKeLogin) window.location.href = "login.html";
}

/* ---------- Bootstrap admin pertama ---------- */

function adaAdmin() {
  return bacaPengguna().some((u) => u.role === ROLE.ADMIN);
}

/* Membuat akun admin pertama. Hanya bisa dipakai bila belum ada admin sama sekali,
   dan datanya diisi sendiri oleh pemakai (tidak ada kredensial tetap di kode). */
async function buatAdminPertama({ nama, email, password }) {
  if (!kriptoTersedia()) throw new Error(PESAN_KRIPTO_TIDAK_ADA);
  if (adaAdmin()) throw new Error("Akun admin sudah tersedia. Silakan masuk sebagai admin.");
  if (cariPenggunaEmail(email)) throw new Error("Email ini sudah terdaftar.");

  const admin = {
    id: buatIdPengguna(),
    nama: String(nama).trim(),
    email: normalisasiEmail(email),
    password: await buatRekamPassword(password),
    role: ROLE.ADMIN,
    status: STATUS.AKTIF,
    terdaftar: new Date().toISOString()
  };

  const daftar = bacaPengguna();
  daftar.push(admin);
  simpanPengguna(daftar);
  return admin;
}

/* ---------- Manajemen user (admin) ---------- */

function statistikPengguna() {
  const daftar = bacaPengguna();
  return {
    total: daftar.length,
    franchisee: daftar.filter((u) => u.role === ROLE.FRANCHISEE).length,
    franchisor: daftar.filter((u) => u.role === ROLE.FRANCHISOR).length,
    admin: daftar.filter((u) => u.role === ROLE.ADMIN).length,
    aktif: daftar.filter((u) => u.status === STATUS.AKTIF).length,
    pending: daftar.filter((u) => u.status === STATUS.PENDING).length,
    nonaktif: daftar.filter((u) => u.status === STATUS.NONAKTIF).length
  };
}

function ubahStatusPengguna(id, status) {
  if (!Object.values(STATUS).includes(status)) throw new Error("Status tidak dikenal.");
  const daftar = bacaPengguna();
  const pengguna = daftar.find((u) => u.id === id);
  if (!pengguna) throw new Error("Pengguna tidak ditemukan.");
  pengguna.status = status;
  simpanPengguna(daftar);
  return pengguna;
}

/* ---------- Penjaga halaman ---------- */

/* Panggil di awal halaman yang butuh login. Kembalikan user atau null (sambil mengalihkan). */
function wajibMasuk(peranDiizinkan = []) {
  const pengguna = getCurrentUser();
  if (!pengguna) {
    const kembali = window.location.pathname.split("/").pop() + window.location.search;
    window.location.replace("login.html?next=" + encodeURIComponent(kembali));
    return null;
  }
  if (peranDiizinkan.length && !peranDiizinkan.includes(pengguna.role)) {
    window.location.replace("dashboard.html");
    return null;
  }
  return pengguna;
}

/* ---------- Navigasi status masuk ---------- */

/* Isi <span id="nav-auth"> dengan tombol Masuk / Dashboard + Keluar. */
function renderNavAuth() {
  const slot = document.getElementById("nav-auth");
  if (!slot) return;
  const pengguna = getCurrentUser();

  if (!pengguna) {
    slot.innerHTML = '<a class="btn btn-solid" href="login.html">Masuk</a>';
    return;
  }

  slot.innerHTML =
    '<a class="btn btn-solid" href="dashboard.html">Dashboard</a>' +
    '<button type="button" class="btn btn-outline btn-nav" id="nav-logout">Keluar</button>';

  const tombolKeluar = document.getElementById("nav-logout");
  if (tombolKeluar) {
    tombolKeluar.addEventListener("click", () => {
      hapusSesi();
      window.location.href = "login.html";
    });
  }
}
