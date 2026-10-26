/* Helper tampilan bersama untuk semua halaman Findchisee. */

/* Format angka rupiah menjadi teks singkat. */
function formatRupiah(angka) {
  if (angka >= 1000000000) return "Rp " + (angka / 1000000000).toLocaleString("id-ID") + " miliar";
  if (angka >= 1000000) return "Rp " + (angka / 1000000).toLocaleString("id-ID") + " juta";
  return "Rp " + angka.toLocaleString("id-ID");
}

/* Amankan teks yang berasal dari input pengguna sebelum dimasukkan ke innerHTML. */
function escapeHtml(teks) {
  const peta = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(teks ?? "").replace(/[&<>"']/g, (c) => peta[c]);
}

/* Tampilkan pesan hasil aksi pada elemen ber-class "alert". */
function tampilkanPesan(elemen, jenis, teks) {
  if (!elemen) return;
  elemen.className = "alert alert-" + jenis;
  elemen.textContent = teks;
  elemen.hidden = false;
}

function sembunyikanPesan(elemen) {
  if (!elemen) return;
  elemen.textContent = "";
  elemen.hidden = true;
}

/* Tampilkan pesan error di bawah sebuah input. */
function setErrorField(inputId, pesan) {
  const slot = document.getElementById(inputId + "-error");
  const input = document.getElementById(inputId);
  if (slot) {
    slot.textContent = pesan || "";
    slot.hidden = !pesan;
  }
  if (input) {
    if (pesan) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }
}

/* Ubah tanggal ISO menjadi format tanggal Indonesia. */
function formatTanggal(iso) {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return "-";
  return tanggal.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

/* Isi menu kanan header (Masuk / Dashboard + Keluar) setelah semua skrip siap. */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderNavAuth === "function") renderNavAuth();
});
